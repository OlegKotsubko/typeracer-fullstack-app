import Link from "next/link";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/admin/logout-button";

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
      <aside className="w-64 border-r bg-muted/30 p-6 flex flex-col">
        <Link href="/" className="header-neon-logo">
          <span>TYPE</span>
          <span>RACER</span>
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
          <Link
            href="/"
            className="text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            Go to Main Page
          </Link>
        </nav>
        <div className="mt-auto pt-6">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
