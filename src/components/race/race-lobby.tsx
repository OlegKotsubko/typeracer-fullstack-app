"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type LobbyParticipant = {
  id: string;
  nickname: string;
};

export function RaceLobby({
  participants,
  slots,
}: {
  participants: LobbyParticipant[];
  slots: number;
}) {
  const slotArray = Array.from({ length: slots }, (_, i) => participants[i] ?? null);

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-center">Waiting for players...</h2>
      <p className="text-center text-muted-foreground">
        {participants.length}/{slots} players joined
      </p>
      <div className="space-y-3">
        {slotArray.map((participant, i) => (
          <Card
            key={i}
            className={
              participant
                ? "border-primary"
                : "border-dashed border-2 border-muted-foreground/30"
            }
          >
            <CardContent className="flex items-center justify-between py-3">
              {participant ? (
                <>
                  <span className="font-medium">{participant.nickname}</span>
                  <span className="text-green-600 dark:text-green-400 text-sm font-semibold">
                    Ready
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground italic">
                  Waiting for player...
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}