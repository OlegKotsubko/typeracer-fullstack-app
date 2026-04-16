import Link from "next/link";

export function Header() {
  return (
    <header className="header-neon">
      <div className="header-neon-inner">
        <Link href="/" className="header-neon-logo">
          <span>TYPE</span>
          <span>RACER</span>
        </Link>
        <nav className="header-neon-nav">
          <Link href="/">Races</Link>
          <Link href="/admin">Admin</Link>
        </nav>
        <div className="header-neon-actions">
          <Link href="/admin/login" className="btn-ghost-neon">Login</Link>
          <Link href="/" className="btn-outline-cyan">View Races</Link>
        </div>
      </div>
    </header>
  );
}
