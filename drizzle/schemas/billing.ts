import { pgTable, text, timestamp, integer, uuid, jsonb, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export type PlanLimits = {
  racesPerDay?: number;
  apiRequestsPerMinute?: number;
  maxParticipantsPerRace?: number;
};

export const plan = pgTable("plan", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  monthlyPriceCents: integer("monthly_price_cents").notNull().default(0),
  limits: jsonb("limits").$type<PlanLimits>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const subscription = pgTable(
  "subscription",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => plan.id),
    status: text("status", {
      enum: ["active", "canceled", "past_due", "trialing"],
    })
      .notNull()
      .default("active"),
    currentPeriodEnd: timestamp("current_period_end"),
    provider: text("provider"),
    providerSubscriptionId: text("provider_subscription_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("subscription_userId_idx").on(table.userId)]
);

export const apiKey = pgTable(
  "api_key",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    hash: text("hash").notNull().unique(),
    lastUsedAt: timestamp("last_used_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("api_key_userId_idx").on(table.userId),
    index("api_key_prefix_idx").on(table.prefix),
  ]
);
