import { buttonVariants } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-grid" />
      <div className="hero-floor" />

      <div className="wrap hero-inner">
        <div className="hero-tag">Season 08 // Online Lobby Open</div>
        <h1>
          Outtype<br />
          the <em>neon</em>. Outrun the <b>grid</b>.
        </h1>
        <p className="hero-sub">
          A cyberpunk typing race for keyboard street-samurai. Queue into a lobby of three or more
          riders, wait for the signal, and burn the prompt into memory. First across the finish
          keeps the points.
        </p>
        <div className="hero-steps">
          <span><i>01</i> Pick a race</span>
          <span><i>02</i> Enter nickname</span>
          <span><i>03</i> Wait for the lobby</span>
          <span><i>04</i> Green means go</span>
        </div>
        <div className="hero-cta">
          <a href="/#races" className={buttonVariants({ size: "lg" })}>
            Join a Race ↓
          </a>
          <a href="/#how" className={buttonVariants({ size: "lg", variant: "ghost" })}>
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}
