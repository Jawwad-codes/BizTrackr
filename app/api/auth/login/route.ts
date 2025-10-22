/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import UserModel from "@/lib/models/User";
import { APIResponse } from "@/lib/models/types";
import jwt from "jsonwebtoken";

// POST /api/auth/login - Login user
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email and password are required",
          },
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await UserModel.findOne({ email: body.email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await (user as any).comparePassword(body.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "fallback-secret-key",
      { expiresIn: "7d" }
    );

    // Return user data and token
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      businessName: user.businessName,
      businessType: user.businessType,
      createdAt: user.createdAt,
      token,
    };

    const response: APIResponse<typeof userResponse> = {
      success: true,
      data: userResponse,
    };

    // Set HTTP-only cookie with the token
    const nextResponse = NextResponse.json(response);
    nextResponse.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/", // Ensure cookie is available for all paths
    });

    return nextResponse;
  } catch (error) {
    console.error("Error logging in user:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOGIN_ERROR",
          message: "Failed to login user",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
