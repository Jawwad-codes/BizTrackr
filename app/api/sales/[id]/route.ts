/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import SaleModel from "@/lib/models/Sale";
import { Sale, APIResponse } from "@/lib/models/types";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";

// GET /api/sales/[id] - Get specific sale for user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<APIResponse<Sale>>> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    await connectToDatabase();

    const { id } = await params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid sale ID format",
            details: { id },
          },
        },
        { status: 400 }
      );
    }

    const sale = await SaleModel.findOne({
      _id: id,
      userId: user.userId,
    }).lean();

    if (!sale) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SALE_NOT_FOUND",
            message: "Sale not found",
            details: { id },
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sale as unknown as Sale,
    });
  } catch (error) {
    console.error("Error fetching sale:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Please login to access your sales data",
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_SALE_ERROR",
          message: "Failed to retrieve sale",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/sales/[id] - Update existing sale
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<APIResponse<Sale>>> {
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
            message: "Invalid sale ID format",
            details: { id },
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields if provided
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

    // Validate quantity if provided
    if (
      body.quantity !== undefined &&
      (typeof body.quantity !== "number" ||
        body.quantity < 1 ||
        !Number.isInteger(body.quantity))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Quantity must be a positive integer",
            details: { quantity: body.quantity },
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

    // Prepare update data
    const updateData: Partial<Sale> = {};
    if (body.item !== undefined) updateData.item = body.item.trim();
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.date !== undefined) updateData.date = body.date;

    const updatedSale = await SaleModel.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators
      lean: true, // Return plain JavaScript object
    });

    if (!updatedSale) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SALE_NOT_FOUND",
            message: "Sale not found",
            details: { id },
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSale as unknown as Sale,
    });
  } catch (error) {
    console.error("Error updating sale:", error);

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid sale data",
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
          code: "UPDATE_SALE_ERROR",
          message: "Failed to update sale",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/sales/[id] - Delete user's sale
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<APIResponse<{ id: string }>>> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    await connectToDatabase();

    const { id } = params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid sale ID format",
            details: { id },
          },
        },
        { status: 400 }
      );
    }

    const deletedSale = await SaleModel.findOneAndDelete({
      _id: id,
      userId: user.userId,
    });

    if (!deletedSale) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SALE_NOT_FOUND",
            message: "Sale not found",
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
    console.error("Error deleting sale:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Please login to delete sales",
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DELETE_SALE_ERROR",
          message: "Failed to delete sale",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
