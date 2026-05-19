"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { LogoutButton } from "@/components/admin/logout-button"

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/races", label: "Races" },
  { href: "/admin/api-keys", label: "API Keys" },
  { href: "/", label: "Main Site" },
]

function NavLinks({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  return NAV.map((n) => {
    const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href) && n.href !== "/"
    return (
      <Link key={n.href}
        href={n.href}
        className={active ? "active" : ""}
        onClick={onClick}>
        {n.label}
      </Link>
    )
  })
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const segments = pathname.split("/").filter(Boolean)
  const crumbs = segments.length > 0 ? segments : ["admin"]

  return (
    <div className="adm">
      <aside className="adm-side">
        <Link href="/"
          className="adm-logo logo">
          <span>
            NEON
          </span>
          <span style={{ color: "var(--green)" }}>
            DRIFT
          </span>
        </Link>
        <nav className="adm-nav">
          <NavLinks pathname={pathname} />
        </nav>
        <div className="adm-foot">
          <span className="status-pill">
            ● Online
          </span>
          <LogoutButton />
        </div>
      </aside>

      <div className="adm-main">
        <div className="adm-top">
          <div className="adm-crumbs">
            <button
              type="button"
              className="mobile-menu chamfer"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            {crumbs.map((c, i) => (
              <span key={i}
                style={{ display: "inline-flex", gap: 8 }}>
                {i > 0 && <span className="sep">
                  /
                </span>}
                <b>
                  {c}
                </b>
              </span>
            ))}
          </div>
          <div className="adm-user">
            <span className="status-pill">
              ● Operator
            </span>
          </div>
        </div>
        <div className="adm-body">
          {children}
        </div>
      </div>

      <div className={`adm-drawer${drawerOpen ? " open" : ""}`}
        onClick={() => setDrawerOpen(false)}>
        <div className="adm-drawer-inner"
          onClick={(e) => e.stopPropagation()}>
          <Link href="/"
            className="adm-logo logo">
            <span>
              NEON
            </span>
            <span style={{ color: "var(--green)" }}>
              DRIFT
            </span>
          </Link>
          <nav className="adm-nav">
            <NavLinks
              pathname={pathname}
              onClick={() => setDrawerOpen(false)}
            />
          </nav>
          <div className="adm-foot">
            <span className="status-pill">
              ● Online
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  )
}
