import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getServerSession() {
  const hdrs = await headers();
  console.log("[getServerSession] cookie header:", hdrs.get("cookie"));
  const session = await auth.api.getSession({ headers: hdrs });
  console.log("[getServerSession] session:", session ? session.user?.email : null);
  return session;
}
