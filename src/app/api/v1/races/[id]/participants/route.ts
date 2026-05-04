import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "../../../_lib/handler";
import { joinRace, listParticipants } from "@/server/services/participants";

const params = z.object({ id: z.string().uuid() });

export const GET = withApi({ params }, async ({ params }) => {
  const list = await listParticipants(params.id);
  return NextResponse.json({ data: list });
});

const joinBody = z.object({ nickname: z.string().min(1) });

export const POST = withApi(
  { params, body: joinBody },
  async ({ params, body }) => {
    const participant = await joinRace({
      raceId: params.id,
      nickname: body.nickname,
    });
    return NextResponse.json({ data: participant }, { status: 201 });
  }
);
