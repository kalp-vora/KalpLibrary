import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has("kalp_auth");

  // If user is already authenticated and visits /login, redirect to destination or home
  if (pathname === "/login") {
    if (isAuthenticated) {
      const from = request.nextUrl.searchParams.get("from");
      const target = from && from !== "/login" ? from : "/";
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // If user is not authenticated and tries to access app pages, redirect to /login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Only append 'from' parameter if it's a specific sub-path, avoiding '?from=%2F' on root
    if (pathname && pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
