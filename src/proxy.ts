import { NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("__Secure-better-auth.session_token") ??
    request.cookies.get("better-auth.session_token")
  const isLoginPage = request.nextUrl.pathname === "/admin/login"

  // Redirect unauthenticated users to login
  if (!sessionCookie && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  // Redirect authenticated users away from login page
  if (sessionCookie && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
