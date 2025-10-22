/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import UserModel from "@/lib/models/User";
import { APIResponse } from "@/lib/models/types";
import jwt from "jsonwebtoken";

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret-key"
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid authentication token",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.businessName || !body.businessType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Name, business name, and business type are required",
          },
        },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await UserModel.findByIdAndUpdate(
      decoded.userId,
      {
        name: body.name.trim(),
        businessName: body.businessName.trim(),
        businessType: body.businessType,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    // Return updated user data without password
    const userResponse = {
      _id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      businessName: updatedUser.businessName,
      businessType: updatedUser.businessType,
      createdAt: updatedUser.createdAt,
    };

    const response: APIResponse<typeof userResponse> = {
      success: true,
      data: userResponse,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating profile:", error);

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid profile data",
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
          code: "PROFILE_UPDATE_ERROR",
          message: "Failed to update profile",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
