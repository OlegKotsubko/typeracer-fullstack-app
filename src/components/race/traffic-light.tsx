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

  const isActive = (color: "red" | "yellow" | "green") => phase === color;

  const colorClasses = {
    red: "bg-red-500 shadow-red-500/50",
    yellow: "bg-yellow-400 shadow-yellow-400/50",
    green: "bg-green-500 shadow-green-500/50",
  };

  const inactiveClass = "bg-muted";

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="bg-background border-2 border-border rounded-2xl p-4 flex flex-col items-center gap-3 shadow-lg">
        {(["red", "yellow", "green"] as const).map((color) => (
          <div
            key={color}
            className={`w-16 h-16 rounded-full transition-all duration-200 ${
              isActive(color)
                ? `${colorClasses[color]} shadow-lg`
                : inactiveClass
            }`}
          />
        ))}
      </div>
      <p className="text-2xl font-bold font-mono">
        {phase === "red" && "3"}
        {phase === "yellow" && "2"}
        {phase === "green" && "1"}
        {phase === "waiting" && "Get ready..."}
      </p>
    </div>
  );
}