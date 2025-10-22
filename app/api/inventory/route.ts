/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import InventoryModel from "@/lib/models/Inventory";
import { Inventory, APIResponse } from "@/lib/models/types";
import { requireAuth } from "@/lib/auth";

// GET /api/inventory - Retrieve user's inventory
export async function GET(
  request: NextRequest
): Promise<NextResponse<APIResponse<Inventory[]>>> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    await connectToDatabase();

    const inventory = await InventoryModel.find({ userId: user.userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Return plain JavaScript objects for better performance

    return NextResponse.json({
      success: true,
      data: inventory as unknown as Inventory[],
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Please login to access your inventory data",
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_INVENTORY_ERROR",
          message: "Failed to retrieve inventory data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Create new inventory item for user
export async function POST(
  request: NextRequest
): Promise<NextResponse<APIResponse<Inventory>>> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    if (
      !body.productName ||
      !body.category ||
      body.stock === undefined ||
      !body.costPrice ||
      !body.sellingPrice ||
      body.reorderLevel === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Missing required fields: productName, category, stock, costPrice, sellingPrice, and reorderLevel are required",
            details: { received: body },
          },
        },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (
      typeof body.stock !== "number" ||
      body.stock < 0 ||
      !Number.isInteger(body.stock)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Stock must be a non-negative integer",
            details: { stock: body.stock },
          },
        },
        { status: 400 }
      );
    }

    if (typeof body.costPrice !== "number" || body.costPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Cost price must be a positive number",
            details: { costPrice: body.costPrice },
          },
        },
        { status: 400 }
      );
    }

    if (typeof body.sellingPrice !== "number" || body.sellingPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Selling price must be a positive number",
            details: { sellingPrice: body.sellingPrice },
          },
        },
        { status: 400 }
      );
    }

    if (
      typeof body.reorderLevel !== "number" ||
      body.reorderLevel < 0 ||
      !Number.isInteger(body.reorderLevel)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Reorder level must be a non-negative integer",
            details: { reorderLevel: body.reorderLevel },
          },
        },
        { status: 400 }
      );
    }

    // Check if product already exists for this user
    const existingProduct = await InventoryModel.findOne({
      userId: user.userId,
      productName: body.productName.trim(),
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRODUCT_EXISTS",
            message: "Product with this name already exists in your inventory",
            details: { productName: body.productName },
          },
        },
        { status: 409 }
      );
    }

    // Create new inventory item with user ID
    const newInventoryItem = new InventoryModel({
      userId: user.userId,
      productName: body.productName.trim(),
      category: body.category,
      stock: body.stock,
      costPrice: body.costPrice,
      sellingPrice: body.sellingPrice,
      reorderLevel: body.reorderLevel,
      description: body.description?.trim() || "",
    });

    const savedInventoryItem = await newInventoryItem.save();

    return NextResponse.json(
      {
        success: true,
        data: savedInventoryItem.toObject() as Inventory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating inventory item:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Please login to create inventory items",
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
            message: "Invalid inventory data",
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
          code: "CREATE_INVENTORY_ERROR",
          message: "Failed to create inventory item",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
