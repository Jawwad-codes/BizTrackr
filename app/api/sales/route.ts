/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import SaleModel from "@/lib/models/Sale";
import { Sale, APIResponse } from "@/lib/models/types";
import { requireAuth } from "@/lib/auth";

// GET /api/sales - Retrieve user's sales
export async function GET(
  request: NextRequest
): Promise<NextResponse<APIResponse<Sale[]>>> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    await connectToDatabase();

    const sales = await SaleModel.find({ userId: user.userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Return plain JavaScript objects for better performance

    return NextResponse.json({
      success: true,
      data: sales as unknown as Sale[],
    });
  } catch (error) {
    console.error("Error fetching sales:", error);

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
          code: "FETCH_SALES_ERROR",
          message: "Failed to retrieve sales data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/sales - Create new sale for user
export async function POST(
  request: NextRequest
): Promise<NextResponse<APIResponse<Sale>>> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.item || !body.amount || !body.quantity || !body.date) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Missing required fields: item, amount, quantity, and date are required",
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

    // Validate quantity is a positive integer
    if (
      typeof body.quantity !== "number" ||
      body.quantity < 1 ||
      !Number.isInteger(body.quantity)
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

    // Create new sale with user ID
    const newSale = new SaleModel({
      userId: user.userId,
      item: body.item.trim(),
      amount: body.amount,
      quantity: body.quantity,
      date: body.date,
    });

    const savedSale = await newSale.save();

    return NextResponse.json(
      {
        success: true,
        data: savedSale.toObject() as Sale,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating sale:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Please login to create sales",
          },
        },
        { status: 401 }
      );
    }

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
          code: "CREATE_SALE_ERROR",
          message: "Failed to create sale",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
