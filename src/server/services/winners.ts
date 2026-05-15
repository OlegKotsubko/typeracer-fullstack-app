import { db } from "@drizzle";
import { winners } from "@drizzle/schema";
import { asc, desc, eq } from "drizzle-orm";

const LEADERBOARD_SIZE = 10;

export type WinnerEntry = {
  nickname: string;
  raceTitle: string;
  timeSeconds: number;
  wpm: number;
  completedAt: Date;
};

export async function listWinners(limit = 20, offset = 0) {
  return db
    .select()
    .from(winners)
    .orderBy(asc(winners.timeSeconds), desc(winners.completedAt))
    .limit(limit)
    .offset(offset);
}

export async function recordWinnerIfQualifies(entry: WinnerEntry) {
  const current = await db
    .select()
    .from(winners)
    .orderBy(asc(winners.timeSeconds));

  if (current.length < LEADERBOARD_SIZE) {
    await db.insert(winners).values(entry);
    return { inserted: true, evicted: null as null | string };
  }

  const slowest = current[current.length - 1];
  if (entry.timeSeconds < slowest.timeSeconds) {
    await db.insert(winners).values(entry);
    await db.delete(winners).where(eq(winners.id, slowest.id));
    return { inserted: true, evicted: slowest.id };
  }

  return { inserted: false, evicted: null };
}
