"use client";

import { Progress } from "@/components/ui/progress";

export function ProgressPanel({
  progress,
  mistakes,
  wpm,
}: {
  progress: number;
  mistakes: number;
  wpm: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-semibold">{progress}%</span>
      </div>
      <Progress value={progress} className="h-3" />
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">WPM: </span>
          <span className="font-semibold">{wpm}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Mistakes: </span>
          <span className="font-semibold text-red-600 dark:text-red-400">
            {mistakes}
          </span>
        </div>
      </div>
    </div>
  );
}