import { NextResponse } from "next/server"

import { ServiceError } from "@/server/services/errors"

export function errorEnvelope(err: unknown): NextResponse {
  if (err instanceof ServiceError) {
    return NextResponse.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      },
      { status: err.status }
    )
  }
  console.error("[v1] unhandled error:", err)
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
    { status: 500 }
  )
}
