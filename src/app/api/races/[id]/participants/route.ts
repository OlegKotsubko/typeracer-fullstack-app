import { NextResponse } from "next/server";
import { db } from "@/db";
import { participants, races } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = await db
    .select()
    .from(participants)
    .where(eq(participants.raceId, id));

  return NextResponse.json(list);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [race] = await db.select().from(races).where(eq(races.id, id));
  if (!race) {
    return NextResponse.json({ error: "Race not found" }, { status: 404 });
  }
  if (race.status !== "active") {
    return NextResponse.json(
      { error: "Race is not active" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { nickname } = body;

  if (!nickname || typeof nickname !== "string" || !nickname.trim()) {
    return NextResponse.json(
      { error: "Nickname is required" },
      { status: 400 }
    );
  }

  const [participant] = await db
    .insert(participants)
    .values({ raceId: id, nickname: nickname.trim() })
    .returning();

  return NextResponse.json(participant, { status: 201 });
}
