"use client";

import { useEffect, useState } from "react";
import { getTrafficLightPhase, TrafficLightPhase } from "@/lib/countdown";

export function TrafficLight({
  startAt,
  onGo,
}: {
  startAt: Date;
  onGo: () => void;
}) {
  const [phase, setPhase] = useState<TrafficLightPhase>("waiting");

  useEffect(() => {
    const interval = setInterval(() => {
      const newPhase = getTrafficLightPhase(startAt, Date.now());
      setPhase(newPhase);

      if (newPhase === "go") {
        clearInterval(interval);
        onGo();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startAt, onGo]);

  const num = phase === "red" ? "3" : phase === "yellow" ? "2" : phase === "green" ? "1" : phase === "go" ? "GO" : "—";
  const isGo = phase === "go";

  return (
    <div className="lights-stage">
      <div className="lights">
        <div className={`light red${phase === "red" ? " on" : ""}`} />
        <div className={`light amber${phase === "yellow" ? " on" : ""}`} />
        <div className={`light green${phase === "green" || phase === "go" ? " on" : ""}`} />
      </div>
      <div className={`countdown-num${isGo ? " go" : ""}`}>{num}</div>
    </div>
  );
}
