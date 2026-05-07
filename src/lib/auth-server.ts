import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function getServerSession() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const session = await auth.api.getSession({
    headers: new Headers({ cookie: cookieHeader }),
  });
  return session;
}
