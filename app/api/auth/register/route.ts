/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import UserModel from "@/lib/models/User";
import { User, APIResponse } from "@/lib/models/types";

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    if (
      !body.email ||
      !body.password ||
      !body.name ||
      !body.businessName ||
      !body.businessType
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Email, password, name, business name, and business type are required",
            details: { received: body },
          },
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Password must be at least 6 characters long",
          },
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      email: body.email.toLowerCase(),
    });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_EXISTS",
            message: "User with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new UserModel({
      email: body.email.toLowerCase(),
      password: body.password,
      name: body.name.trim(),
      businessName: body.businessName.trim(),
      businessType: body.businessType,
    });

    const savedUser = await newUser.save();

    // Return user data without password
    const userResponse = {
      _id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      businessName: savedUser.businessName,
      businessType: savedUser.businessType,
      createdAt: savedUser.createdAt,
    };

    const response: APIResponse<typeof userResponse> = {
      success: true,
      data: userResponse,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid user data",
            details: error.message,
          },
        },
        { status: 400 }
      );
    }

    // Handle duplicate key error (email already exists)
    if (error instanceof Error && (error as any).code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_EXISTS",
            message: "User with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REGISTRATION_ERROR",
          message: "Failed to register user",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
