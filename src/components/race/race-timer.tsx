"use client";

import { useEffect, useState } from "react";
import { secondsToMinutesSeconds } from "@/lib/time-utils";

export function RaceTimer({
  durationSeconds,
  startAt,
  onTimeExpired,
}: {
  durationSeconds: number;
  startAt: Date;
  onTimeExpired: () => void;
}) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startAt.getTime()) / 1000);
      const timeRemaining = Math.max(0, durationSeconds - elapsed);
      setRemaining(timeRemaining);
      if (timeRemaining <= 0) {
        onTimeExpired();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [durationSeconds, startAt, onTimeExpired]);

  const { minutes, seconds } = secondsToMinutesSeconds(remaining);
  const isExpired = remaining === 0;

  return (
    <div
      className={`text-center font-mono text-2xl font-bold ${
        isExpired ? "text-red-600" : "text-foreground"
      }`}
    >
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      {isExpired && (
        <p className="text-lg text-red-600 mt-2">Time&apos;s up!</p>
      )}
    </div>
  );
}