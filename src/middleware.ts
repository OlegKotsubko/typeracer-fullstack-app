import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!sessionCookie && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (sessionCookie && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
