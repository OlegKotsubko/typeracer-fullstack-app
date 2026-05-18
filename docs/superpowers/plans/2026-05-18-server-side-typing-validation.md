# Server-Side Typing Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all typing metric computation (progress, WPM, mistakes, word advancement) from the client to the server so clients cannot cheat by sending fake values.

**Architecture:** Client emits a `keystroke` Socket.io event with raw input on every keystroke; server validates against stored race text in `RoomManager`, computes authoritative metrics, and broadcasts `race-progress` to all participants. Server emits `race-complete` when it detects 100% completion — client never self-reports done.

**Tech Stack:** Socket.io, TypeScript, Next.js App Router, Jest/ts-jest

---

## File Structure

| File | Change |
|------|--------|
| `src/lib/socket-server-logic.ts` | Extend `RoomParticipant` and `RoomState` types; add `setRaceText`, `handleKeystroke` methods |
| `src/lib/__tests__/socket-server-logic.test.ts` | Update existing tests for new fields; add tests for `setRaceText` and `handleKeystroke` |
| `src/lib/socket-handlers.ts` | Replace `progress-update` handler with `keystroke`; load race text on countdown; server emits `race-complete` |
| `src/components/race/typing-input.tsx` | Remove `onMistake` prop; emit submission signal via `onInputChange` before clearing |
| `src/components/race/race-interface.tsx` | Remove metric computation; emit `keystroke`; drive display state from `race-progress` events |

---

## Task 1: Extend RoomManager — failing tests first

**Files:**
- Modify: `src/lib/__tests__/socket-server-logic.test.ts`

- [ ] **Step 1: Update existing tests to use `objectContaining` (they break when new fields are added)**

Replace the `addParticipant` and `findBySocketId` assertions so they tolerate extra fields on participant objects:

```typescript
// src/lib/__tests__/socket-server-logic.test.ts
import { RoomManager } from "../socket-server-logic";

describe("RoomManager", () => {
  let manager: RoomManager;

  beforeEach(() => {
    manager = new RoomManager();
  });

  it("adds a participant to a room", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    expect(manager.getParticipants("race-1")).toEqual([
      expect.objectContaining({ id: "p1", nickname: "Alice", socketId: "s1" }),
    ]);
  });

  it("returns true when room is full (3 participants)", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" });
    expect(manager.isFull("race-1")).toBe(false);
    manager.addParticipant("race-1", { id: "p3", nickname: "Charlie", socketId: "s3" });
    expect(manager.isFull("race-1")).toBe(true);
  });

  it("rejects join when room is full", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" });
    manager.addParticipant("race-1", { id: "p3", nickname: "Charlie", socketId: "s3" });
    expect(manager.canJoin("race-1")).toBe(false);
  });

  it("rejects join when countdown has started", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" });
    manager.addParticipant("race-1", { id: "p3", nickname: "Charlie", socketId: "s3" });
    manager.markCountdownStarted("race-1");
    expect(manager.canJoin("race-1")).toBe(false);
  });

  it("removes participant and frees slot during lobby", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" });
    manager.removeParticipant("race-1", "s2");
    expect(manager.getParticipants("race-1")).toEqual([
      expect.objectContaining({ id: "p1", nickname: "Alice", socketId: "s1" }),
    ]);
    expect(manager.canJoin("race-1")).toBe(true);
  });

  it("removes participant but keeps slot filled after countdown", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" });
    manager.addParticipant("race-1", { id: "p3", nickname: "Charlie", socketId: "s3" });
    manager.markCountdownStarted("race-1");
    manager.removeParticipant("race-1", "s2");
    expect(manager.getParticipants("race-1")).toHaveLength(2);
    expect(manager.canJoin("race-1")).toBe(false);
  });

  it("finds participant by socket ID", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    expect(manager.findBySocketId("s1")).toEqual({
      raceId: "race-1",
      participant: expect.objectContaining({ id: "p1", nickname: "Alice", socketId: "s1" }),
    });
  });

  it("returns null for unknown socket ID", () => {
    expect(manager.findBySocketId("unknown")).toBeNull();
  });

  // --- New tests for setRaceText and handleKeystroke ---

  describe("setRaceText", () => {
    it("stores the race text and word list", () => {
      manager.setRaceText("race-1", "hello world");
      // handleKeystroke returns null when no participant, but non-null when participant exists
      manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
      manager.setStartedAt("race-1");
      const result = manager.handleKeystroke("race-1", "p1", "hel");
      expect(result).not.toBeNull();
    });
  });

  describe("handleKeystroke", () => {
    beforeEach(() => {
      manager.setRaceText("race-1", "hello world");
      manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
      manager.setStartedAt("race-1");
    });

    it("returns null when race text is not loaded", () => {
      const fresh = new RoomManager();
      fresh.addParticipant("race-2", { id: "p1", nickname: "Alice", socketId: "s1" });
      expect(fresh.handleKeystroke("race-2", "p1", "hel")).toBeNull();
    });

    it("returns null for unknown participant", () => {
      expect(manager.handleKeystroke("race-1", "unknown", "hel")).toBeNull();
    });

    it("returns progress for partial input", () => {
      const result = manager.handleKeystroke("race-1", "p1", "hel");
      expect(result).toMatchObject({
        wordIndex: 0,
        completed: false,
        mistakes: 0,
        progress: expect.any(Number),
        wpm: expect.any(Number),
      });
    });

    it("does not advance wordIndex on partial input", () => {
      manager.handleKeystroke("race-1", "p1", "hel");
      const result = manager.handleKeystroke("race-1", "p1", "hell");
      expect(result?.wordIndex).toBe(0);
    });

    it("advances wordIndex when trailing space + exact match", () => {
      const result = manager.handleKeystroke("race-1", "p1", "hello ");
      expect(result?.wordIndex).toBe(1);
      expect(result?.completed).toBe(false);
    });

    it("does not advance wordIndex on wrong word + trailing space", () => {
      const result = manager.handleKeystroke("race-1", "p1", "helo ");
      expect(result?.wordIndex).toBe(0);
    });

    it("completes race on last word exact match without trailing space", () => {
      manager.handleKeystroke("race-1", "p1", "hello ");
      const result = manager.handleKeystroke("race-1", "p1", "world");
      expect(result?.completed).toBe(true);
      expect(result?.wordIndex).toBe(2);
      expect(result?.timeSeconds).toBeGreaterThan(0);
      expect(result?.progress).toBe(100);
    });

    it("completes race on last word with trailing space too", () => {
      manager.handleKeystroke("race-1", "p1", "hello ");
      const result = manager.handleKeystroke("race-1", "p1", "world ");
      expect(result?.completed).toBe(true);
    });

    it("returns null for keystrokes after race completion", () => {
      manager.handleKeystroke("race-1", "p1", "hello ");
      manager.handleKeystroke("race-1", "p1", "world");
      const result = manager.handleKeystroke("race-1", "p1", "extra");
      expect(result).toBeNull();
    });

    it("increments mistakes on newly typed incorrect characters", () => {
      manager.handleKeystroke("race-1", "p1", "x");
      const result = manager.handleKeystroke("race-1", "p1", "xy");
      expect(result?.mistakes).toBe(2);
    });

    it("does not increment mistakes on backspace (shorter input)", () => {
      manager.handleKeystroke("race-1", "p1", "x");
      const result = manager.handleKeystroke("race-1", "p1", "");
      expect(result?.mistakes).toBe(1);
    });

    it("does not increment mistakes for correct characters", () => {
      manager.handleKeystroke("race-1", "p1", "h");
      const result = manager.handleKeystroke("race-1", "p1", "he");
      expect(result?.mistakes).toBe(0);
    });

    it("progress is 100 after completing all words", () => {
      manager.handleKeystroke("race-1", "p1", "hello ");
      const result = manager.handleKeystroke("race-1", "p1", "world");
      expect(result?.progress).toBe(100);
    });
  });
});
```

- [ ] **Step 2: Run tests — verify new tests fail**

```bash
npx jest src/lib/__tests__/socket-server-logic.test.ts --no-coverage
```

Expected: existing tests pass, new `setRaceText`/`handleKeystroke` tests fail with "not a function" or similar.

---

## Task 2: Implement RoomManager extensions

**Files:**
- Modify: `src/lib/socket-server-logic.ts`

- [ ] **Step 1: Replace the entire file with the extended implementation**

```typescript
// src/lib/socket-server-logic.ts
import { calculateWpm, isExactMatch, validateInput } from "@/lib/typing-logic";

export type RoomParticipant = {
  id: string;
  nickname: string;
  socketId: string;
  wordIndex: number;
  mistakes: number;
  startedAt: number;
  lastInput: string;
};

type RoomState = {
  participants: RoomParticipant[];
  countdownStarted: boolean;
  completedCount: number;
  text: string;
  words: string[];
};

export type KeystrokeResult = {
  progress: number;
  wpm: number;
  mistakes: number;
  wordIndex: number;
  completed: boolean;
  timeSeconds?: number;
  totalCorrectChars: number;
};

export class RoomManager {
  private rooms = new Map<string, RoomState>();

  private getOrCreateRoom(raceId: string): RoomState {
    let room = this.rooms.get(raceId);
    if (!room) {
      room = { participants: [], countdownStarted: false, completedCount: 0, text: "", words: [] };
      this.rooms.set(raceId, room);
    }
    return room;
  }

  addParticipant(raceId: string, participant: Pick<RoomParticipant, "id" | "nickname" | "socketId">): void {
    const room = this.getOrCreateRoom(raceId);
    room.participants.push({
      ...participant,
      wordIndex: 0,
      mistakes: 0,
      startedAt: 0,
      lastInput: "",
    });
  }

  removeParticipant(raceId: string, socketId: string): RoomParticipant | null {
    const room = this.rooms.get(raceId);
    if (!room) return null;
    const index = room.participants.findIndex((p) => p.socketId === socketId);
    if (index === -1) return null;
    const [removed] = room.participants.splice(index, 1);
    return removed;
  }

  getParticipants(raceId: string): RoomParticipant[] {
    return this.rooms.get(raceId)?.participants ?? [];
  }

  isFull(raceId: string): boolean {
    return this.getParticipants(raceId).length >= 3;
  }

  canJoin(raceId: string): boolean {
    const room = this.rooms.get(raceId);
    if (!room) return true;
    if (room.countdownStarted) return false;
    return room.participants.length < 3;
  }

  markCountdownStarted(raceId: string): void {
    const room = this.getOrCreateRoom(raceId);
    room.countdownStarted = true;
  }

  isCountdownStarted(raceId: string): boolean {
    return this.rooms.get(raceId)?.countdownStarted ?? false;
  }

  findBySocketId(socketId: string): { raceId: string; participant: RoomParticipant } | null {
    for (const [raceId, room] of Array.from(this.rooms.entries())) {
      const participant = room.participants.find((p) => p.socketId === socketId);
      if (participant) return { raceId, participant };
    }
    return null;
  }

  markParticipantDone(raceId: string): { allDone: boolean } {
    const room = this.rooms.get(raceId);
    if (!room) return { allDone: true };
    room.completedCount++;
    return { allDone: room.completedCount >= room.participants.length };
  }

  isAllDone(raceId: string): boolean {
    const room = this.rooms.get(raceId);
    if (!room) return false;
    return room.participants.length === 0 || room.completedCount >= room.participants.length;
  }

  resetRoom(raceId: string): void {
    this.rooms.delete(raceId);
  }

  setRaceText(raceId: string, text: string): void {
    const room = this.getOrCreateRoom(raceId);
    room.text = text;
    room.words = text.split(" ").filter((w) => w.length > 0);
  }

  setStartedAt(raceId: string): void {
    const room = this.rooms.get(raceId);
    if (!room) return;
    const now = Date.now();
    for (const p of room.participants) {
      p.startedAt = now;
    }
  }

  handleKeystroke(raceId: string, participantId: string, input: string): KeystrokeResult | null {
    const room = this.rooms.get(raceId);
    if (!room || room.words.length === 0) return null;

    const participant = room.participants.find((p) => p.id === participantId);
    if (!participant || participant.startedAt === 0) return null;

    // Already completed
    if (participant.wordIndex >= room.words.length) return null;

    const { words } = room;
    const currentWord = words[participant.wordIndex];

    // Count mistakes only for newly added characters
    if (input.length > participant.lastInput.length) {
      const newChars = input.slice(participant.lastInput.length);
      for (let i = 0; i < newChars.length; i++) {
        const charIndex = participant.lastInput.length + i;
        const expected = currentWord[charIndex];
        if (expected === undefined || newChars[i] !== expected) {
          participant.mistakes++;
        }
      }
    }
    participant.lastInput = input;

    const isLastWord = participant.wordIndex === words.length - 1;
    const trimmed = input.endsWith(" ") ? input.slice(0, -1) : input;
    const isSubmission = input.endsWith(" ") || (isLastWord && isExactMatch(input, currentWord));

    if (isSubmission && isExactMatch(trimmed, currentWord)) {
      participant.wordIndex++;
      participant.lastInput = "";

      const totalCorrectChars = words
        .slice(0, participant.wordIndex)
        .reduce((sum, w) => sum + w.length, 0);

      const elapsed = Date.now() - participant.startedAt;
      const wpm = calculateWpm(totalCorrectChars, elapsed);
      const progress = Math.round((participant.wordIndex / words.length) * 100);
      const completed = participant.wordIndex >= words.length;
      const timeSeconds = completed
        ? parseFloat((elapsed / 1000).toFixed(1))
        : undefined;

      return { progress, wpm, mistakes: participant.mistakes, wordIndex: participant.wordIndex, completed, timeSeconds, totalCorrectChars };
    }

    // Partial input — compute intermediate progress
    const completedChars = words
      .slice(0, participant.wordIndex)
      .reduce((sum, w) => sum + w.length, 0);
    const correctInCurrent = validateInput(input, currentWord).filter((c) => c.status === "correct").length;
    const totalCorrectChars = completedChars + correctInCurrent;
    const totalChars = words.reduce((sum, w) => sum + w.length, 0);
    const elapsed = Date.now() - participant.startedAt;
    const wpm = calculateWpm(totalCorrectChars, elapsed);
    const progress = totalChars > 0 ? Math.round((totalCorrectChars / totalChars) * 100) : 0;

    return { progress, wpm, mistakes: participant.mistakes, wordIndex: participant.wordIndex, completed: false, totalCorrectChars };
  }
}
```

- [ ] **Step 2: Run tests — all should pass**

```bash
npx jest src/lib/__tests__/socket-server-logic.test.ts --no-coverage
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/socket-server-logic.ts src/lib/__tests__/socket-server-logic.test.ts
git commit -m "feat: extend RoomManager with server-side typing validation"
```

---

## Task 3: Update socket-handlers — keystroke event

**Files:**
- Modify: `src/lib/socket-handlers.ts`

- [ ] **Step 1: Replace the entire file**

```typescript
// src/lib/socket-handlers.ts
import { eq, asc } from "drizzle-orm";
import type { Server, Socket } from "socket.io";
import type { drizzle } from "drizzle-orm/neon-http";
import type * as schema from "@drizzle/schema";
import type { RoomManager } from "@/lib/socket-server-logic";

type DB = ReturnType<typeof drizzle<typeof schema>>;

async function checkAndInsertWinner(
  db: DB,
  winners: typeof schema.winners,
  entry: { nickname: string; raceTitle: string; timeSeconds: number; wpm: number; completedAt: Date }
) {
  const current = await db.select().from(winners).orderBy(asc(winners.timeSeconds));
  if (current.length < 10) {
    await db.insert(winners).values(entry);
  } else {
    const slowest = current[current.length - 1];
    if (entry.timeSeconds < slowest.timeSeconds) {
      await db.insert(winners).values(entry);
      await db.delete(winners).where(eq(winners.id, slowest.id));
    }
  }
}

async function endRace(
  db: DB,
  rooms: RoomManager,
  io: Server,
  raceId: string,
  races: typeof schema.races,
  participants: typeof schema.participants
) {
  await db.update(races).set({ status: "active", startAt: null }).where(eq(races.id, raceId));
  await db.delete(participants).where(eq(participants.raceId, raceId));
  rooms.resetRoom(raceId);
  io.to(`race:${raceId}`).emit("race-ended");
}

export function setupSocketHandlers(
  io: Server,
  db: DB,
  rooms: RoomManager,
  races: typeof schema.races,
  participants: typeof schema.participants,
  winners: typeof schema.winners
) {
  io.on("connection", (socket: Socket) => {
    socket.on(
      "join-race",
      async (
        data: { raceId: string; nickname: string },
        callback: (response: { participantId?: string; error?: string }) => void
      ) => {
        const { raceId, nickname } = data;

        if (!rooms.canJoin(raceId)) {
          callback({ error: "Race is full or already started" });
          return;
        }

        const [participant] = await db
          .insert(participants)
          .values({ raceId, nickname: nickname.trim() })
          .returning();

        rooms.addParticipant(raceId, { id: participant.id, nickname: participant.nickname, socketId: socket.id });
        socket.join(`race:${raceId}`);

        io.to(`race:${raceId}`).emit("participant-joined", {
          participants: rooms.getParticipants(raceId).map((p) => ({ id: p.id, nickname: p.nickname })),
          slots: 3,
        });

        callback({ participantId: participant.id });

        if (rooms.isFull(raceId)) {
          const startAt = new Date(Date.now() + 3000);
          rooms.markCountdownStarted(raceId);

          // Load race text into memory for server-side validation
          const [race] = await db
            .select({ text: races.text })
            .from(races)
            .where(eq(races.id, raceId));
          if (race) rooms.setRaceText(raceId, race.text);

          await db.update(races).set({ status: "ongoing", startAt }).where(eq(races.id, raceId));
          io.to(`race:${raceId}`).emit("race-starting", { startAt: startAt.toISOString() });
        }
      }
    );

    socket.on(
      "keystroke",
      async (data: { raceId: string; participantId: string; input: string }) => {
        try {
          const { raceId, participantId, input } = data;

          // Lazy-stamp startedAt on first keystroke
          const participant = rooms.getParticipants(raceId).find((p) => p.id === participantId);
          if (participant && participant.startedAt === 0) {
            rooms.setStartedAt(raceId);
          }

          const result = rooms.handleKeystroke(raceId, participantId, input);
          if (!result) return;

          const { progress, wpm, mistakes, wordIndex, completed, timeSeconds, totalCorrectChars } = result;

          db.update(participants)
            .set({ progress, mistakes, wpm })
            .where(eq(participants.id, participantId))
            .then(() => {});

          io.to(`race:${raceId}`).emit("race-progress", {
            participantId,
            progress,
            wpm,
            mistakes,
            wordIndex,
            totalCorrectChars,
          });

          if (completed) {
            const completedAt = new Date();

            await db
              .update(participants)
              .set({ progress: 100, completedAt })
              .where(eq(participants.id, participantId));

            io.to(`race:${raceId}`).emit("participant-completed", {
              participantId,
              completedAt: completedAt.toISOString(),
            });

            io.to(`race:${raceId}`).emit("race-complete", {
              participantId,
              timeSeconds,
              wpm,
            });

            const roomParticipant = rooms.getParticipants(raceId).find((p) => p.id === participantId);
            const [race] = await db
              .select({ title: races.title })
              .from(races)
              .where(eq(races.id, raceId));

            if (race && roomParticipant && timeSeconds !== undefined) {
              await checkAndInsertWinner(db, winners, {
                nickname: roomParticipant.nickname,
                raceTitle: race.title,
                timeSeconds,
                wpm,
                completedAt,
              });
            }

            const { allDone } = rooms.markParticipantDone(raceId);
            if (allDone) await endRace(db, rooms, io, raceId, races, participants);
          }
        } catch (err) {
          console.error("[keystroke] ERROR:", err);
        }
      }
    );

    socket.on("disconnect", async () => {
      const found = rooms.findBySocketId(socket.id);
      if (!found) return;

      const { raceId, participant } = found;
      const wasCountdownStarted = rooms.isCountdownStarted(raceId);
      rooms.removeParticipant(raceId, socket.id);

      await db.delete(participants).where(eq(participants.id, participant.id));

      io.to(`race:${raceId}`).emit("participant-left", {
        participants: rooms.getParticipants(raceId).map((p) => ({ id: p.id, nickname: p.nickname })),
      });

      if (wasCountdownStarted && rooms.isAllDone(raceId)) {
        await endRace(db, rooms, io, raceId, races, participants);
      }
    });
  });
}
```

- [ ] **Step 2: Run lint — verify no type errors**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/socket-handlers.ts
git commit -m "feat: replace progress-update with server-side keystroke handler"
```

---

## Task 4: Update TypingInput — emit submission signal via onInputChange

**Files:**
- Modify: `src/components/race/typing-input.tsx`

- [ ] **Step 1: Replace the file**

Key changes:
- Remove `onMistake` prop
- Call `onInputChange(newValue)` before clearing on space-submission (sends "hello " to parent)
- On Enter: call `onInputChange(value + " ")` before clearing

```typescript
// src/components/race/typing-input.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { isExactMatch } from "@/lib/typing-logic";

export function TypingInput({
  currentWord,
  onSubmit,
  onInputChange,
  disabled,
}: {
  currentWord: string;
  onSubmit: () => void;
  onInputChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLengthRef = useRef(0);

  /* eslint-disable react-hooks/set-state-in-effect -- reset input when word changes */
  useEffect(() => {
    setValue("");
    prevLengthRef.current = 0;
    onInputChange("");
    inputRef.current?.focus();
  }, [currentWord, onInputChange]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    prevLengthRef.current = newValue.length;

    if (newValue.endsWith(" ")) {
      const typed = newValue.trimEnd();
      if (isExactMatch(typed, currentWord)) {
        onInputChange(newValue); // send "hello " to server before clearing
        setValue("");
        prevLengthRef.current = 0;
        onSubmit();
      }
      // wrong word + space: ignore silently
      return;
    }

    setValue(newValue);
    onInputChange(newValue);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (isExactMatch(value, currentWord)) {
        onInputChange(value + " "); // trailing space = submission signal for server
        setValue("");
        prevLengthRef.current = 0;
        onSubmit();
      }
      e.preventDefault();
    }
  }

  return (
    <div>
      <div className="input-row">
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(e) => e.preventDefault()}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Burn the prompt..."
          disabled={disabled}
        />
      </div>
      <p className="input-hint">
        <kbd>Space</kbd> or <kbd>Enter</kbd> to commit when the word is clean
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/race/typing-input.tsx
git commit -m "feat: remove onMistake from TypingInput, emit submission signal via onInputChange"
```

---

## Task 5: Update RaceInterface — server-driven state

**Files:**
- Modify: `src/components/race/race-interface.tsx`

- [ ] **Step 1: Replace the file**

Key changes:
- Remove: `totalCorrectChars`, `mistakes`, `wpm`, `completedWords` state, 1-second WPM interval, `debounceRef`
- Remove: `handleMistake`, all metric computation in `handleWordSubmit`
- `handleWordSubmit` only clears input and optimistically advances `currentWordIndex`
- `handleInputChange` emits `keystroke` with raw value
- `race-progress` drives display: updates `localProgress`, `localWpm`, `localMistakes`, `currentWordIndex` for local player
- Add `race-complete` socket listener to handle server-triggered finish
- `ProgressPanel` uses server-provided values

```typescript
// src/components/race/race-interface.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { JoinDialog } from "./join-dialog";
import { RaceLobby } from "./race-lobby";
import { TrafficLight } from "./traffic-light";
import { TextDisplay } from "./text-display";
import { TypingInput } from "./typing-input";
import { ProgressPanel } from "./progress-panel";
import { RaceComplete } from "./race-complete";
import { ParticipantList, ParticipantData } from "./participant-list";
import { RaceTimer } from "./race-timer";
import { getSocket } from "@/lib/socket";

type RaceState = "idle" | "lobby" | "countdown" | "racing" | "finished";

type LobbyParticipant = {
  id: string;
  nickname: string;
};

export function RaceInterface({
  raceId,
  raceTitle,
  raceText,
  durationSeconds,
}: {
  raceId: string;
  raceTitle: string;
  raceText: string;
  durationSeconds: number | null;
}) {
  const words = useMemo(() => raceText.split(/\s+/), [raceText]);
  const [state, setState] = useState<RaceState>("idle");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);

  // Server-authoritative display metrics
  const [localProgress, setLocalProgress] = useState(0);
  const [localWpm, setLocalWpm] = useState(0);
  const [localMistakes, setLocalMistakes] = useState(0);
  const [localCorrectChars, setLocalCorrectChars] = useState(0);

  const [lobbyParticipants, setLobbyParticipants] = useState<LobbyParticipant[]>([]);
  const [raceParticipants, setRaceParticipants] = useState<ParticipantData[]>([]);

  const socketRef = useRef(getSocket());
  const participantIdRef = useRef<string | null>(null);
  participantIdRef.current = participantId;

  useEffect(() => {
    const socket = socketRef.current;
    socket.connect();

    socket.on("participant-joined", (data: { participants: LobbyParticipant[]; slots: number }) => {
      setLobbyParticipants(data.participants);
    });

    socket.on("race-starting", (data: { startAt: string }) => {
      setStartAt(new Date(data.startAt));
      setState("countdown");
    });

    socket.on("race-progress", (data: {
      participantId: string;
      progress: number;
      wpm: number;
      mistakes: number;
      wordIndex: number;
      totalCorrectChars: number;
    }) => {
      if (data.participantId === participantIdRef.current) {
        setLocalProgress(data.progress);
        setLocalWpm(data.wpm);
        setLocalMistakes(data.mistakes);
        setLocalCorrectChars(data.totalCorrectChars);
        setCurrentWordIndex(data.wordIndex);
      }
      setRaceParticipants((prev) => {
        const existing = prev.find((p) => p.id === data.participantId);
        if (existing) {
          return prev.map((p) =>
            p.id === data.participantId
              ? { ...p, progress: data.progress, wpm: data.wpm }
              : p
          );
        }
        return prev;
      });
    });

    socket.on("race-complete", (data: { participantId: string; timeSeconds: number; wpm: number }) => {
      if (data.participantId === participantIdRef.current) {
        setState("finished");
        setEndTime(Date.now());
      }
    });

    socket.on("participant-completed", (data: { participantId: string; completedAt: string }) => {
      setRaceParticipants((prev) =>
        prev.map((p) =>
          p.id === data.participantId
            ? { ...p, progress: 100, completedAt: data.completedAt }
            : p
        )
      );
    });

    socket.on("participant-left", (data: { participants: LobbyParticipant[] }) => {
      setLobbyParticipants(data.participants);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  function handleJoin(nickname: string) {
    const socket = socketRef.current;
    socket.emit(
      "join-race",
      { raceId, nickname },
      (response: { participantId?: string; error?: string }) => {
        if (response.error) return;
        setParticipantId(response.participantId!);
        setState("lobby");
      }
    );
  }

  const handleGo = useCallback(() => {
    setState("racing");
    setRaceStartTime(Date.now());
    setRaceParticipants(
      lobbyParticipants.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        progress: 0,
        wpm: 0,
        completedAt: null,
      }))
    );
  }, [lobbyParticipants]);

  const handleTimeExpired = useCallback(() => {
    setTimeExpired(true);
    setState("finished");
    setEndTime(Date.now());
  }, []);

  function handleWordSubmit() {
    setCurrentInput("");
    setCurrentWordIndex((prev) => prev + 1); // optimistic advance; server confirms via race-progress
  }

  const handleInputChange = useCallback(
    (value: string) => {
      setCurrentInput(value);
      if (participantIdRef.current) {
        socketRef.current.emit("keystroke", {
          raceId,
          participantId: participantIdRef.current,
          input: value,
        });
      }
    },
    [raceId]
  );

  function handleReset() {
    setCurrentWordIndex(0);
    setCurrentInput("");
    setStartAt(null);
    setRaceStartTime(null);
    setEndTime(null);
    setTimeExpired(false);
    setLocalProgress(0);
    setLocalWpm(0);
    setLocalMistakes(0);
    setLocalCorrectChars(0);
    setLobbyParticipants([]);
    setRaceParticipants([]);
    setState("idle");
    setParticipantId(null);
  }

  const isRacing = state === "racing";
  return (
    <div className="race-stage">
      <div className={`race-frame${isRacing ? " wide" : ""}`}>
        <span className="corners-bottom" />
        <h2>{raceTitle}</h2>
        <div className="subtitle">
          {state === "idle"
            ? "// ENTER NICKNAME"
            : state === "lobby"
            ? "// AWAITING RIDERS"
            : state === "countdown"
            ? "// SIGNAL INCOMING"
            : state === "racing"
            ? "// BURN THE PROMPT"
            : "// RUN COMPLETE"}
        </div>

        {state === "idle" && <JoinDialog onJoin={handleJoin} />}

        {state === "lobby" && (
          <RaceLobby participants={lobbyParticipants} slots={3} currentParticipantId={participantId} />
        )}

        {state === "countdown" && startAt && (
          <TrafficLight startAt={startAt} onGo={handleGo} />
        )}

        {state === "racing" && (
          <>
            {durationSeconds && startAt && (
              <RaceTimer
                durationSeconds={durationSeconds}
                startAt={startAt}
                onTimeExpired={handleTimeExpired}
              />
            )}
            <ProgressPanel
              progress={localProgress}
              mistakes={localMistakes}
              wpm={localWpm}
              totalCorrectChars={localCorrectChars}
            />
            <TextDisplay
              words={words}
              currentWordIndex={currentWordIndex}
              completedWords={currentWordIndex}
              currentInput={currentInput}
            />
            <TypingInput
              currentWord={words[currentWordIndex] ?? ""}
              onSubmit={handleWordSubmit}
              onInputChange={handleInputChange}
              disabled={timeExpired}
            />
            <ParticipantList
              participants={raceParticipants}
              currentParticipantId={participantId}
            />
          </>
        )}

        {state === "finished" && (
          <RaceComplete
            words={words}
            completedWords={currentWordIndex}
            mistakes={localMistakes}
            startTime={raceStartTime!}
            endTime={endTime!}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors. If `RaceComplete` props differ, adjust — keep existing prop names.

- [ ] **Step 3: Run all tests**

```bash
npm run test
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/race/race-interface.tsx
git commit -m "feat: client is now a dumb terminal — server drives all race metrics"
```

---

## Task 6: Manual end-to-end verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open a race in 3 browser tabs, join with different nicknames, verify:**
  - Progress bars update for all players as each types
  - WPM and mistakes display update in real time from server events
  - Last word completes without trailing space
  - Race finishes correctly and `RaceComplete` screen appears
  - Disconnect one player mid-race — remaining players continue normally

- [ ] **Step 3: Verify cheat is closed — open browser DevTools console and try:**

```javascript
// This should be silently ignored by the server (event no longer handled)
socket.emit("race-complete", { raceId: "...", participantId: "...", timeSeconds: 0.1, wpm: 9999 });
// This should be silently ignored (event removed)
socket.emit("progress-update", { raceId: "...", participantId: "...", progress: 100, wpm: 999, mistakes: 0, totalAttempted: 999 });
```

Expected: no state changes in the UI.
