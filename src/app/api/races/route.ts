import { NextResponse } from "next/server";
import { db } from "@/db";
import { races } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { desc } from "drizzle-orm";

export async function GET() {
  const allRaces = await db
    .select()
    .from(races)
    .orderBy(desc(races.createdAt));
  return NextResponse.json(allRaces);
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, text, status, durationSeconds } = body;

  if (!title || !text) {
    return NextResponse.json(
      { error: "Title and text are required" },
      { status: 400 }
    );
  }

  const [race] = await db
    .insert(races)
    .values({ title, text, status: status ?? "draft", durationSeconds })
    .returning();

  return NextResponse.json(race, { status: 201 });
}
