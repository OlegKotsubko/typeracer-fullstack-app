import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/app/api/v1/_lib/handler";
import { listWinners } from "@/server/services/winners";
import { db } from "@drizzle";
import { winners } from "@drizzle/schema";
import { count } from "drizzle-orm";

const query = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const GET = withApi({ query }, async ({ query }) => {
  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;
  const data = await listWinners(limit, offset);
  const [{ count: total }] = await db.select({ count: count() }).from(winners);
  return NextResponse.json({ data, meta: { limit, offset, total } });
});
