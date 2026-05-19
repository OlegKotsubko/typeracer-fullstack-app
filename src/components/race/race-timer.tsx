"use client"

import { useEffect, useState } from "react"

import { secondsToMinutesSeconds } from "@/lib/time-utils"

export function RaceTimer({
  durationSeconds,
  startAt,
  onTimeExpiredAction,
}: {
  durationSeconds: number;
  startAt: Date;
  onTimeExpiredAction: () => void;
}) {
  const [remaining, setRemaining] = useState(durationSeconds)

  useEffect(() => {
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startAt.getTime()) / 1000)
      const timeRemaining = Math.max(0, durationSeconds - elapsed)
      setRemaining(timeRemaining)
      if (timeRemaining <= 0) {
        onTimeExpiredAction()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [durationSeconds, startAt, onTimeExpiredAction])

  const { minutes, seconds } = secondsToMinutesSeconds(remaining)
  const isExpired = remaining === 0
  const lowTime = remaining > 0 && remaining <= 10

  return (
    <div className="hud mb-1">
      <div className={`hud-cell${isExpired || lowTime ? " warn" : ""}`}
        style={{ borderRight: "none", gridColumn: "1 / -1" }}>
        <div className="k">
            Time Remaining
        </div>
        <div className="v">
          {String(minutes).padStart(2, "0")}
          :
          {String(seconds).padStart(2, "0")}
          {isExpired && " // EXPIRED"}
        </div>
      </div>
    </div>
  )
}
