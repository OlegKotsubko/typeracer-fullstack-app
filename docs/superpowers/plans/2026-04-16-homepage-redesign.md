# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the plain homepage with a full-viewport neon cyberpunk hero page using `/public/hero.png` as the background image.

**Architecture:** The homepage becomes a pure marketing page — no DB queries, no races list. The hero section takes 100vh with the image as background and a left-side gradient overlay. The homepage gets its own inline nav (absolutely positioned over the hero); the existing `Header` component is updated to a neon sticky variant for other pages (race page, etc.). All custom styles go into `globals.css` as CSS classes since Tailwind v4 doesn't support arbitrary `@keyframes` in utilities.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, plain CSS classes in globals.css

> **Note:** No test framework is configured in this project. All verification is visual via `npm run dev`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/app/globals.css` | Modify | Add `@keyframes speedLine`, neon CSS classes for hero + header |
| `src/app/layout.tsx` | Modify | Add `dark` class to `<html>` to force dark theme globally |
| `src/components/layout/header.tsx` | Modify | Neon sticky header for race/other pages |
| `src/app/page.tsx` | Rewrite | Marketing hero — no DB, inline nav, hero content |

---

## Task 1: Add `dark` class to `<html>` in layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update the `<html>` element to include the `dark` class**

In `src/app/layout.tsx`, change:
```tsx
<html
  lang="en"
  className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
>
```
to:
```tsx
<html
  lang="en"
  className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
>
```

- [ ] **Step 2: Verify dev server shows dark background**

Run: `npm run dev`
Open `http://localhost:3000`. The page background should be near-black (`#0a0a0a`), not white.

---

## Task 2: Add neon CSS to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Append all neon/hero CSS classes to the end of `src/app/globals.css`**

Add the following block at the very end of the file:

```css
/* ============================================================
   SPEED LINE ANIMATION
   ============================================================ */
@keyframes speedLine {
  0%   { transform: translateX(-100%); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateX(200%); opacity: 0; }
}

.speed-line {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent);
  animation: speedLine 3s linear infinite;
  opacity: 0;
  pointer-events: none;
}

.speed-line-orange {
  background: linear-gradient(90deg, transparent, rgba(255, 107, 0, 0.45), transparent);
}

/* ============================================================
   HERO PAGE
   ============================================================ */
.hero-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
  font-style: italic;
}

.hero-title {
  font-size: clamp(56px, 8vw, 92px);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -2px;
  margin-bottom: 18px;
}

.hero-title-type {
  display: block;
  color: #00d4ff;
  text-shadow: 0 0 50px rgba(0, 212, 255, 0.55), 0 0 100px rgba(0, 212, 255, 0.25);
}

.hero-title-racing {
  display: block;
  color: #ff6b00;
  text-shadow: 0 0 50px rgba(255, 107, 0, 0.55), 0 0 100px rgba(255, 107, 0, 0.25);
}

.hero-subtitle {
  font-size: 21px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 14px;
}

.hero-desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.75;
  margin-bottom: 36px;
  max-width: 420px;
}

/* ============================================================
   BUTTONS
   ============================================================ */
.btn-primary-neon {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #ff6b00, #ff9d00);
  color: #fff;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-decoration: none;
  box-shadow: 0 0 32px rgba(255, 107, 0, 0.5);
  transition: box-shadow 0.2s;
  border: none;
  cursor: pointer;
}
.btn-primary-neon:hover {
  box-shadow: 0 0 52px rgba(255, 107, 0, 0.75);
}

.btn-secondary-neon {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 212, 255, 0.07);
  border: 2px solid rgba(0, 212, 255, 0.5);
  color: #00d4ff;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-decoration: none;
  transition: background 0.2s;
  cursor: pointer;
}
.btn-secondary-neon:hover {
  background: rgba(0, 212, 255, 0.14);
}

/* ============================================================
   FEATURE BADGES
   ============================================================ */
.feature-badge {
  display: flex;
  align-items: center;
  gap: 9px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.35;
}

.feature-badge-icon {
  width: 34px;
  height: 34px;
  border-radius: 7px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

/* ============================================================
   NEON HEADER (used by race page + other non-hero pages)
   ============================================================ */
.header-neon {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(5, 9, 26, 0.8);
  border-bottom: 1px solid rgba(0, 212, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.header-neon-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-neon-logo {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.5px;
  text-decoration: none;
}
.header-neon-logo span:first-child { color: #00d4ff; }
.header-neon-logo span:last-child  { color: #ff6b00; }

.header-neon-nav {
  display: flex;
  gap: 28px;
}
.header-neon-nav a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}
.header-neon-nav a:hover { color: #fff; }

.header-neon-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-ghost-neon {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
  padding: 0;
}
.btn-ghost-neon:hover { color: #fff; }

.btn-outline-cyan {
  background: none;
  border: 2px solid #00d4ff;
  color: #00d4ff;
  padding: 7px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-outline-cyan:hover {
  background: rgba(0, 212, 255, 0.1);
}
```

- [ ] **Step 2: Verify no CSS parse errors**

Run: `npm run build`
Expected: build completes without CSS errors. (Or check the dev server console for errors.)

---

## Task 3: Update `header.tsx` to neon theme

**Files:**
- Modify: `src/components/layout/header.tsx`

This header is used by `src/app/race/[id]/page.tsx`. It gets the sticky neon treatment.

- [ ] **Step 1: Replace `src/components/layout/header.tsx` entirely**

```tsx
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
```

- [ ] **Step 2: Verify the race page still renders with the neon header**

Navigate to any active race at `http://localhost:3000/race/<id>`.
Expected: dark neon nav bar at top, race content below.

---

## Task 4: Rewrite `page.tsx` as neon hero

**Files:**
- Modify: `src/app/page.tsx`

The homepage gets its own inline nav (absolute over the hero) and no longer queries the database.

- [ ] **Step 1: Replace `src/app/page.tsx` entirely**

```tsx
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
```

- [ ] **Step 2: Verify the homepage renders correctly**

Open `http://localhost:3000`.
Expected:
- Full-viewport hero with the racing car image as background
- Dark gradient on the left, image visible on the right
- Animated speed lines sweeping across
- "TYPE" in cyan, "RACING" in orange with glow
- Two CTA buttons, three feature badges

---

## Task 5: Add `.superpowers/` to `.gitignore`

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add `.superpowers/` to `.gitignore`**

Open `.gitignore` and add this line:
```
.superpowers/
```

- [ ] **Step 2: Commit all changes**

```bash
git add src/app/globals.css src/app/layout.tsx src/components/layout/header.tsx src/app/page.tsx .gitignore
git commit -m "feat: neon cyberpunk homepage redesign with hero background image"
```
