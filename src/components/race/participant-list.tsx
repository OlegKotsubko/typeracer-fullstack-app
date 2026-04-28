"use client";

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
    <div className="lanes">
      {sorted.map((p) => {
        const isMe = p.id === currentParticipantId;
        const isDone = !!p.completedAt;
        const cls = `lane${isMe ? " me" : ""}${isDone ? " done" : ""}`;
        return (
          <div key={p.id} className={cls}>
            <div className="lane-name">
              {p.nickname}
              {isMe && " (you)"}
            </div>
            <div className="lane-track">
              <div className="lane-fill" style={{ width: `${p.progress}%` }} />
              <div className="lane-car" style={{ left: `calc(${p.progress}% - 8px)` }}>▸</div>
            </div>
            <div className="lane-wpm">{p.wpm} wpm</div>
          </div>
        );
      })}
    </div>
  );
}
