import { redirect } from "next/navigation"

import { getServerSession } from "@/lib/auth-server"
import { AdminShell } from "@/components/admin/admin-shell"

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession()
  if (!session) {
    redirect("/admin/login")
  }

  return <AdminShell>
    {children}
  </AdminShell>
}
