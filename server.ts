import "dotenv/config";
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./src/db/schema";
import { RoomManager } from "@/lib/socket-server-logic";
import { setupSocketHandlers } from "@/lib/socket-handlers";

const dev = process.env.NODE_ENV !== "production";
const PORT = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });
const rooms = new RoomManager();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  db.update(schema.races).set({ status: "active", startAt: null }).where(eq(schema.races.status, "ongoing")).then(() => {});

  setupSocketHandlers(io, db, rooms, schema.races, schema.participants, schema.winners);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
