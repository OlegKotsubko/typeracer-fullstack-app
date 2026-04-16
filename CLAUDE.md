# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (Next.js 16)
npm run build        # Production build
npm run lint         # ESLint
npx drizzle-kit generate   # Generate migration from schema changes
npx drizzle-kit migrate    # Run migrations against DATABASE_URL
npx tsx src/db/seed.ts     # Seed admin user (requires dev server running)
```

## Architecture

TypeRacer is a real-time multiplayer typing race app built with Next.js 16 (App Router), Neon PostgreSQL, and Drizzle ORM.

### Key layers

- **Database**: Neon serverless PostgreSQL via `@neondatabase/serverless`. Drizzle ORM with schema in `src/db/schema.ts`, connection in `src/db/index.ts`. Config reads `DATABASE_URL` from `.env.local`.
- **Auth**: BetterAuth with email/password. Three entry points:
  - `src/lib/auth.ts` — server-side auth instance (BetterAuth + Drizzle adapter)
  - `src/lib/auth-server.ts` — `getServerSession()` helper for API routes/server components
  - `src/lib/auth-client.ts` — client-side hooks (`useSession`, `signIn`, `signUp`, `signOut`)
  - Catch-all route at `src/app/api/auth/[...all]/route.ts`
- **Middleware**: `src/middleware.ts` protects `/admin/*` routes — redirects unauthenticated users to `/admin/login`.

### Data model

Two application tables (plus BetterAuth's `user`, `session`, `account`, `verification`):
- `races` — typing race with title, text content, and status (draft/active/completed)
- `participants` — joined players tracking progress, mistakes, totalAttempted, timing

### Real-time sync

- **SSE**: `GET /api/races/[id]/events` streams participant data every 2s via Server-Sent Events
- **Client debounce**: `src/lib/race-sync.ts` debounces progress PATCH calls (300ms), sends completion immediately

### Route structure

- `/` — public homepage, lists active races
- `/race/[id]` — public race page (join + type)
- `/admin/*` — authenticated admin panel (CRUD for races)
- `/api/races/*` — REST API; write endpoints require session auth

### UI

shadcn/ui components in `src/components/ui/`, app components in `src/components/race/` and `src/components/layout/`. Tailwind CSS v4 with `@tailwindcss/postcss`. Uses `sonner` for toasts.

### Path alias

`@/*` maps to `./src/*` (tsconfig paths).
