# Homepage Redesign — Design Spec

**Date:** 2026-04-16  
**Status:** Approved

## Overview

Replace the current functional homepage (active races list) with a full-viewport marketing hero page styled as a neon cyberpunk racing theme, closely matching the reference image provided by the user.

## Layout

### Navigation Bar
- Floating over the hero (absolutely positioned, `z-index` above hero content)
- Semi-transparent dark background (`rgba(5,9,26,0.75)`) with `backdrop-filter: blur`
- Bottom border: subtle cyan glow line (`rgba(0,212,255,0.15)`)
- **Left:** `TYPERACER` logo — "TYPE" in cyan `#00d4ff`, "RACER" in orange `#ff6b00`
- **Center:** nav links — Races, Leaderboard, About (link to `/`, placeholder for now)
- **Right:** "Login" ghost button + "View Races" outlined cyan button

### Hero Section
- Full viewport height (`100vh`)
- **Background:** `/hero.png` (`background-size: cover`, `background-position: center`)
- **Overlay:** left-to-right gradient — opaque dark (`rgba(5,9,26,0.95)`) at 0% fading to transparent at ~75% — so the car/finish/stats artwork in the image shows through on the right
- Animated speed lines (CSS `@keyframes`) — subtle cyan and orange horizontal streaks across the full width
- No separate HTML stats cards (WPM / Rank / Opponent are already baked into the image artwork)

### Hero Text Content (left side, `max-width: 540px`)
1. **Eyebrow:** `MASTER THE KEYBOARD. ACE THE RACE.` — small caps, muted white, letter-spaced
2. **H1 Title:**
   - `TYPE` — block, cyan `#00d4ff`, glow text-shadow
   - `RACING` — block, orange `#ff6b00`, glow text-shadow
   - `font-size: clamp(56px, 8vw, 92px)`, `font-weight: 900`
3. **H2 Subtitle:** `The Ultimate Competitive Typing Game` — white, `font-size: 21px`
4. **Description paragraph:** `Type fast, compete globally...` — muted white, `font-size: 15px`
5. **CTA buttons:**
   - Primary: `PLAY FOR FREE NOW` — orange gradient, orange glow shadow, links to `/races` (or first active race)
   - Secondary: `BROWSE RACES` — cyan outline, links to `/races`
6. **Feature badges row:** three icon+label badges: ⚡ Live Races · 🏆 Real-time Progress · 🌐 Global Players

## Color Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#05091a` | Page base |
| Cyan accent | `#00d4ff` | TYPE text, borders, links |
| Orange accent | `#ff6b00` | RACING text, primary CTA |
| Text primary | `#ffffff` | Headings |
| Text muted | `rgba(255,255,255,0.65)` | Body copy, nav links |
| Nav bg | `rgba(5,9,26,0.75)` | Glassmorphism nav |

## Files Changed

| File | Change |
|---|---|
| `src/app/page.tsx` | Full rewrite — remove DB queries/races list, render hero layout |
| `src/components/layout/header.tsx` | Full rewrite — neon theme, floating/absolute positioning |
| `src/app/globals.css` | Add dark default theme variables (force dark mode globally) |

## What Is NOT Changed

- `/race/[id]` page and all race functionality
- All API routes
- Admin panel
- Database schema
- Auth

## Notes

- The `races` DB query is removed from the homepage — "Play for Free Now" links to `/races` (a future page) or can be a simple anchor that scrolls or navigates. For now, link to the first active race or just `/`.
- `hero.png` is already in `/public/hero.png`.
- Add `.superpowers/` to `.gitignore`.
