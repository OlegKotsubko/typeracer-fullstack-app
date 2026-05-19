import "dotenv/config"
import { Server } from "socket.io"
import { eq } from "drizzle-orm"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "@drizzle/schema"
import { races } from "@drizzle/schema"

import { RoomManager } from "./lib/socket-server-logic"
import { setupSocketHandlers } from "./lib/socket-handlers"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle({ client: sql, schema })
const rooms = new RoomManager()

const PORT = parseInt(process.env.SOCKET_PORT || "3001", 10)

const io = new Server(PORT, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

db.update(races).set({ status: "active", startAt: null }).where(eq(races.status, "ongoing")).then(() => {})

setupSocketHandlers(io, db, rooms, schema.races, schema.participants, schema.winners)

console.log(`Socket.io server running on port ${PORT}`)
