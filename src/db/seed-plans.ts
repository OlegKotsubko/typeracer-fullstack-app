import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { plan } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

const PLANS: (typeof plan.$inferInsert)[] = [
  {
    id: "free",
    name: "Free",
    monthlyPriceCents: 0,
    limits: {
      racesPerDay: 5,
      apiRequestsPerMinute: 30,
      maxParticipantsPerRace: 3,
    },
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPriceCents: 900,
    limits: {
      racesPerDay: 100,
      apiRequestsPerMinute: 300,
      maxParticipantsPerRace: 10,
    },
  },
  {
    id: "team",
    name: "Team",
    monthlyPriceCents: 2900,
    limits: {
      racesPerDay: 1000,
      apiRequestsPerMinute: 1000,
      maxParticipantsPerRace: 25,
    },
  },
];

async function seed() {
  for (const p of PLANS) {
    await db
      .insert(plan)
      .values(p)
      .onConflictDoUpdate({
        target: plan.id,
        set: {
          name: p.name,
          monthlyPriceCents: p.monthlyPriceCents,
          limits: p.limits,
        },
      });
    console.log(`upserted plan: ${p.id}`);
  }
}

seed().then(() => process.exit(0));
