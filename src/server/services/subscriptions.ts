import { and, eq } from "drizzle-orm"

import { db } from "@drizzle"
import { plan, subscription, type PlanLimits } from "@drizzle/schema"

import { ServiceError } from "./errors"

export const FREE_PLAN_ID = "free"

export type ResolvedPlan = {
  id: string;
  name: string;
  limits: PlanLimits;
};

const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, team: 2 }

export async function getActivePlan(userId: string): Promise<ResolvedPlan> {
  const [row] = await db
    .select({
      id: plan.id,
      name: plan.name,
      limits: plan.limits,
    })
    .from(subscription)
    .innerJoin(plan, eq(plan.id, subscription.planId))
    .where(
      and(eq(subscription.userId, userId), eq(subscription.status, "active"))
    )
    .limit(1)

  if (row) return row
  return getFreePlan()
}

export async function getFreePlan(): Promise<ResolvedPlan> {
  const [free] = await db
    .select({ id: plan.id, name: plan.name, limits: plan.limits })
    .from(plan)
    .where(eq(plan.id, FREE_PLAN_ID))

  if (!free) {
    return { id: FREE_PLAN_ID, name: "Free", limits: {} }
  }
  return free
}

export function requirePlan(current: ResolvedPlan, minPlanId: string) {
  const cur = PLAN_RANK[current.id] ?? 0
  const min = PLAN_RANK[minPlanId] ?? 0
  if (cur < min) {
    throw new ServiceError(
      "PLAN_REQUIRED",
      `This endpoint requires the '${minPlanId}' plan or higher`,
      { current: current.id, required: minPlanId }
    )
  }
}
