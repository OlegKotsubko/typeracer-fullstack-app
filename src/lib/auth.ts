import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@drizzle";
import "dotenv/config";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  advanced: {
    useSecureCookies: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
