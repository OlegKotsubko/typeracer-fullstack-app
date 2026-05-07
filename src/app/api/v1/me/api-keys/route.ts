import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/app/api/v1/_lib/handler";
import { createApiKey, listApiKeys } from "@/server/services/api-keys";
import { ServiceError } from "@/server/services/errors";

function requireSession(source: string) {
  if (source !== "session") {
    throw new ServiceError(
      "FORBIDDEN",
      "API keys can only be managed from a browser session"
    );
  }
}

export const GET = withApi({ auth: "required" }, async ({ caller }) => {
  requireSession(caller.source);
  const keys = await listApiKeys(caller.userId);
  return NextResponse.json({ data: keys });
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
