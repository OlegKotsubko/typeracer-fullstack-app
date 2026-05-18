# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Both servers concurrently (Next.js port 3000 + Socket.io port 3001)
npm run socket       # Socket.io server only (port 3001)
npm run build        # Production build
npm run start        # Production: unified Next.js + Socket.io server (server.ts)
npm run lint         # ESLint
npm run test         # All tests (Jest)
npx jest src/lib/__tests__/typing-logic.test.ts  # Single test file

npx drizzle-kit generate   # Generate migration SQL from schema changes
npx drizzle-kit migrate    # Apply migrations against DATABASE_URL
npx tsx drizzle/seed.ts    # Seed admin user (requires dev server running)
```

## Architecture

TypeRacer is a real-time multiplayer typing race app: Next.js 16 (App Router) + Neon PostgreSQL + Drizzle ORM + Socket.io.

### Next.js 16 "proxy" (not middleware)

Next.js 16 renames the middleware convention. The file is `src/proxy.ts` and exports `proxy()`, not `middleware()`. This protects `/admin/*` routes by checking the BetterAuth session cookie.

### Two server modes

- **Dev**: `npm run dev` runs Next.js and Socket.io as separate processes via `concurrently`. Socket.io listens on port 3001.
- **Production**: `npm run start` executes `server.ts`, which embeds Socket.io directly into the Next.js HTTP server on a single port.

### Database

Neon serverless PostgreSQL via `@neondatabase/serverless`. Drizzle ORM with:
- Schemas in `drizzle/schemas/` (auth, races, billing)
- Barrel export at `drizzle/schema.ts`
- DB connection at `drizzle/index.ts`

Application tables: `races`, `participants`, `winners`, plus billing tables `plan`, `subscription`, `apiKey`.

Race status lifecycle: `draft` → `active` → `ongoing` → `completed`. On server startup, any `ongoing` races are reset to `active` (crash recovery).

### Auth

BetterAuth with email/password. Three entry points:
- `src/lib/auth.ts` — server-side BetterAuth instance
- `src/lib/auth-server.ts` — `getServerSession()` for API routes and server components
- `src/lib/auth-client.ts` — client hooks (`useSession`, `signIn`, `signUp`, `signOut`)

### API v1

All REST routes live under `/api/v1/`. Every handler wraps with `withApi()` from `src/app/api/v1/_lib/handler.ts`, which handles:
- Auth resolution (session cookie **or** Bearer API key via `resolveCaller()` in `_lib/auth.ts`)
- Zod validation for params, query, and body
- Plan enforcement (`requirePlan` option)
- Consistent error formatting

API keys are hashed on storage; `resolveCaller` looks up by prefix+hash.

### Billing / plans

`plan` → `subscription` → user. Plan hierarchy: `free < pro < team`. `requirePlan(caller.plan, 'pro')` in `withApi` options gates endpoints by plan. Service logic in `src/server/services/subscriptions.ts`.

### Real-time (Socket.io)

- `RoomManager` (`src/lib/socket-server-logic.ts`) — in-memory state per race room: participants (max 3), countdown flag, completed count
- `setupSocketHandlers` (`src/lib/socket-handlers.ts`) — wires Socket.io events: `join-race`, `progress-update`, `race-complete`, `disconnect`
- Race starts automatically when a room fills to 3 players (3s countdown via `race-starting` event)
- Client singleton at `src/lib/socket.ts`

### Server services

`src/server/services/` contains the DB query layer: `races.ts`, `participants.ts`, `winners.ts`, `api-keys.ts`, `subscriptions.ts`. API route handlers call these rather than querying Drizzle directly.

### Tests

Jest + ts-jest. Test files live in `__tests__/` subdirectories within `src`. The `@/` path alias is mapped in `jest.config.js`. Tests cover pure logic (typing, countdown, time utils, socket-server-logic) and API route integration (`src/app/api/v1/__tests__/`).