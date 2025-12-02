/** @format */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't need authentication
const publicRoutes = ["/", "/login", "/register"];

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

  // --- Allow API and static resources ---
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // --- Allow public routes ---
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // --- For protected routes, let the client-side handle authentication ---
  // Since we're using localStorage for tokens, we can't check auth in middleware
  // The useRequireAuth hook will handle redirects on the client side
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected) {
    // Just allow the request through - client-side auth will handle it
    return NextResponse.next();
  }

  // --- Default: allow navigation ---
  return NextResponse.next();
}

// Match all routes except static/public assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
