/** @format */

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthUser {
  userId: string;
  email: string;
}

export function getUserFromRequest(request: NextRequest): AuthUser | null {
  try {
    // Try to get token from cookie first
    let token = request.cookies.get("auth-token")?.value;

    // If no cookie, try Authorization header
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    // Verify and decode the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key"
    ) as any;

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = getUserFromRequest(request);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}
