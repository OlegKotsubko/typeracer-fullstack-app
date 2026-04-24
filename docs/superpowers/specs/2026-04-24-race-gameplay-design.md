# Race Gameplay Redesign

## Overview

Redesign the race page experience: lobby with 3-player minimum, traffic light countdown, character-level typing with mandatory error correction, live WPM, and WebSocket-based real-time sync via Socket.io.

## Race Flow & States

```
idle → joined (lobby) → countdown → racing → finished
```

- **Idle**: Nickname input (existing JoinDialog).
- **Joined (Lobby)**: 3 slots displayed. Filled slots show nickname + checkmark. Empty slots show dashed border + "Waiting..." text. Updates in real-time via WebSocket. Joining is locked once 3 players are present.
- **Countdown**: 3-second traffic light — red (1s) → yellow (1s) → green (1s). No race text or input visible. Server sets `startAt = now + 3s` when 3rd player joins, broadcasts to all clients. All clients derive countdown from this timestamp.
- **Racing**: Race text appears, input enabled, countdown timer starts from `durationSeconds`. Character-by-character typing with live error highlighting. Live WPM. Participant progress via WebSocket.
- **Finished**: Timer hits 00:00 (input disables) or user completes all words. Results card with WPM, accuracy, mistakes, time.

## Socket.io Architecture

### Server

Standalone Node.js process (`src/socket-server.ts`) running on port 3001. Next.js stays on port 3000. CORS configured for `localhost:3000`.

### Rooms

One Socket.io room per race (`race:{raceId}`).

### Events

| Direction | Event | Payload | When |
|-----------|-------|---------|------|
| Client → Server | `join-race` | `{ raceId, nickname }` | User submits nickname |
| Server → Room | `participant-joined` | `{ participants: [...], slots: 3 }` | Someone joins |
| Server → Room | `race-starting` | `{ startAt: ISO timestamp }` | 3rd player joins |
| Client → Server | `progress-update` | `{ participantId, progress, mistakes, totalAttempted, wpm }` | As user types (debounced 300ms) |
| Server → Room | `race-progress` | `{ participants: [...] }` | Broadcasts progress |
| Client → Server | `race-complete` | `{ participantId, completedAt }` | User finishes all words |
| Server → Room | `participant-completed` | `{ participantId, completedAt }` | Broadcast completion |
| Server → Room | `participant-left` | `{ participants: [...] }` | Someone disconnects |

### Server Responsibilities

1. Manages race rooms and participant state in memory.
2. Persists participant joins/progress/completion to DB via Drizzle.
3. Sets `startAt` on the race when 3rd player joins.
4. Rejects `join-race` if room already has 3 participants or countdown has started.
5. On disconnect: deletes participant from DB, broadcasts updated list.

### Client Connection

Shared utility (`src/lib/socket.ts`) creates a singleton Socket.io client instance. Connection URL from environment variable, defaults to `localhost:3001`.

### What Gets Replaced

- SSE endpoint (`/api/races/[id]/events/route.ts`) — removed
- PATCH progress endpoint usage (`src/lib/race-sync.ts`) — removed
- POST for joining — moves to Socket.io `join-race` event
- DELETE for leaving — handled by Socket.io `disconnect`

Admin REST API routes remain unchanged.

### Disconnect Behavior

- **During lobby** (before countdown): participant removed from DB, slot freed, new players can join.
- **During countdown or racing**: participant removed from DB and progress list, but slot stays filled (no new joins).

## Character-Level Typing Mechanic

The user types character-by-character against the current word:

- Each correct character shows green in the text display.
- First incorrect character: from that point onward, everything typed is marked red — even if subsequent characters happen to match.
- User **must** backspace to the mistake and retype correctly. Space/Enter only works when input exactly matches the current word.
- Space or Enter submits the current word and advances to the next.
- Every wrong keystroke increments the mistake counter.

Since every submitted word is correct by definition, "mistakes" now means total incorrect keystrokes, not incorrect words.

## Data Model Changes

### `races` table — new column

- `startAt` (timestamp, nullable) — set when 3rd player joins, used by all clients for countdown sync.

### `participants` table — new column

- `wpm` (integer, default 0) — live WPM so opponents can see each other's speed.

### Metrics

- **Progress**: `Math.round((completedWords / totalWords) * 100)` — unchanged.
- **Mistakes**: Total incorrect keystrokes (changed from incorrect words).
- **WPM (live)**: `(totalCorrectChars / 5) / elapsedMinutes`, updated every second client-side.
- **Synced via WebSocket** (debounced 300ms): `progress`, `mistakes`, `totalAttempted`, `wpm`.

## UI Components

### New

- **`RaceLobby`** — 3 slot cards. Filled = nickname + checkmark. Empty = dashed border + "Waiting...". Real-time updates via WebSocket.
- **`TrafficLight`** — 3 circles (red, yellow, green) stacked vertically. Each lights up for 1 second in sequence derived from `startAt`. Centered, large, prominent. Disappears after green.

### Modified

- **`RaceInterface`** — new `lobby` and `countdown` states. Connects to Socket.io. Removes `race-sync.ts` and SSE usage.
- **`TextDisplay`** — character-level coloring within the current word. Correct chars green, mistake chars red. Untyped chars remain default.
- **`TypingInput`** — character-by-character validation. Space/Enter blocked until input matches current word. Tracks wrong keystrokes.
- **`ProgressPanel`** — adds live WPM display. Timer counts down from `durationSeconds` starting at `startAt`.
- **`ParticipantList`** — reads from WebSocket state instead of SSE. Shows WPM next to each participant's progress bar.
- **`RaceTimer`** — starts from server-provided `startAt` instead of user's first keystroke.

### Removed

- **`src/lib/race-sync.ts`** — replaced by Socket.io events.
- **`src/app/api/races/[id]/events/route.ts`** — replaced by WebSocket.

## Socket.io Server Setup

- **File**: `src/socket-server.ts`
- **Dev**: `npx tsx src/socket-server.ts` (npm script: `npm run socket`)
- **Port**: 3001 (configurable via env)
- **CORS**: allows Next.js origin
- **Dependencies**: `socket.io` (server), `socket.io-client` (client)

### Race Lifecycle

1. Client sends `join-race` → server creates DB participant, adds to room, broadcasts `participant-joined`.
2. Room reaches 3 → server sets `startAt = now + 3s` on race in DB, broadcasts `race-starting`.
3. Clients send `progress-update` → server persists to DB, broadcasts `race-progress`.
4. Client sends `race-complete` → server persists `completedAt`, broadcasts `participant-completed`.
5. On disconnect → server deletes participant from DB, broadcasts `participant-left`.
