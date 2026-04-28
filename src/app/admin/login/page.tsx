"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await signIn.email({ email, password });

    if (error) {
      const msg = error.message ?? "Failed to sign in";
      setErrorMsg(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="login-wrap">
      <div className="hero-grid" />
      <div className="login-card chamfer">
        <Link href="/" className="logo" style={{ display: "inline-flex", marginBottom: 18 }}>
          <span>NEON</span>
          <span style={{ color: "var(--green)" }}>DRIFT</span>
        </Link>
        <h2>Operator Sign-In</h2>
        <p className="hint">Authenticate to access the <b>control deck</b></p>
        {errorMsg && <div className="login-err">{`// ${errorMsg}`}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@neondrift.io"
              required
              className="chamfer h-10 px-3 bg-black/40 border border-[var(--line)] font-mono text-[14px] text-[var(--fg)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:border-[var(--green)] focus:shadow-[0_0_0_3px_rgba(182,255,60,0.15)] transition-shadow w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="some secret password"
              className="chamfer h-10 px-3 bg-black/40 border border-[var(--line)] font-mono text-[14px] text-[var(--fg)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:border-[var(--green)] focus:shadow-[0_0_0_3px_rgba(182,255,60,0.15)] transition-shadow w-full"
            />
          </div>
          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? "Authenticating..." : "Authenticate →"}
          </Button>
        </form>
      </div>
    </div>
  );
}
