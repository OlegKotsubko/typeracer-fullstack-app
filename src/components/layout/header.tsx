import Link from "next/link";

export function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-20"
      style={{
        background: "rgba(5,9,26,0.65)",
        borderBottom: "1px solid rgba(0,212,255,0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between px-8 py-4.5 max-w-350 mx-auto sm:px-12">
        <Link href="/" className="header-neon-logo">
          <span>TYPE</span>
          <span>RACER</span>
        </Link>
        <div className="header-neon-actions">
          <Link href="/admin/login" className="btn-outline-cyan">Admin</Link>
        </div>
      </div>
    </header>
  );
}
