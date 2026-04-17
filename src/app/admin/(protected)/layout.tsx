import Link from "next/link";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30 p-6">
        <Link href="/admin" className="text-xl font-bold tracking-tight">
          TypeRacer
        </Link>
        <p className="text-xs text-muted-foreground mb-6">Admin Panel</p>
        <nav className="flex flex-col gap-2">
          <Link
            href="/admin"
            className="text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/races"
            className="text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            Races
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
