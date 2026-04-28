import Link from "next/link";

export function Header() {
  return (
    <header className="hdr">
      <div className="wrap hdr-row">
        <Link href="/" className="logo">
          <span className="logo-mark" />
          <span className="logo-text">
            NEON<b>DRIFT</b>
          </span>
        </Link>
        <nav className="hdr-nav">
          <span className="status-pill">
            <span className="status-dot" />
            Servers <b style={{ color: "var(--green)" }}>&nbsp;Online</b>
          </span>
          <Link
            href="/admin/login"
            className="chamfer h-8 px-3 inline-flex items-center font-mono uppercase tracking-[0.12em] text-[11px] font-semibold text-[var(--fg)] shadow-[inset_0_0_0_1px_var(--line)] hover:text-[var(--green)] hover:shadow-[inset_0_0_0_1px_var(--green)] transition-colors"
          >
            Admin ↗
          </Link>
        </nav>
      </div>
    </header>
  );
}
