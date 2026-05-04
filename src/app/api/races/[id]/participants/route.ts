import { NextResponse } from "next/server";
import { joinRace, listParticipants } from "@/server/services/participants";
import { ServiceError } from "@/server/services/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(await listParticipants(id));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const participant = await joinRace({ raceId: id, nickname: body?.nickname });
    return NextResponse.json(participant, { status: 201 });
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
