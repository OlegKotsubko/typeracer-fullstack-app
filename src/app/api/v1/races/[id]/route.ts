import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/app/api/v1/_lib/handler";
import { deleteRace, getRace, updateRace } from "@/server/services/races";

const params = z.object({ id: z.string().uuid() });

export const GET = withApi({ params }, async ({ params }) => {
  const race = await getRace(params.id);
  return NextResponse.json({ data: race });
});

const patchBody = z.object({
  title: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  status: z.enum(["draft", "active", "ongoing", "completed"]).optional(),
  durationSeconds: z.number().int().positive().nullable().optional(),
});

export const PATCH = withApi(
  { auth: "required", params, body: patchBody },
  async ({ params, body }) => {
    const race = await updateRace(params.id, body);
    return NextResponse.json({ data: race });
  }
);

export const DELETE = withApi(
  { auth: "required", params },
  async ({ params }) => {
    await deleteRace(params.id);
    return NextResponse.json({ data: { id: params.id } });
  }
);
