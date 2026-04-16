import { NextResponse } from "next/server";
import { db } from "@/db";
import { races } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [race] = await db.select().from(races).where(eq(races.id, id));

  if (!race) {
    return NextResponse.json({ error: "Race not found" }, { status: 404 });
  }

  return NextResponse.json(race);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, text, status } = body;

  const [updated] = await db
    .update(races)
    .set({
      ...(title !== undefined && { title }),
      ...(text !== undefined && { text }),
      ...(status !== undefined && { status }),
    })
    .where(eq(races.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Race not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [deleted] = await db
    .delete(races)
    .where(eq(races.id, id))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Race not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
