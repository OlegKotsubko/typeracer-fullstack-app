import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="max-w-350 mx-auto px-8 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="header-neon-logo">
          <span>TYPE</span>
          <span>RACER</span>
        </Link>
        <nav className="flex gap-6">
          <Link href="/privacy-policy" className="footer-link">Privacy Policy</Link>
        </nav>
        <p className="footer-copy">&copy; {new Date().getFullYear()} TypeRacer</p>
      </div>
    </footer>
  );
}
