"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

type Participant = {
  id: string;
  nickname: string;
  progress: number;
  mistakes: number;
  totalAttempted: number;
  completedAt: string | null;
};

export function ParticipantList({ raceId }: { raceId: string }) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/races/${raceId}/events`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setParticipants(data);
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      eventSource.close();
    };
  }, [raceId]);

  if (participants.length === 0) return null;

  const sorted = [...participants].sort((a, b) => b.progress - a.progress);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        Participants ({participants.length})
      </h3>
      <div className="space-y-2">
        {sorted.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 text-sm"
          >
            <span className="min-w-[100px] truncate font-medium">
              {p.nickname}
            </span>
            <Progress value={p.progress} className="h-2 flex-1" />
            <span className="min-w-[40px] text-right text-muted-foreground">
              {p.progress}%
            </span>
            {p.completedAt && (
              <span className="text-xs text-green-600 dark:text-green-400">
                Done
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
