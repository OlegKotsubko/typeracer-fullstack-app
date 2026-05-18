import "dotenv/config";

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("usage: tsx drizzle/apply-migration.ts <path>");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL!);
const text = readFileSync(resolve(file), "utf8");

const statements = text
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

(async () => {
  for (const stmt of statements) {
    console.log(stmt.split("\n")[0].slice(0, 80) + " ...");
    await sql.query(stmt);
  }
  console.log(`applied ${statements.length} statements`);
})();