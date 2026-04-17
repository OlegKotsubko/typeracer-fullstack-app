"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/admin/login");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
      Logout
    </Button>
  );
}
