"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function ProgressPanel({
  progress,
  mistakes,
  totalAttempted,
  startTime,
}: {
  progress: number;
  mistakes: number;
  totalAttempted: number;
  startTime: number | null;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  const accuracy =
    totalAttempted > 0
      ? Math.round(((totalAttempted - mistakes) / totalAttempted) * 100)
      : 100;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-semibold">{progress}%</span>
      </div>
      <Progress value={progress} className="h-3" />
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Accuracy: </span>
          <span className="font-semibold">{accuracy}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">Mistakes: </span>
          <span className="font-semibold text-red-600 dark:text-red-400">
            {mistakes}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Time: </span>
          <span className="font-mono font-semibold">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
