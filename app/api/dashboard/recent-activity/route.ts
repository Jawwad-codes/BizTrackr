/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import SaleModel from "@/lib/models/Sale";
import ExpenseModel from "@/lib/models/Expense";
import EmployeeModel from "@/lib/models/Employee";
import { ActivityItem, APIResponse } from "@/lib/models/types";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam), 50) : 10; // Default 10, max 50

    // Validate limit parameter
    if (
      limitParam &&
      (isNaN(parseInt(limitParam)) || parseInt(limitParam) < 1)
    ) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          code: "INVALID_LIMIT",
          message: "Limit must be a positive number",
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get recent activities from all collections
    const recentActivity = await getRecentActivity(limit);

    const response: APIResponse<ActivityItem[]> = {
      success: true,
      data: recentActivity,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching recent activity:", error);

    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        code: "RECENT_ACTIVITY_FETCH_ERROR",
        message: "Failed to fetch recent activity",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Helper function to get recent activity from all collections
async function getRecentActivity(limit: number): Promise<ActivityItem[]> {
  // Calculate how many items to fetch from each collection
  // We'll fetch more than needed and then sort and limit
  const fetchLimit = Math.max(limit, 20);

  // Get recent sales
  const recentSales = await SaleModel.find({})
    .sort({ createdAt: -1 })
    .limit(fetchLimit)
    .lean();

  // Get recent expenses
  const recentExpenses = await ExpenseModel.find({})
    .sort({ createdAt: -1 })
    .limit(fetchLimit)
    .lean();

  // Get recent employees
  const recentEmployees = await EmployeeModel.find({})
    .sort({ createdAt: -1 })
    .limit(fetchLimit)
    .lean();

  // Convert to activity items
  const salesActivity: ActivityItem[] = recentSales.map((sale) => ({
    id: (sale._id as any).toString(),
    type: "sale",
    description: `New sale: ${sale.item}`,
    amount: sale.amount,
    date: sale.createdAt?.toISOString().split("T")[0] || sale.date,
  }));

  const expensesActivity: ActivityItem[] = recentExpenses.map((expense) => ({
    id: (expense._id as any).toString(),
    type: "expense",
    description: `New expense: ${expense.description} (${expense.category})`,
    amount: expense.amount,
    date: expense.createdAt?.toISOString().split("T")[0] || expense.date,
  }));

  const employeesActivity: ActivityItem[] = recentEmployees.map((employee) => ({
    id: (employee._id as any).toString(),
    type: "employee",
    description: `New employee: ${employee.name} (${employee.role})`,
    amount: employee.salary,
    date:
      employee.createdAt?.toISOString().split("T")[0] ||
      employee.hireDate ||
      new Date().toISOString().split("T")[0],
  }));

  // Combine all activities
  const allActivity = [
    ...salesActivity,
    ...expensesActivity,
    ...employeesActivity,
  ];

  // Sort by creation date (most recent first) and limit
  return allActivity
    .sort((a, b) => {
      // For more accurate sorting, we should use createdAt if available
      // Since we're using the date field as fallback, we'll sort by date string
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, limit);
}

// Alternative endpoint to get activity by type
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Connect to database
    await connectToDatabase();

    const body = await request.json();
    const { types, limit = 10, startDate, endDate } = body;

    // Validate types parameter
    const validTypes = ["sale", "expense", "employee"];
    const requestedTypes = types || validTypes;

    if (
      !Array.isArray(requestedTypes) ||
      !requestedTypes.every((type) => validTypes.includes(type))
    ) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          code: "INVALID_TYPES",
          message:
            "Types must be an array containing 'sale', 'expense', and/or 'employee'",
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get filtered activity
    const recentActivity = await getFilteredActivity(
      requestedTypes,
      limit,
      startDate,
      endDate
    );

    const response: APIResponse<ActivityItem[]> = {
      success: true,
      data: recentActivity,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching filtered recent activity:", error);

    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        code: "FILTERED_ACTIVITY_FETCH_ERROR",
        message: "Failed to fetch filtered recent activity",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Helper function to get filtered activity
async function getFilteredActivity(
  types: string[],
  limit: number,
  startDate?: string,
  endDate?: string
): Promise<ActivityItem[]> {
  const activities: ActivityItem[] = [];
  const fetchLimit = Math.max(limit, 20);

  // Build date filter
  const dateFilter: any = {};
  if (startDate || endDate) {
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
  }

  // Fetch sales if requested
  if (types.includes("sale")) {
    const query =
      Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
    const recentSales = await SaleModel.find(query)
      .sort({ createdAt: -1 })
      .limit(fetchLimit)
      .lean();

    const salesActivity = recentSales.map((sale) => ({
      id: (sale._id as any).toString(),
      type: "sale" as const,
      description: `New sale: ${sale.item}`,
      amount: sale.amount,
      date: sale.createdAt?.toISOString().split("T")[0] || sale.date,
    }));

    activities.push(...salesActivity);
  }

  // Fetch expenses if requested
  if (types.includes("expense")) {
    const query =
      Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
    const recentExpenses = await ExpenseModel.find(query)
      .sort({ createdAt: -1 })
      .limit(fetchLimit)
      .lean();

    const expensesActivity = recentExpenses.map((expense) => ({
      id: (expense._id as any).toString(),
      type: "expense" as const,
      description: `New expense: ${expense.description} (${expense.category})`,
      amount: expense.amount,
      date: expense.createdAt?.toISOString().split("T")[0] || expense.date,
    }));

    activities.push(...expensesActivity);
  }

  // Fetch employees if requested
  if (types.includes("employee")) {
    const query =
      Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
    const recentEmployees = await EmployeeModel.find(query)
      .sort({ createdAt: -1 })
      .limit(fetchLimit)
      .lean();

    const employeesActivity = recentEmployees.map((employee) => ({
      id: (employee._id as any).toString(),
      type: "employee" as const,
      description: `New employee: ${employee.name} (${employee.role})`,
      amount: employee.salary,
      date:
        employee.createdAt?.toISOString().split("T")[0] ||
        employee.hireDate ||
        new Date().toISOString().split("T")[0],
    }));

    activities.push(...employeesActivity);
  }

  // Sort by date and limit
  return activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
