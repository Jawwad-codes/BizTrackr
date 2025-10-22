/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import ExpenseModel from "@/lib/models/Expense";
import { Expense, APIResponse } from "@/lib/models/types";
import mongoose from "mongoose";

// GET /api/expenses/[id] - Get specific expense
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse<Expense>>> {
  try {
    await connectToDatabase();

    const { id } = params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid expense ID format",
            details: { id },
          },
        },
        { status: 400 }
      );
    }

    const expense = await ExpenseModel.findById(id).lean();

    if (!expense) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EXPENSE_NOT_FOUND",
            message: "Expense not found",
            details: { id },
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expense as unknown as Expense,
    });
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_EXPENSE_ERROR",
          message: "Failed to retrieve expense",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update existing expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse<Expense>>> {
  try {
    await connectToDatabase();

    const { id } = params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid expense ID format",
            details: { id },
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate amount if provided
    if (
      body.amount !== undefined &&
      (typeof body.amount !== "number" || body.amount < 0)
    ) {
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

    // Validate date format if provided
    if (body.date !== undefined) {
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
    }

    // Validate category if provided
    if (body.category !== undefined) {
      const validCategories = [
        "Office Supplies",
        "Marketing",
        "Travel",
        "Utilities",
        "Software",
        "Equipment",
        "Professional Services",
        "Rent",
        "Insurance",
        "Other",
      ];

      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Category must be one of: ${validCategories.join(", ")}`,
              details: { category: body.category, validCategories },
            },
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Partial<Expense> = {};
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.description !== undefined)
      updateData.description = body.description.trim();
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.date !== undefined) updateData.date = body.date;

    const updatedExpense = await ExpenseModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
        lean: true, // Return plain JavaScript object
      }
    );

    if (!updatedExpense) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EXPENSE_NOT_FOUND",
            message: "Expense not found",
            details: { id },
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedExpense as unknown as Expense,
    });
  } catch (error) {
    console.error("Error updating expense:", error);

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
          code: "UPDATE_EXPENSE_ERROR",
          message: "Failed to update expense",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse<{ id: string }>>> {
  try {
    await connectToDatabase();

    const { id } = params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid expense ID format",
            details: { id },
          },
        },
        { status: 400 }
      );
    }

    const deletedExpense = await ExpenseModel.findByIdAndDelete(id);

    if (!deletedExpense) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EXPENSE_NOT_FOUND",
            message: "Expense not found",
            details: { id },
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DELETE_EXPENSE_ERROR",
          message: "Failed to delete expense",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
