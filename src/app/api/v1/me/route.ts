import { NextResponse } from "next/server";
import { withApi } from "../_lib/handler";

export const GET = withApi({ auth: "required" }, async ({ caller }) => {
  return NextResponse.json({
    data: {
      userId: caller.userId,
      source: caller.source,
      plan: caller.plan,
    },
  });
});
