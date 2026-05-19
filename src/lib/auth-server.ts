import {cookies} from "next/headers"

import {auth} from "@/lib/auth"

export async function getServerSession() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  return await auth.api.getSession({
    headers: new Headers({cookie: cookieHeader}),
  })
}
