# Server-Side Typing Validation Design

**Date:** 2026-05-18
**Status:** Approved for implementation

---

## Context

The current TypeRacer race flow computes all typing metrics (progress, WPM, mistakes) on the client and sends them to the server via `progress-update` and `race-complete` Socket.io events. The server trusts these values completely — any player can send `wpm: 999, timeSeconds: 0.1` and win. This design moves all validation and computation to the server, making the client a dumb terminal that sends raw input and renders authoritative state.

---

## Data Flow

```
Client: TypingInput (onChange)
  ↓ emit "keystroke" { raceId, participantId, input: "hel" }

Server: socket-handlers.ts
  ↓ look up current word from RoomState.words[wordIndex]
  ↓ detect word submission: trailing space OR last word + exact match
  ↓ if submitted: advance wordIndex, check for race completion
  ↓ compute progress, wpm (via calculateWpm), mistakes
  ↓ broadcast "race-progress" to room with server-computed values
  ↓ if wordIndex > last word: emit "race-complete" from server

Client: race-interface.tsx
  ↓ render whatever the server sends — no local metric computation
```

`race-complete` is server-emitted only. The client never declares itself finished.

---

## RoomManager Changes (`src/lib/socket-server-logic.ts`)

### Updated types

```typescript
type RoomParticipant = {
  id: string;
  nickname: string;
  socketId: string;
  wordIndex: number;   // which word the participant is currently on
  mistakes: number;    // cumulative incorrect chars typed
  startedAt: number;   // Date.now() when race began, for WPM calculation
  lastInput: string;   // last raw input received, for mistake delta detection
};

type RoomState = {
  participants: RoomParticipant[];
  countdownStarted: boolean;
  completedCount: number;
  text: string;        // race text, loaded once when countdown starts
  words: string[];     // text.split(" ") cached for O(1) word lookup
};
```

### New methods

- `setRaceText(raceId, text)` — stores text and words on RoomState; called when countdown fires
- `setStartedAt(raceId)` — stamps `startedAt = Date.now()` on all participants when race begins
- `handleKeystroke(raceId, participantId, input)` — core method:
  - Retrieves participant and current word (`words[wordIndex]`)
  - Detects new characters added (`input.length > lastInput.length`): checks them for errors, increments `mistakes`
  - Detects word submission: `input.endsWith(" ")` OR (`wordIndex === words.length - 1` AND `isExactMatch(input, currentWord)`)
  - On submission: strips trailing space, validates exact match, advances `wordIndex`
  - Computes `progress = (wordIndex / words.length) * 100`
  - Computes `wpm` via existing `calculateWpm(correctChars, elapsed)` where `correctChars` = sum of character counts of all completed words
  - Returns `{ progress, wpm, mistakes, wordIndex, completed: boolean, timeSeconds? }`

---

## Socket Events

### Removed from client
| Event | Reason |
|-------|--------|
| `progress-update` | Replaced by `keystroke` |
| `race-complete` (emit) | Server-emitted only |

### New: client → server
```typescript
socket.emit("keystroke", {
  raceId: string;
  participantId: string;
  input: string;   // current word input; trailing space = submission signal
})
```

### Updated: server → client (same names, server is now the source)
```typescript
// broadcast to all participants in room
socket.to(raceId).emit("race-progress", {
  participantId: string;
  progress: number;    // 0–100
  wpm: number;
  mistakes: number;
  wordIndex: number;
})

// emitted by server when wordIndex advances past last word
socket.to(raceId).emit("race-complete", {
  participantId: string;
  timeSeconds: number;
  wpm: number;
})
```

### `join-race` addition
After the countdown fires, the handler loads the race text from DB and calls `setRaceText(raceId, race.text)`. No new event needed.

---

## Client Changes

### `src/components/race/typing-input.tsx`
- Remove `onMistake` prop — server owns mistake counting
- `onInputChange` forwards raw value only, no local validation side-effects
- `onSubmit` retained for clearing the input field (UX only)

### `src/components/race/race-interface.tsx`
- Remove all local metric state: `totalCorrectChars`, `mistakes`, `wpm`, 1-second WPM interval
- Remove `race-complete` emit
- Replace `progress-update` emit with `keystroke` emit (no debounce — fire on every `onInputChange`)
- Local player's progress/WPM display comes from `race-progress` events (same as other players)
- `race-complete` listener stays, now server-triggered

### `src/lib/typing-logic.ts`
- File stays unchanged — functions move to server-side use only
- `race-interface.tsx` stops importing it; `socket-server-logic.ts` imports it instead

---

## Edge Cases

| Case | Handling |
|------|----------|
| Last word (no trailing space needed) | `wordIndex === words.length - 1` AND `isExactMatch(input, currentWord)` triggers completion |
| Backspace after error | `input.length <= lastInput.length` → no mistake increment, count is never reduced |
| Stale keystroke after race complete | `handleKeystroke` returns early if participant already completed |
| Disconnect mid-race | Existing disconnect handler in `socket-handlers.ts` unchanged |
| Race text not yet loaded (keystroke before countdown) | `handleKeystroke` returns early if `RoomState.words` is empty |

---

## Files Modified

| File | Change |
|------|--------|
| `src/lib/socket-server-logic.ts` | Add fields to types; add `setRaceText`, `setStartedAt`, `handleKeystroke` |
| `src/lib/socket-handlers.ts` | Replace `progress-update` handler with `keystroke`; remove client `race-complete`; server emits `race-complete` |
| `src/components/race/race-interface.tsx` | Remove metric computation; emit `keystroke`; render from server events |
| `src/components/race/typing-input.tsx` | Remove `onMistake` prop |

---

## Verification

1. `npm run test` — existing typing-logic and socket-server-logic tests pass
2. Join a race with 3 players — progress bars update for all players from server events
3. Attempt to cheat: intercept socket and emit `race-complete` directly — server ignores it (event removed)
4. Last word completes without trailing space — race ends correctly
5. Disconnect mid-race — existing behaviour unchanged
6. `npm run lint` — no type errors
