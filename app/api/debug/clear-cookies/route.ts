/** @format */

import { NextResponse } from "next/server";

// GET /api/debug/clear-cookies - Clear all auth cookies (for testing)
export async function GET() {
  const response = NextResponse.json({
    success: true,
    message: "Cookies cleared",
  });

  // Clear the auth token cookie
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  // Also try to delete it
  response.cookies.delete("auth-token");

  return response;
}
