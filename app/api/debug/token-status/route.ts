/** @format */

import { NextRequest, NextResponse } from "next/server";

// GET /api/debug/token-status - Show current token status
export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;

  const isValidFormat = !!(
    token &&
    typeof token === "string" &&
    token.length > 20 &&
    token !== "undefined" &&
    token !== "null" &&
    token !== "" &&
    token !== "deleted" &&
    token.includes(".") &&
    token.split(".").length === 3
  );

  return NextResponse.json({
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? `${token.substring(0, 30)}...` : null,
    tokenValue: token === "deleted" ? "DELETED_MARKER" : token || "NO_TOKEN",
    isValidFormat,
    jwtParts: token ? token.split(".").length : 0,
    allCookies: Object.fromEntries(
      Array.from(
        request.cookies.getAll().map((cookie) => [cookie.name, cookie.value])
      )
    ),
    timestamp: new Date().toISOString(),
  });
}
