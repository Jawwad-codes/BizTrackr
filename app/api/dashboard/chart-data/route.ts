/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import SaleModel from "@/lib/models/Sale";
import ExpenseModel from "@/lib/models/Expense";
import { ChartDataPoint, APIResponse } from "@/lib/models/types";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const period = searchParams.get("period") || "daily"; // daily, weekly, monthly

    // Set default date range (last 30 days if not specified)
    const defaultEndDate = new Date().toISOString().split("T")[0];
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const finalStartDate = startDate || defaultStartDate;
    const finalEndDate = endDate || defaultEndDate;

    // Validate date range
    if (new Date(finalStartDate) > new Date(finalEndDate)) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          code: "INVALID_DATE_RANGE",
          message: "Start date must be before or equal to end date",
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    let chartData: ChartDataPoint[] = [];

    switch (period) {
      case "daily":
        chartData = await getDailyChartData(finalStartDate, finalEndDate);
        break;
      case "weekly":
        chartData = await getWeeklyChartData(finalStartDate, finalEndDate);
        break;
      case "monthly":
        chartData = await getMonthlyChartData(finalStartDate, finalEndDate);
        break;
      default:
        chartData = await getDailyChartData(finalStartDate, finalEndDate);
    }

    const response: APIResponse<ChartDataPoint[]> = {
      success: true,
      data: chartData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching chart data:", error);

    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        code: "CHART_DATA_FETCH_ERROR",
        message: "Failed to fetch chart data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Helper function to get daily chart data
async function getDailyChartData(
  startDate: string,
  endDate: string
): Promise<ChartDataPoint[]> {
  // Get daily sales aggregation
  const dailySales = await SaleModel.aggregate([
    {
      $match: {
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

  // Create maps for easy lookup
  const salesMap = new Map(dailySales.map((item) => [item._id, item.sales]));
  const expensesMap = new Map(
    dailyExpenses.map((item) => [item._id, item.expenses])
  );

  // Generate complete date range
  const chartData: ChartDataPoint[] = [];
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

// Helper function to get weekly chart data
async function getWeeklyChartData(
  startDate: string,
  endDate: string
): Promise<ChartDataPoint[]> {
  // Get weekly sales aggregation
  const weeklySales = await SaleModel.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $addFields: {
        dateObj: { $dateFromString: { dateString: "$date" } },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$dateObj" },
          week: { $week: "$dateObj" },
        },
        sales: { $sum: "$amount" },
        startOfWeek: { $min: "$dateObj" },
      },
    },
    { $sort: { startOfWeek: 1 } },
  ]);

  // Get weekly expenses aggregation
  const weeklyExpenses = await ExpenseModel.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $addFields: {
        dateObj: { $dateFromString: { dateString: "$date" } },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$dateObj" },
          week: { $week: "$dateObj" },
        },
        expenses: { $sum: "$amount" },
        startOfWeek: { $min: "$dateObj" },
      },
    },
    { $sort: { startOfWeek: 1 } },
  ]);

  // Create maps for easy lookup
  const salesMap = new Map(
    weeklySales.map((item) => [`${item._id.year}-${item._id.week}`, item.sales])
  );
  const expensesMap = new Map(
    weeklyExpenses.map((item) => [
      `${item._id.year}-${item._id.week}`,
      item.expenses,
    ])
  );

  // Get all unique weeks
  const allWeeks = new Set([
    ...weeklySales.map((item) => `${item._id.year}-${item._id.week}`),
    ...weeklyExpenses.map((item) => `${item._id.year}-${item._id.week}`),
  ]);

  // Generate chart data
  const chartData: ChartDataPoint[] = [];

  for (const weekKey of Array.from(allWeeks).sort()) {
    const sales = salesMap.get(weekKey) || 0;
    const expenses = expensesMap.get(weekKey) || 0;

    chartData.push({
      date: `Week ${weekKey}`,
      sales,
      expenses,
      profit: sales - expenses,
    });
  }

  return chartData;
}

// Helper function to get monthly chart data
async function getMonthlyChartData(
  startDate: string,
  endDate: string
): Promise<ChartDataPoint[]> {
  // Get monthly sales aggregation
  const monthlySales = await SaleModel.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $addFields: {
        dateObj: { $dateFromString: { dateString: "$date" } },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$dateObj" },
          month: { $month: "$dateObj" },
        },
        sales: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Get monthly expenses aggregation
  const monthlyExpenses = await ExpenseModel.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $addFields: {
        dateObj: { $dateFromString: { dateString: "$date" } },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$dateObj" },
          month: { $month: "$dateObj" },
        },
        expenses: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Create maps for easy lookup
  const salesMap = new Map(
    monthlySales.map((item) => [
      `${item._id.year}-${item._id.month}`,
      item.sales,
    ])
  );
  const expensesMap = new Map(
    monthlyExpenses.map((item) => [
      `${item._id.year}-${item._id.month}`,
      item.expenses,
    ])
  );

  // Get all unique months
  const allMonths = new Set([
    ...monthlySales.map((item) => `${item._id.year}-${item._id.month}`),
    ...monthlyExpenses.map((item) => `${item._id.year}-${item._id.month}`),
  ]);

  // Generate chart data
  const chartData: ChartDataPoint[] = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (const monthKey of Array.from(allMonths).sort()) {
    const [year, month] = monthKey.split("-");
    const sales = salesMap.get(monthKey) || 0;
    const expenses = expensesMap.get(monthKey) || 0;

    chartData.push({
      date: `${monthNames[parseInt(month) - 1]} ${year}`,
      sales,
      expenses,
      profit: sales - expenses,
    });
  }

  return chartData;
}
