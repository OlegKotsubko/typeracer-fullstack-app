import { NextResponse } from "next/server";
import { leaveRace, updateProgress } from "@/server/services/participants";
import { ServiceError } from "@/server/services/errors";

function errorResponse(err: unknown) {
  if (err instanceof ServiceError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  throw err;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  const { participantId } = await params;
  try {
    const body = await request.json();
    return NextResponse.json(await updateProgress(participantId, body));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  const { id: raceId, participantId } = await params;
  try {
    await leaveRace(raceId, participantId);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
