import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/app/api/v1/_lib/handler";
import { createApiKey, listApiKeys } from "@/server/services/api-keys";
import { ServiceError } from "@/server/services/errors";
import { db } from "@drizzle";
import { apiKey } from "@drizzle/schema";
import { count, eq } from "drizzle-orm";

function requireSession(source: string) {
  if (source !== "session") {
    throw new ServiceError(
      "FORBIDDEN",
      "API keys can only be managed from a browser session"
    );
  }
}

const query = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const GET = withApi({ auth: "required", query }, async ({ caller, query }) => {
  requireSession(caller.source);
  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;
  const data = await listApiKeys(caller.userId, limit, offset);
  const [{ count: total }] = await db.select({ count: count() }).from(apiKey).where(eq(apiKey.userId, caller.userId));
  return NextResponse.json({ data, meta: { limit, offset, total } });
});

const body = z.object({ name: z.string().min(1) });

export const POST = withApi(
  { auth: "required", body },
  async ({ caller, body }) => {
    requireSession(caller.source);
    const created = await createApiKey(caller.userId, body.name);
    return NextResponse.json({ data: created }, { status: 201 });
  }
);
