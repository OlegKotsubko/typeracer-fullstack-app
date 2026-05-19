"use client"

import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="ftr">
      <div className="wrap ftr-row">
        <div>
          ©
          {new Date().getFullYear()}
          {' '}
          NEONDRIFT CORP // ALL CIRCUITS RESERVED
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link href="/privacy-policy">
            Privacy Policy
          </Link>
          <span style={{ color: "var(--pink)" }}>
            {"//"}
          </span>
          <span>
            v 0.01.88
          </span>
        </div>
      </div>
    </footer>
  )
}
