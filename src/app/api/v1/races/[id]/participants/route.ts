import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/app/api/v1/_lib/handler";
import { joinRace, listParticipants } from "@/server/services/participants";
import { db } from "@drizzle";
import { participants } from "@drizzle/schema";
import { count, eq } from "drizzle-orm";

const params = z.object({ id: z.string().uuid() });

const query = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const GET = withApi({ params, query }, async ({ params, query }) => {
  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;
  const data = await listParticipants(params.id, limit, offset);
  const [{ count: total }] = await db.select({ count: count() }).from(participants).where(eq(participants.raceId, params.id));
  return NextResponse.json({ data, meta: { limit, offset, total } });
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
