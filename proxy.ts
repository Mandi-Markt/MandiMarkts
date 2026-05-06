import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin email - can see everything (wholesaler panel)
const ADMIN_EMAIL = "raj.markts@gmail.com";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname === "/login" ||
    pathname === "/auth/callback" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/globe.svg")
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("sb-access-token") ||
                     request.cookies.get("sb-refresh-token") ||
                     request.cookies.get("supabase-auth-token");

  // If no auth, redirect to login
  if (!authCookie && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Root path redirects to catalog if logged in, or login if not
  if (pathname === "/") {
    if (authCookie) {
      return NextResponse.redirect(new URL("/catalog", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$|.*\\.svg$).*)"],
};
