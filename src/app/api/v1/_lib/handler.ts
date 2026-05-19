import { NextResponse } from "next/server"
import { z, ZodError, type ZodType } from "zod"

import { ServiceError } from "@/server/services/errors"
import { requirePlan } from "@/server/services/subscriptions"

import { resolveCaller, type Caller } from "./auth"
import { errorEnvelope } from "./errors"

type AuthMode = "required" | "optional";

type Options<P, B, Q, A extends AuthMode> = {
  auth?: A;
  params?: ZodType<P>;
  body?: ZodType<B>;
  query?: ZodType<Q>;
  requirePlan?: string;
};

type Ctx<P, B, Q, A extends AuthMode> = {
  req: Request;
  params: P;
  body: B;
  query: Q;
  caller: A extends "required" ? Caller : Caller | null;
};

type RouteContext = { params: Promise<Record<string, string>> };

export function withApi<
  P = Record<string, never>,
  B = undefined,
  Q = Record<string, never>,
  A extends AuthMode = "optional",
>(
  options: Options<P, B, Q, A>,
  handler: (ctx: Ctx<P, B, Q, A>) => Promise<NextResponse | Response>
) {
  return async (req: Request, route: RouteContext) => {
    try {
      const caller = await resolveCaller(req)
      if (options.auth === "required" && !caller) {
        throw new ServiceError("UNAUTHENTICATED", "Authentication required")
      }
      if (caller && options.requirePlan) {
        requirePlan(caller.plan, options.requirePlan)
      }

      const rawParams = (await route.params) ?? {}
      const params = options.params
        ? options.params.parse(rawParams)
        : (rawParams as P)

      const url = new URL(req.url)
      const rawQuery = Object.fromEntries(url.searchParams.entries())
      const query = options.query
        ? options.query.parse(rawQuery)
        : (rawQuery as Q)

      let body: B = undefined as B
      if (options.body) {
        const text = await req.text()
        const parsed = text ? JSON.parse(text) : {}
        body = options.body.parse(parsed)
      }

      return await handler({
        req,
        params,
        body,
        query,
        caller: caller as Ctx<P, B, Q, A>["caller"],
      })
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid request",
              details: err.issues,
            },
          },
          { status: 400 }
        )
      }
      return errorEnvelope(err)
    }
  }
}

export const z_ = z
