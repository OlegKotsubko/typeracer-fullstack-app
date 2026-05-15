import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/app/api/v1/_lib/handler";
import { createRace, listRaces } from "@/server/services/races";
import { db } from "@drizzle";
import { races } from "@drizzle/schema";
import { count } from "drizzle-orm";

const query = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const GET = withApi({ query }, async ({ query }) => {
  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;
  const data = await listRaces(limit, offset);
  const [{ count: total }] = await db.select({ count: count() }).from(races);
  return NextResponse.json({ data, meta: { limit, offset, total } });
});

const createBody = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
  status: z.enum(["draft", "active", "ongoing", "completed"]).optional(),
  durationSeconds: z.number().int().positive().nullable().optional(),
});

export const POST = withApi(
  { auth: "required", body: createBody },
  async ({ body }) => {
    const race = await createRace(body);
    return NextResponse.json({ data: race }, { status: 201 });
  }
);
