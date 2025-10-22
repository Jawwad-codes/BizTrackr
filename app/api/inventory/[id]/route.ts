/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import InventoryModel from "@/lib/models/Inventory";
import { Inventory, APIResponse } from "@/lib/models/types";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";

// GET /api/inventory/[id] - Get specific inventory item for user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<APIResponse<Inventory>>> {
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
            message: "Invalid inventory item ID format",
            details: { id },
          },
        },
        { status: 400 }
      );
    }

    const inventoryItem = await InventoryModel.findOne({
      _id: id,
      userId: user.userId,
    }).lean();

    if (!inventoryItem) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVENTORY_NOT_FOUND",
            message: "Inventory item not found",
            details: { id },
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inventoryItem as unknown as Inventory,
    });
  } catch (error) {
    console.error("Error fetching inventory item:", error);

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
          message: "Failed to retrieve inventory item",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/[id] - Update existing inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<APIResponse<Inventory>>> {
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
            message: "Invalid inventory item ID format",
            details: { id },
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate numeric fields if provided
    if (
      body.stock !== undefined &&
      (typeof body.stock !== "number" ||
        body.stock < 0 ||
        !Number.isInteger(body.stock))
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

    if (
      body.costPrice !== undefined &&
      (typeof body.costPrice !== "number" || body.costPrice < 0)
    ) {
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

    if (
      body.sellingPrice !== undefined &&
      (typeof body.sellingPrice !== "number" || body.sellingPrice < 0)
    ) {
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
      body.reorderLevel !== undefined &&
      (typeof body.reorderLevel !== "number" ||
        body.reorderLevel < 0 ||
        !Number.isInteger(body.reorderLevel))
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

    // Prepare update data
    const updateData: Partial<Inventory> = {};
    if (body.productName !== undefined)
      updateData.productName = body.productName.trim();
    if (body.category !== undefined) updateData.category = body.category;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.costPrice !== undefined) updateData.costPrice = body.costPrice;
    if (body.sellingPrice !== undefined)
      updateData.sellingPrice = body.sellingPrice;
    if (body.reorderLevel !== undefined)
      updateData.reorderLevel = body.reorderLevel;
    if (body.description !== undefined)
      updateData.description = body.description?.trim() || "";

    const updatedInventoryItem = await InventoryModel.findOneAndUpdate(
      { _id: id, userId: user.userId },
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
        lean: true, // Return plain JavaScript object
      }
    );

    if (!updatedInventoryItem) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVENTORY_NOT_FOUND",
            message: "Inventory item not found",
            details: { id },
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedInventoryItem as unknown as Inventory,
    });
  } catch (error) {
    console.error("Error updating inventory item:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Please login to update inventory items",
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
          code: "UPDATE_INVENTORY_ERROR",
          message: "Failed to update inventory item",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[id] - Delete user's inventory item
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
            message: "Invalid inventory item ID format",
            details: { id },
          },
        },
        { status: 400 }
      );
    }

    const deletedInventoryItem = await InventoryModel.findOneAndDelete({
      _id: id,
      userId: user.userId,
    });

    if (!deletedInventoryItem) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVENTORY_NOT_FOUND",
            message: "Inventory item not found",
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
    console.error("Error deleting inventory item:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Please login to delete inventory items",
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DELETE_INVENTORY_ERROR",
          message: "Failed to delete inventory item",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
