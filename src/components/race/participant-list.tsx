"use client";

import { Progress } from "@/components/ui/progress";

export type ParticipantData = {
  id: string;
  nickname: string;
  progress: number;
  wpm: number;
  completedAt: string | null;
};

export function ParticipantList({
  participants,
  currentParticipantId,
}: {
  participants: ParticipantData[];
  currentParticipantId: string | null;
}) {
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
            className={`flex items-center gap-3 text-sm ${
              p.id === currentParticipantId ? "font-semibold" : ""
            }`}
          >
            <span className="min-w-[100px] truncate font-medium">
              {p.nickname}
              {p.id === currentParticipantId && " (you)"}
            </span>
            <Progress value={p.progress} className="h-2 flex-1" />
            <span className="min-w-[40px] text-right text-muted-foreground">
              {p.progress}%
            </span>
            <span className="min-w-[50px] text-right text-muted-foreground">
              {p.wpm} wpm
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