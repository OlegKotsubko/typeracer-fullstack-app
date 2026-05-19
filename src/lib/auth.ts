import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"

import { db } from "@drizzle"
import "dotenv/config"

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
  plugins: [nextCookies()],
})
