import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "../_lib/handler";
import { listWinners } from "@/server/services/winners";

const query = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const GET = withApi({ query }, async ({ query }) => {
  const data = await listWinners(query.limit);
  return NextResponse.json({ data });
});
