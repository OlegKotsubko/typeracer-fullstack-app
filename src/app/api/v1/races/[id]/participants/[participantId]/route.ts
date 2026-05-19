import { NextResponse } from "next/server"
import { z } from "zod"

import { withApi } from "@/app/api/v1/_lib/handler"
import { leaveRace, updateProgress } from "@/server/services/participants"

const params = z.object({
  id: z.string().uuid(),
  participantId: z.string().uuid(),
})

const isoDate = z.union([z.string().datetime(), z.date()])

const patchBody = z.object({
  progress: z.number().min(0).max(100).optional(),
  mistakes: z.number().int().min(0).optional(),
  totalAttempted: z.number().int().min(0).optional(),
  wpm: z.number().min(0).optional(),
  startedAt: isoDate.optional(),
  completedAt: isoDate.optional(),
})

export const PATCH = withApi(
  { params, body: patchBody },
  async ({ params, body }) => {
    const updated = await updateProgress(params.participantId, body)
    return NextResponse.json({ data: updated })
  }
)

export const DELETE = withApi({ params }, async ({ params }) => {
  await leaveRace(params.id, params.participantId)
  return NextResponse.json({ data: { id: params.participantId } })
})
