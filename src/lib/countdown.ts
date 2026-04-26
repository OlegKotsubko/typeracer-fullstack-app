export type TrafficLightPhase = "waiting" | "red" | "yellow" | "green" | "go";

export function getTrafficLightPhase(startAt: Date, now: number): TrafficLightPhase {
  const remaining = (startAt.getTime() - now) / 1000;

  if (remaining <= 0) return "go";
  if (remaining <= 1) return "green";
  if (remaining <= 2) return "yellow";
  if (remaining <= 3) return "red";
  return "waiting";
}