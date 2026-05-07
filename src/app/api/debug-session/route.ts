import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const hdrs = await headers();
  const cookie = hdrs.get("cookie");
  const session = await auth.api.getSession({ headers: hdrs });

  return NextResponse.json({
    cookie,
    session: session
      ? { userId: session.user?.id, email: session.user?.email }
      : null,
    baseURL: process.env.BETTER_AUTH_URL,
  });
}
