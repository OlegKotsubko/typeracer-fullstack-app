import { NextResponse } from "next/server";
import { db } from "@/db";
import { participants } from "@/db/schema";
import { eq } from "drizzle-orm";

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
