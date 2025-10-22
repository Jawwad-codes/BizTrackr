/** @format */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes that need authentication
const protectedRoutes = [
  "/dashboard",
  "/sales",
  "/expenses",
  "/employees",
  "/inventory",
  "/insights",
  "/profile",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // --- Allow API and static resources ---
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // --- Validate JWT token format ---
  const hasValidToken =
    !!token &&
    token !== "undefined" &&
    token !== "null" &&
    token.length > 20 &&
    token.includes(".") &&
    token.split(".").length === 3;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // --- Case 1: Unauthenticated user accessing protected route ---
  if (isProtected && !hasValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname); // optional redirect after login
    return NextResponse.redirect(loginUrl);
  }

  // --- Case 2: Authenticated user tries to access login/register ---
  if (hasValidToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // --- Case 3: User logs out (auth-token deleted) -> go to landing page ---
  if (!hasValidToken && pathname === "/logout") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // --- Case 4: Root route ("/") handling ---
  if (pathname === "/") {
    return NextResponse.next(); // public landing page
  }

  // --- Default: allow navigation ---
  return NextResponse.next();
}

// Match all routes except static/public assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
