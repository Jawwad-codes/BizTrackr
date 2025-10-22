/** @format */

import { NextResponse } from "next/server";
import { APIResponse } from "@/lib/models/types";

// GET /api/auth/logout - Logout user (for testing)
export async function GET(): Promise<NextResponse> {
  return POST(); // Reuse the POST logic
}

// POST /api/auth/logout - Logout user
export async function POST(): Promise<NextResponse> {
  try {
    const response: APIResponse<{ message: string }> = {
      success: true,
      data: { message: "Logged out successfully" },
    };

    // Clear the auth token cookie with multiple methods to ensure it's removed
    const nextResponse = NextResponse.json(response);

    // Method 1: Set cookie to empty with immediate expiration
    nextResponse.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expire immediately
      path: "/", // Ensure it clears for all paths
      expires: new Date(0), // Set expiration to epoch
    });

    // Method 2: Delete the cookie directly
    nextResponse.cookies.delete("auth-token");

    // Method 3: Set cookie with past expiration date
    nextResponse.cookies.set("auth-token", "deleted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    });

    return nextResponse;
  } catch (error) {
    console.error("Error logging out user:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOGOUT_ERROR",
          message: "Failed to logout user",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
