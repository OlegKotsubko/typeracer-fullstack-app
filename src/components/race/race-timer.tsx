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
