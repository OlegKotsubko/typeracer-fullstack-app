import { NextResponse } from "next/server";
import { db } from "@/db";
import { participants, races } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  {
    params,
  }: { params: Promise<{ id: string; participantId: string }> }
) {
  const { participantId } = await params;

  const [existing] = await db
    .select()
    .from(participants)
    .where(eq(participants.id, participantId));

  if (!existing) {
    return NextResponse.json(
      { error: "Participant not found" },
      { status: 404 }
    );
  }

  if (existing.completedAt) {
    return NextResponse.json(
      { error: "Race already completed for this participant" },
      { status: 400 }
    );
  }

  // Validate race duration limit
  const [race] = await db
    .select()
    .from(races)
    .where(eq(races.id, existing.raceId));

  if (race?.durationSeconds && existing.startedAt) {
    const elapsed = Date.now() - existing.startedAt.getTime();
    const elapsedSeconds = Math.floor(elapsed / 1000);

    if (elapsedSeconds >= race.durationSeconds) {
      return NextResponse.json(
        { error: "Race time limit exceeded" },
        { status: 400 }
      );
    }
  }

  const body = await request.json();
  const { progress, mistakes, totalAttempted, startedAt, completedAt } = body;

  const [updated] = await db
    .update(participants)
    .set({
      ...(progress !== undefined && { progress }),
      ...(mistakes !== undefined && { mistakes }),
      ...(totalAttempted !== undefined && { totalAttempted }),
      ...(startedAt !== undefined && {
        startedAt: new Date(startedAt),
      }),
      ...(completedAt !== undefined && {
        completedAt: new Date(completedAt),
      }),
    })
    .where(eq(participants.id, participantId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: { params: Promise<{ id: string; participantId: string }> }
) {
  const { id: raceId, participantId } = await params;

  const [race] = await db
    .select()
    .from(races)
    .where(eq(races.id, raceId));

  if (!race) {
    return new NextResponse(null, { status: 404 });
  }

  if (race.status !== "active") {
    return NextResponse.json(
      { error: "Race is not active" },
      { status: 400 }
    );
  }

  const deleted = await db
    .delete(participants)
    .where(and(eq(participants.id, participantId), eq(participants.raceId, raceId)))
    .returning({ id: participants.id });

  if (deleted.length === 0) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
