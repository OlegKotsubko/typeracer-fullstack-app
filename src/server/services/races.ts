import { db } from "@drizzle";
import { races } from "@drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { ServiceError } from "./errors";

type RaceStatus = "draft" | "active" | "ongoing" | "completed";

export type CreateRaceInput = {
  title: string;
  text: string;
  status?: RaceStatus;
  durationSeconds?: number | null;
};

export type UpdateRaceInput = Partial<CreateRaceInput>;

export async function listRaces(limit = 20, offset = 0) {
  return db.select().from(races).orderBy(desc(races.createdAt)).limit(limit).offset(offset);
}

export async function getRace(id: string) {
  const [race] = await db.select().from(races).where(eq(races.id, id));
  if (!race) throw new ServiceError("NOT_FOUND", "Race not found");
  return race;
}

export async function createRace(input: CreateRaceInput) {
  if (!input.title?.trim() || !input.text?.trim()) {
    throw new ServiceError("VALIDATION_ERROR", "Title and text are required");
  }
  const [race] = await db
    .insert(races)
    .values({
      title: input.title,
      text: input.text,
      status: input.status ?? "draft",
      durationSeconds: input.durationSeconds ?? null,
    })
    .returning();
  return race;
}

export async function updateRace(id: string, input: UpdateRaceInput) {
  const patch: Partial<typeof races.$inferInsert> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.text !== undefined) patch.text = input.text;
  if (input.status !== undefined) patch.status = input.status;
  if (input.durationSeconds !== undefined)
    patch.durationSeconds = input.durationSeconds;

  const [updated] = await db
    .update(races)
    .set(patch)
    .where(eq(races.id, id))
    .returning();

  if (!updated) throw new ServiceError("NOT_FOUND", "Race not found");
  return updated;
}

export async function deleteRace(id: string) {
  const [deleted] = await db
    .delete(races)
    .where(eq(races.id, id))
    .returning();
  if (!deleted) throw new ServiceError("NOT_FOUND", "Race not found");
  return deleted;
}

export async function resetOngoingRaces() {
  await db
    .update(races)
    .set({ status: "active", startAt: null })
    .where(eq(races.status, "ongoing"));
}

export async function markRaceOngoing(id: string, startAt: Date) {
  await db
    .update(races)
    .set({ status: "ongoing", startAt })
    .where(eq(races.id, id));
}
