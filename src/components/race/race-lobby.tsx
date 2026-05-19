"use client"

type LobbyParticipant = {
  id: string;
  nickname: string;
};

const CITIES = ["NEO-KYOTO", "CHROME HORIZON", "PINK DISTRICT", "GLITCH WARD", "NEON 8", "WIRE 4", "ARCADIA", "OFFGRID"]

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || name.slice(0, 2).toUpperCase()
}

export function RaceLobby({
  participants,
  slots,
  currentParticipantId,
}: {
  participants: LobbyParticipant[];
  slots: number;
  currentParticipantId?: string | null;
}) {
  const slotArray = Array.from({ length: slots }, (_, i) => participants[i] ?? null)

  return (
    <div>
      <div className="lobby">
        {slotArray.map((p, i) => {
          const isMe = p && currentParticipantId && p.id === currentParticipantId
          const cls = p ? `slot filled${isMe ? " me" : ""}` : "slot empty"
          return (
            <div key={i}
              className={cls}>
              <div className="avatar">
                {p ? initials(p.nickname) : "—"}
              </div>
              <div className="slot-name">
                {p ? p.nickname : "Empty Slot"}
              </div>
              <div>
                {p ? CITIES[i % CITIES.length] : "Awaiting rider"}
              </div>
            </div>
          )
        })}
      </div>
      <div className="lobby-meta">
        <span>
          Riders
          {' '}
          <b>
            {participants.length}
            {' '}
              /
            {' '}
            {slots}
          </b>
        </span>

        <span>
          {'//'}
          Waiting for the signal
        </span>
        <span>
          Ping
          <b>
            08ms
          </b>
        </span>
      </div>
    </div>
  )
}
