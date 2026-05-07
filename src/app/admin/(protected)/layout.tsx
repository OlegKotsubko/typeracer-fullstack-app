import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  console.log("[layout] cookies:", all.map((c) => c.name));

  const session = await getServerSession();
  console.log("[layout] session:", session ? session.user?.email : null);

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
