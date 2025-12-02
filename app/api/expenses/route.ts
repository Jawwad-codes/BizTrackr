/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import ExpenseModel from "@/lib/models/Expense";
import { Expense, APIResponse } from "@/lib/models/types";
import { requireAuth } from "@/lib/auth";

// GET /api/expenses - Retrieve user's expenses
export async function GET(
  request: NextRequest
): Promise<NextResponse<APIResponse<Expense[]>>> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    await connectToDatabase();

    const expenses = await ExpenseModel.find({ userId: user.userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Return plain JavaScript objects for better performance

    return NextResponse.json({
      success: true,
      data: expenses as unknown as Expense[],
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Please login to access your expenses data",
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_EXPENSES_ERROR",
          message: "Failed to retrieve expenses data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create new expense
export async function POST(
  request: NextRequest
): Promise<NextResponse<APIResponse<Expense>>> {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.category || !body.description || !body.amount || !body.date) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Missing required fields: category, description, amount, and date are required",
            details: { received: body },
          },
        },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (typeof body.amount !== "number" || body.amount < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Amount must be a positive number",
            details: { amount: body.amount },
          },
        },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Date must be in YYYY-MM-DD format",
            details: { date: body.date },
          },
        },
        { status: 400 }
      );
    }

    // Validate category length (basic validation, detailed validation handled by Mongoose schema)
    if (
      typeof body.category !== "string" ||
      body.category.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Category must be a non-empty string",
            details: { category: body.category },
          },
        },
        { status: 400 }
      );
    }

    if (body.category.trim().length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Category cannot exceed 50 characters",
            details: { category: body.category, length: body.category.length },
          },
        },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = requireAuth(request);

    // Create new expense with user ID
    const newExpense = new ExpenseModel({
      userId: user.userId,
      category: body.category.trim(),
      description: body.description.trim(),
      amount: body.amount,
      date: body.date,
    });

    const savedExpense = await newExpense.save();

    return NextResponse.json(
      {
        success: true,
        data: savedExpense.toObject() as Expense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expense:", error);

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid expense data",
            details: error.message,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CREATE_EXPENSE_ERROR",
          message: "Failed to create expense",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
