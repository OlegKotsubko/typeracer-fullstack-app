# Race Duration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add enforced time limits to races with admin configuration, client-side countdown, and server-side validation.

**Architecture:** Database stores duration in seconds. Admin forms convert MM:SS ↔ seconds via utility functions. Race page displays countdown timer and disables input when expired. API validates elapsed time before accepting progress updates.

**Tech Stack:** Next.js 16, React, TypeScript, shadcn/ui, Drizzle ORM

---

### Task 1: Update Database Schema

**Files:**
- Modify: `src/db/schema.ts:88-100`

- [ ] **Step 1: Add durationSeconds column to races table**

Open `src/db/schema.ts` and modify the `races` table definition:

```typescript
export const races = pgTable("races", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  text: text("text").notNull(),
  durationSeconds: integer("duration_seconds"),
  status: text("status", { enum: ["draft", "active", "completed"] })
    .notNull()
    .default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
```

- [ ] **Step 2: Generate migration**

```bash
npx drizzle-kit generate
```

Expected: See output like "Generated migration file: drizzle/XXXXXXXXX_add_duration.sql"

- [ ] **Step 3: Apply migration**

```bash
npx drizzle-kit migrate
```

Expected: Migration applies successfully to your DATABASE_URL

- [ ] **Step 4: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat: add durationSeconds to races table"
```

---

### Task 2: Create Time Utility Functions

**Files:**
- Create: `src/lib/time-utils.ts`
- Create: `src/lib/__tests__/time-utils.test.ts`

- [ ] **Step 1: Write tests for secondsToMinutesSeconds**

Create `src/lib/__tests__/time-utils.test.ts`:

```typescript
import { secondsToMinutesSeconds, minutesSecondsToSeconds } from "../time-utils";

describe("secondsToMinutesSeconds", () => {
  it("converts 0 seconds to 0:0", () => {
    expect(secondsToMinutesSeconds(0)).toEqual({ minutes: 0, seconds: 0 });
  });

  it("converts 60 seconds to 1:0", () => {
    expect(secondsToMinutesSeconds(60)).toEqual({ minutes: 1, seconds: 0 });
  });

  it("converts 330 seconds to 5:30", () => {
    expect(secondsToMinutesSeconds(330)).toEqual({ minutes: 5, seconds: 30 });
  });

  it("converts 3661 seconds to 61:1", () => {
    expect(secondsToMinutesSeconds(3661)).toEqual({ minutes: 61, seconds: 1 });
  });
});

describe("minutesSecondsToSeconds", () => {
  it("converts 0:0 to 0 seconds", () => {
    expect(minutesSecondsToSeconds(0, 0)).toBe(0);
  });

  it("converts 1:0 to 60 seconds", () => {
    expect(minutesSecondsToSeconds(1, 0)).toBe(60);
  });

  it("converts 5:30 to 330 seconds", () => {
    expect(minutesSecondsToSeconds(5, 30)).toBe(330);
  });

  it("converts 61:1 to 3661 seconds", () => {
    expect(minutesSecondsToSeconds(61, 1)).toBe(3661);
  });
});
```

- [ ] **Step 2: Implement time utility functions**

Create `src/lib/time-utils.ts`:

```typescript
export function secondsToMinutesSeconds(
  seconds: number
): { minutes: number; seconds: number } {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return { minutes, seconds: remainingSeconds };
}

export function minutesSecondsToSeconds(
  minutes: number,
  seconds: number
): number {
  return minutes * 60 + seconds;
}
```

- [ ] **Step 3: Run tests to verify**

```bash
npm test -- src/lib/__tests__/time-utils.test.ts
```

Expected: All 8 tests pass

- [ ] **Step 4: Commit**

```bash
git add src/lib/time-utils.ts src/lib/__tests__/time-utils.test.ts
git commit -m "feat: add time conversion utility functions"
```

---

### Task 3: Create Time Picker Component

**Files:**
- Create: `src/components/ui/time-picker.tsx`

- [ ] **Step 1: Create TimePicker component**

Create `src/components/ui/time-picker.tsx`:

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimePickerProps {
  label?: string;
  minutes: number;
  seconds: number;
  onMinutesChange: (minutes: number) => void;
  onSecondsChange: (seconds: number) => void;
  disabled?: boolean;
}

export function TimePicker({
  label = "Duration",
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange,
  disabled = false,
}: TimePickerProps) {
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      onMinutesChange(value);
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 59) {
      onSecondsChange(value);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Minutes</label>
          <Input
            type="number"
            value={minutes}
            onChange={handleMinutesChange}
            disabled={disabled}
            min="0"
            className="w-20"
            placeholder="0"
          />
        </div>
        <span className="text-2xl font-bold mt-4">:</span>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Seconds</label>
          <Input
            type="number"
            value={seconds}
            onChange={handleSecondsChange}
            disabled={disabled}
            min="0"
            max="59"
            className="w-20"
            placeholder="0"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Format: MM : SS (0-59 seconds)
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/time-picker.tsx
git commit -m "feat: create reusable time picker component"
```

---

### Task 4: Update Create Race Form

**Files:**
- Modify: `src/app/admin/(protected)/races/new/page.tsx`

- [ ] **Step 1: Update imports and state**

Replace lines 1-29 in `src/app/admin/(protected)/races/new/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { minutesSecondsToSeconds } from "@/lib/time-utils";

export default function CreateRacePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("draft");
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
```

- [ ] **Step 2: Update handleSubmit to include duration**

Replace the `handleSubmit` function (lines 31-49):

```typescript
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (durationMinutes === 0 && durationSeconds === 0) {
      toast.error("Duration must be greater than 0");
      return;
    }

    setLoading(true);

    const totalSeconds = minutesSecondsToSeconds(durationMinutes, durationSeconds);

    const res = await fetch("/api/races", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text, status, durationSeconds: totalSeconds }),
    });

    if (res.ok) {
      toast.success("Race created");
      router.push("/admin/races");
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to create race");
    }
    setLoading(false);
  }
```

- [ ] **Step 3: Add TimePicker to form**

Find the Status section (around line 84-95) and insert the TimePicker after it, before the submit button:

```typescript
            <TimePicker
              label="Duration"
              minutes={durationMinutes}
              seconds={durationSeconds}
              onMinutesChange={setDurationMinutes}
              onSecondsChange={setDurationSeconds}
            />
```

- [ ] **Step 4: Verify the entire form looks correct**

The form should now have: Title, Race Text, Status, Duration (TimePicker), and Create button, in that order.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/\(protected\)/races/new/page.tsx
git commit -m "feat: add duration time picker to create race form"
```

---

### Task 5: Update Edit Race Form

**Files:**
- Modify: `src/app/admin/(protected)/races/[id]/edit/page.tsx`

- [ ] **Step 1: Update imports and state**

Replace lines 1-31 in `src/app/admin/(protected)/races/[id]/edit/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { secondsToMinutesSeconds, minutesSecondsToSeconds } from "@/lib/time-utils";

export default function EditRacePage() {
  const router = useRouter();
  const params = useParams();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("draft");
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
```

- [ ] **Step 2: Update fetchRace to handle duration**

Replace the `useEffect` hook (lines 33-48):

```typescript
  useEffect(() => {
    async function fetchRace() {
      const res = await fetch(`/api/races/${params.id}`);
      if (res.ok) {
        const race = await res.json();
        setTitle(race.title);
        setText(race.text);
        setStatus(race.status);
        if (race.durationSeconds) {
          const { minutes, seconds } = secondsToMinutesSeconds(race.durationSeconds);
          setDurationMinutes(minutes);
          setDurationSeconds(seconds);
        }
      } else {
        toast.error("Race not found");
        router.push("/admin/races");
      }
      setFetching(false);
    }
    fetchRace();
  }, [params.id, router]);
```

- [ ] **Step 3: Update handleSubmit to include duration**

Replace the `handleSubmit` function (lines 50-68):

```typescript
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (durationMinutes === 0 && durationSeconds === 0) {
      toast.error("Duration must be greater than 0");
      return;
    }

    setLoading(true);

    const totalSeconds = minutesSecondsToSeconds(durationMinutes, durationSeconds);

    const res = await fetch(`/api/races/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text, status, durationSeconds: totalSeconds }),
    });

    if (res.ok) {
      toast.success("Race updated");
      router.push("/admin/races");
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to update race");
    }
    setLoading(false);
  }
```

- [ ] **Step 4: Add TimePicker to form**

Find the Status section (around line 105-117) and insert the TimePicker after it, before the buttons:

```typescript
            <TimePicker
              label="Duration"
              minutes={durationMinutes}
              seconds={durationSeconds}
              onMinutesChange={setDurationMinutes}
              onSecondsChange={setDurationSeconds}
            />
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/\(protected\)/races/\[id\]/edit/page.tsx
git commit -m "feat: add duration time picker to edit race form"
```

---

### Task 6: Create Race Timer Component

**Files:**
- Create: `src/components/race/race-timer.tsx`

- [ ] **Step 1: Create RaceTimer component**

Create `src/components/race/race-timer.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { secondsToMinutesSeconds } from "@/lib/time-utils";

interface RaceTimerProps {
  durationSeconds: number | null;
  startedAt: Date | null;
  onTimeExpired: () => void;
}

export function RaceTimer({
  durationSeconds,
  startedAt,
  onTimeExpired,
}: RaceTimerProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!durationSeconds || !startedAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const start = new Date(startedAt).getTime();
      const elapsed = Math.floor((now - start) / 1000);
      const timeRemaining = Math.max(0, durationSeconds - elapsed);

      setRemaining(timeRemaining);

      if (timeRemaining <= 0) {
        onTimeExpired();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [durationSeconds, startedAt, onTimeExpired]);

  if (remaining === null) return null;

  const { minutes, seconds } = secondsToMinutesSeconds(remaining);
  const isExpired = remaining === 0;

  return (
    <div
      className={`text-center font-mono text-2xl font-bold ${
        isExpired ? "text-red-600" : "text-foreground"
      }`}
    >
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      {isExpired && <p className="text-lg text-red-600 mt-2">Time's up!</p>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/race/race-timer.tsx
git commit -m "feat: create race timer countdown component"
```

---

### Task 7: Integrate Timer into Race Page

**Files:**
- Modify: `src/app/race/[id]/page.tsx` (or relevant race display component)

- [ ] **Step 1: Identify the race component**

Find the main race page/component. If it's `src/app/race/[id]/page.tsx`, note it. If it's a component like `src/components/race/race-interface.tsx`, locate that instead.

Run:
```bash
grep -r "participants" src/app/race/ --include="*.tsx" | head -5
```

This will show you the main race page file.

- [ ] **Step 2: Add timer state and handler to race component**

In the main race page/component, add these imports at the top:

```typescript
import { RaceTimer } from "@/components/race/race-timer";
```

Add state for tracking if timer expired:

```typescript
const [timeExpired, setTimeExpired] = useState(false);
```

Add a handler for when time expires:

```typescript
const handleTimeExpired = useCallback(() => {
  setTimeExpired(true);
  // Auto-submit pending progress if needed
}, []);
```

- [ ] **Step 3: Disable input when time expires**

Find the typing input field/textarea. Add a `disabled` prop:

```typescript
disabled={timeExpired || /* existing conditions */}
```

- [ ] **Step 4: Render the RaceTimer component**

Add the timer component near the top of the race interface (prominently visible):

```typescript
{race?.durationSeconds && race?.participants?.[yourParticipantIndex]?.startedAt && (
  <RaceTimer
    durationSeconds={race.durationSeconds}
    startedAt={race.participants[yourParticipantIndex].startedAt}
    onTimeExpired={handleTimeExpired}
  />
)}
```

Replace `yourParticipantIndex` with the actual logic to get the current participant's index.

- [ ] **Step 5: Show "Time's up" message when expired**

Add this conditional message display:

```typescript
{timeExpired && (
  <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
    Time's up! Race has ended.
  </div>
)}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/race/\[id\]/page.tsx
git commit -m "feat: integrate countdown timer into race page"
```

---

### Task 8: Add Server-Side Validation

**Files:**
- Modify: `src/app/api/races/[id]/route.ts`

- [ ] **Step 1: Add validation logic to PATCH handler**

Find the PATCH handler in `src/app/api/races/[id]/route.ts`. Before processing the update, add this validation after checking authentication:

```typescript
// Get the participant to check elapsed time
const participant = await db.query.participants.findFirst({
  where: (p) => p.raceId.equals(race.id),
  // adjust to get the current participant
});

// Check if race duration has been exceeded
if (race.durationSeconds && participant?.startedAt) {
  const elapsed = Math.floor(
    (Date.now() - new Date(participant.startedAt).getTime()) / 1000
  );
  if (elapsed >= race.durationSeconds) {
    return NextResponse.json(
      { error: "Race time limit exceeded" },
      { status: 400 }
    );
  }
}
```

Note: Adjust the participant query logic to match your actual data fetching pattern (you may be getting participantId from the request body or session).

- [ ] **Step 2: Test locally**

Start dev server:
```bash
npm run dev
```

Create a race with a short duration (e.g., 5 seconds). Join it and wait until the timer expires. Attempt to submit progress. Expected: 400 error with "Race time limit exceeded".

- [ ] **Step 3: Commit**

```bash
git add src/app/api/races/\[id\]/route.ts
git commit -m "feat: add server-side duration validation to PATCH endpoint"
```

---

### Task 9: Manual Testing

- [ ] **Step 1: Test create race with duration**

- Navigate to `/admin/races/new`
- Fill in: Title, Text, Status (any)
- Set Duration to 2:30 (2 min 30 sec)
- Click Create
- Expected: Race created, visible in races list

- [ ] **Step 2: Test edit race duration**

- Go to `/admin/races`
- Click edit on a race
- Change duration to 1:45
- Click Save
- Expected: Duration updated

- [ ] **Step 3: Test countdown timer on race page**

- Navigate to `/race/[id]` for a race with duration
- Timer should display and count down every second
- Expected: Timer shows MM:SS format, counts down accurately

- [ ] **Step 4: Test time expiry blocking**

- Join a race with short duration (2-3 seconds)
- Wait for timer to reach 0:00
- Expected: Input field disabled, "Time's up!" message shown, cannot type

- [ ] **Step 5: Test server-side rejection**

- Using developer tools, submit a progress update after time expires (via Network tab/API call)
- Expected: 400 response with "Race time limit exceeded"

---

### Task 10: Spec Review & Self-Check

- [ ] **Step 1: Verify all spec requirements are met**

Checklist:
- ✅ Database has `durationSeconds` column
- ✅ Admin create form has time picker (MM:SS)
- ✅ Admin edit form has time picker (MM:SS)
- ✅ Duration is required (validation in form)
- ✅ Race page shows countdown timer
- ✅ Input disabled when timer reaches 0
- ✅ "Time's up!" message displayed
- ✅ Server validates elapsed time on PATCH
- ✅ Server returns 400 if time expired
