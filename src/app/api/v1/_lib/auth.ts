import { getServerSession } from "@/lib/auth-server";
import { findActiveKeyByToken } from "@/server/services/api-keys";
import {
  getActivePlan,
  getFreePlan,
  type ResolvedPlan,
} from "@/server/services/subscriptions";

export type CallerSource = "session" | "api_key";

export type Caller = {
  userId: string;
  source: CallerSource;
  plan: ResolvedPlan;
};

export async function resolveCaller(req: Request): Promise<Caller | null> {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    const key = await findActiveKeyByToken(token);
    if (key) {
      return {
        userId: key.userId,
        source: "api_key",
        plan: await getActivePlan(key.userId),
      };
    }
    return null;
  }

  const session = await getServerSession();
  if (session?.user?.id) {
    return {
      userId: session.user.id,
      source: "session",
      plan: await getActivePlan(session.user.id),
    };
  }
  return null;
}

export async function anonymousPlan(): Promise<ResolvedPlan> {
  return getFreePlan();
}
