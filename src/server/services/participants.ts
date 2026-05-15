import { db } from "@drizzle";
import { participants, races } from "@drizzle/schema";
import { and, eq } from "drizzle-orm";
import { ServiceError } from "./errors";

export type JoinRaceInput = {
  raceId: string;
  nickname: string;
};

export type ProgressInput = {
  progress?: number;
  mistakes?: number;
  totalAttempted?: number;
  wpm?: number;
  startedAt?: Date | string;
  completedAt?: Date | string;
};

export async function listParticipants(raceId: string, limit = 20, offset = 0) {
  return db
    .select()
    .from(participants)
    .where(eq(participants.raceId, raceId))
    .limit(limit)
    .offset(offset);
}

export async function getParticipant(participantId: string) {
  const [p] = await db
    .select()
    .from(participants)
    .where(eq(participants.id, participantId));
  if (!p) throw new ServiceError("NOT_FOUND", "Participant not found");
  return p;
}

export async function joinRace(input: JoinRaceInput) {
  const nickname = input.nickname?.trim();
  if (!nickname) {
    throw new ServiceError("VALIDATION_ERROR", "Nickname is required");
  }

  const [race] = await db
    .select()
    .from(races)
    .where(eq(races.id, input.raceId));
  if (!race) throw new ServiceError("NOT_FOUND", "Race not found");
  if (race.status !== "active") {
    throw new ServiceError("CONFLICT", "Race is not active");
  }

  const [participant] = await db
    .insert(participants)
    .values({ raceId: input.raceId, nickname })
    .returning();
  return participant;
}

export async function updateProgress(
  participantId: string,
  input: ProgressInput
) {
  const existing = await getParticipant(participantId);

  if (existing.completedAt) {
    throw new ServiceError(
      "CONFLICT",
      "Race already completed for this participant"
    );
  }

  const [race] = await db
    .select()
    .from(races)
    .where(eq(races.id, existing.raceId));

  if (race?.durationSeconds && existing.startedAt) {
    const elapsedSeconds = Math.floor(
      (Date.now() - existing.startedAt.getTime()) / 1000
    );
    if (elapsedSeconds >= race.durationSeconds) {
      throw new ServiceError("CONFLICT", "Race time limit exceeded");
    }
  }

  const patch: Partial<typeof participants.$inferInsert> = {};
  if (input.progress !== undefined) patch.progress = input.progress;
  if (input.mistakes !== undefined) patch.mistakes = input.mistakes;
  if (input.totalAttempted !== undefined)
    patch.totalAttempted = input.totalAttempted;
  if (input.wpm !== undefined) patch.wpm = input.wpm;
  if (input.startedAt !== undefined)
    patch.startedAt = new Date(input.startedAt);
  if (input.completedAt !== undefined)
    patch.completedAt = new Date(input.completedAt);

  const [updated] = await db
    .update(participants)
    .set(patch)
    .where(eq(participants.id, participantId))
    .returning();
  return updated;
}

export async function leaveRace(raceId: string, participantId: string) {
  const [race] = await db.select().from(races).where(eq(races.id, raceId));
  if (!race) throw new ServiceError("NOT_FOUND", "Race not found");
  if (race.status !== "active") {
    throw new ServiceError("CONFLICT", "Race is not active");
  }

  const deleted = await db
    .delete(participants)
    .where(
      and(
        eq(participants.id, participantId),
        eq(participants.raceId, raceId)
      )
    )
    .returning({ id: participants.id });

  if (deleted.length === 0) {
    throw new ServiceError("NOT_FOUND", "Participant not found");
  }
}

export async function deleteParticipantById(participantId: string) {
  await db.delete(participants).where(eq(participants.id, participantId));
}

export async function deleteParticipantsByRace(raceId: string) {
  await db.delete(participants).where(eq(participants.raceId, raceId));
}

export async function markCompleted(participantId: string, completedAt: Date) {
  await db
    .update(participants)
    .set({ progress: 100, completedAt })
    .where(eq(participants.id, participantId));
}

export async function recordTickProgress(
  participantId: string,
  data: { progress: number; mistakes: number; totalAttempted: number; wpm: number }
) {
  await db
    .update(participants)
    .set(data)
    .where(eq(participants.id, participantId));
}
