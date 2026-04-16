import Link from "next/link";

export default function HomePage() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#05091a]">

      {/* ── Background image ───────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero.png')" }}
      />

      {/* ── Left-to-right gradient overlay ─────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(5,9,26,0.97) 0%, rgba(5,9,26,0.90) 25%, rgba(5,9,26,0.60) 50%, rgba(5,9,26,0.15) 70%, transparent 88%)",
        }}
      />

      {/* ── Animated speed lines ────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="speed-line" style={{ top: "32%", width: "55%", animationDelay: "0s", animationDuration: "2.8s" }} />
        <div className="speed-line speed-line-orange" style={{ top: "41%", width: "40%", animationDelay: "1.1s", animationDuration: "3.3s" }} />
        <div className="speed-line" style={{ top: "53%", width: "62%", animationDelay: "1.9s", animationDuration: "2.2s" }} />
        <div className="speed-line speed-line-orange" style={{ top: "63%", width: "45%", animationDelay: "0.6s", animationDuration: "3.7s" }} />
      </div>

      {/* ── Floating navigation ─────────────────────────── */}
      <header
        className="absolute top-0 left-0 right-0 z-20"
        style={{
          background: "rgba(5,9,26,0.65)",
          borderBottom: "1px solid rgba(0,212,255,0.15)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center justify-between px-12 py-[18px] max-w-[1400px] mx-auto">
          <Link href="/" className="header-neon-logo">
            <span>TYPE</span>
            <span>RACER</span>
          </Link>
          <nav className="header-neon-nav">
            <Link href="/">Races</Link>
            <Link href="/">Leaderboard</Link>
            <Link href="/">About</Link>
          </nav>
          <div className="header-neon-actions">
            <Link href="/admin/login" className="btn-ghost-neon">Login</Link>
            <Link href="/" className="btn-outline-cyan">View Races</Link>
          </div>
        </div>
      </header>

      {/* ── Hero text content ────────────────────────────── */}
      <div className="relative z-10 flex items-center min-h-screen">
        <div className="px-12 pt-24 pb-16 max-w-[580px]">

          <p className="hero-eyebrow">Master the keyboard. Ace the race.</p>

          <h1 className="hero-title">
            <span className="hero-title-type">TYPE</span>
            <span className="hero-title-racing">RACING</span>
          </h1>

          <h2 className="hero-subtitle">The Ultimate Competitive Typing Game</h2>

          <p className="hero-desc">
            Type fast, compete globally, and climb the leaderboard in the
            world&apos;s fastest typing racer. Are you ready to type your way
            to the finish line?
          </p>

          <div className="flex gap-4 flex-wrap mb-12">
            <Link href="/" className="btn-primary-neon">Play for Free Now</Link>
            <Link href="/" className="btn-secondary-neon">Browse Races</Link>
          </div>

          <div className="flex gap-6 flex-wrap">
            <div className="feature-badge">
              <div className="feature-badge-icon">⚡</div>
              <div>Live<br />Races</div>
            </div>
            <div className="feature-badge">
              <div className="feature-badge-icon">🏆</div>
              <div>Real-time<br />Progress</div>
            </div>
            <div className="feature-badge">
              <div className="feature-badge-icon">🌐</div>
              <div>Global<br />Players</div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
