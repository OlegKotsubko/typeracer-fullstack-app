import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/app/api/v1/_lib/handler";
import { createRace, listRaces } from "@/server/services/races";

export const GET = withApi({}, async () => {
  const races = await listRaces();
  return NextResponse.json({ data: races });
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
