/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import SaleModel from "@/lib/models/Sale";
import ExpenseModel from "@/lib/models/Expense";
import InventoryModel from "@/lib/models/Inventory";
import { DashboardMetrics, APIResponse } from "@/lib/models/types";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    // Connect to database
    await connectToDatabase();

    // Get query parameters for date filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = startDate;
    }
    if (endDate) {
      dateFilter.$lte = endDate;
    }

    // Build query filters with user ID (convert to ObjectId)
    const userObjectId = new mongoose.Types.ObjectId(user.userId);
    const salesFilter: any = { userId: userObjectId };
    const expensesFilter: any = { userId: userObjectId };

    if (Object.keys(dateFilter).length > 0) {
      salesFilter.date = dateFilter;
      expensesFilter.date = dateFilter;
    }

    // Aggregate sales data
    const salesAggregation = await SaleModel.aggregate([
      { $match: salesFilter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Aggregate expenses data
    const expensesAggregation = await ExpenseModel.aggregate([
      { $match: expensesFilter },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get category breakdown for expenses
    const categoryAggregation = await ExpenseModel.aggregate([
      { $match: expensesFilter },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    // Extract totals
    const totalSales = salesAggregation[0]?.totalSales || 0;
    const totalExpenses = expensesAggregation[0]?.totalExpenses || 0;
    const netProfit = totalSales - totalExpenses;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    // Calculate category percentages
    const categoryData = categoryAggregation.map((cat) => ({
      category: cat._id,
      amount: cat.amount,
      percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0,
    }));

    // Get inventory metrics
    const inventoryAggregation = await InventoryModel.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalInventoryValue: {
            $sum: { $multiply: ["$stock", "$costPrice"] },
          },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ["$stock", "$reorderLevel"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const inventoryMetrics = inventoryAggregation[0] || {
      totalProducts: 0,
      totalInventoryValue: 0,
      lowStockItems: 0,
    };

    // Get chart data (daily aggregation for the last 30 days or specified range)
    const chartStartDate =
      startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    const chartEndDate = endDate || new Date().toISOString().split("T")[0];

    const chartData = await generateChartData(
      chartStartDate,
      chartEndDate,
      userObjectId
    );

    // Get recent activity (last 10 items)
    const recentActivity = await generateRecentActivity(userObjectId);

    const metrics: DashboardMetrics = {
      totalSales,
      totalExpenses,
      netProfit,
      profitMargin: Math.round(profitMargin * 100) / 100, // Round to 2 decimal places
      totalInventoryValue: inventoryMetrics.totalInventoryValue,
      lowStockItems: inventoryMetrics.lowStockItems,
      totalProducts: inventoryMetrics.totalProducts,
      chartData,
      categoryData,
      recentActivity,
    };

    const response: APIResponse<DashboardMetrics> = {
      success: true,
      data: metrics,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);

    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        code: "METRICS_FETCH_ERROR",
        message: "Failed to fetch dashboard metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Helper function to generate chart data
async function generateChartData(
  startDate: string,
  endDate: string,
  userId: string
) {
  // Get daily sales aggregation
  const dailySales = await SaleModel.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$date",
        sales: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Get daily expenses aggregation
  const dailyExpenses = await ExpenseModel.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$date",
        expenses: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Create a map for easy lookup
  const salesMap = new Map(dailySales.map((item) => [item._id, item.sales]));
  const expensesMap = new Map(
    dailyExpenses.map((item) => [item._id, item.expenses])
  );

  // Generate date range
  const chartData = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (
    let date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    const dateStr = date.toISOString().split("T")[0];
    const sales = salesMap.get(dateStr) || 0;
    const expenses = expensesMap.get(dateStr) || 0;

    chartData.push({
      date: dateStr,
      sales,
      expenses,
      profit: sales - expenses,
    });
  }

  return chartData;
}

// Helper function to generate recent activity
async function generateRecentActivity(userId: string) {
  // Get recent sales
  const recentSales = await SaleModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Get recent expenses
  const recentExpenses = await ExpenseModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Combine and sort by creation date
  const allActivity = [
    ...recentSales.map((sale) => ({
      id: (sale._id as any).toString(),
      type: "sale" as const,
      description: `Sale: ${sale.item}`,
      amount: sale.amount,
      date: sale.date,
    })),
    ...recentExpenses.map((expense) => ({
      id: (expense._id as any).toString(),
      type: "expense" as const,
      description: `Expense: ${expense.description}`,
      amount: expense.amount,
      date: expense.date,
    })),
  ];

  // Sort by date (most recent first) and limit to 10
  return allActivity
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
}
