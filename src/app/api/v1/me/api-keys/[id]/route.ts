import { NextResponse } from "next/server"
import { z } from "zod"

import { withApi } from "@/app/api/v1/_lib/handler"
import { revokeApiKey } from "@/server/services/api-keys"
import { ServiceError } from "@/server/services/errors"

const params = z.object({ id: z.string().uuid() })

export const DELETE = withApi(
  { auth: "required", params },
  async ({ caller, params }) => {
    if (caller.source !== "session") {
      throw new ServiceError(
        "FORBIDDEN",
        "API keys can only be managed from a browser session"
      )
    }
    await revokeApiKey(caller.userId, params.id)
    return NextResponse.json({ data: { id: params.id } })
  }
)
