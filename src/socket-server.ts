import "dotenv/config";

// dotenv/config loads .env by default; we need .env.local
import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { Server } from "socket.io";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db/schema";
import { participants, races, winners } from "./db/schema";
import { asc } from "drizzle-orm";
import { RoomManager } from "./lib/socket-server-logic";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

const PORT = parseInt(process.env.SOCKET_PORT || "3001", 10);

const io = new Server(PORT, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms = new RoomManager();

// Reset stale "ongoing" races on server start (handles restarts)
db.update(races)
  .set({ status: "active", startAt: null })
  .where(eq(races.status, "ongoing"))
  .then(() => {});

async function checkAndInsertWinner(entry: {
  nickname: string;
  raceTitle: string;
  timeSeconds: number;
  wpm: number;
  completedAt: Date;
}) {
  const current = await db
    .select()
    .from(winners)
    .orderBy(asc(winners.timeSeconds));

  if (current.length < 10) {
    await db.insert(winners).values(entry);
  } else {
    const slowest = current[current.length - 1];
    if (entry.timeSeconds < slowest.timeSeconds) {
      await db.insert(winners).values(entry);
      await db.delete(winners).where(eq(winners.id, slowest.id));
    }
  }
}

async function endRace(raceId: string) {
  await db
    .update(races)
    .set({ status: "active", startAt: null })
    .where(eq(races.id, raceId));

  await db.delete(participants).where(eq(participants.raceId, raceId));

  rooms.resetRoom(raceId);

  io.to(`race:${raceId}`).emit("race-ended");
}

io.on("connection", (socket) => {
  socket.on(
    "join-race",
    async (
      data: { raceId: string; nickname: string },
      callback: (response: { participantId?: string; error?: string }) => void
    ) => {
      const { raceId, nickname } = data;

      if (!rooms.canJoin(raceId)) {
        callback({ error: "Race is full or already started" });
        return;
      }

      // Create participant in DB
      const [participant] = await db
        .insert(participants)
        .values({ raceId, nickname: nickname.trim() })
        .returning();

      rooms.addParticipant(raceId, {
        id: participant.id,
        nickname: participant.nickname,
        socketId: socket.id,
      });

      socket.join(`race:${raceId}`);

      const currentParticipants = rooms.getParticipants(raceId);

      // Broadcast updated participant list
      io.to(`race:${raceId}`).emit("participant-joined", {
        participants: currentParticipants.map((p) => ({
          id: p.id,
          nickname: p.nickname,
        })),
        slots: 3,
      });

      callback({ participantId: participant.id });

      // If room is full, start countdown
      if (rooms.isFull(raceId)) {
        const startAt = new Date(Date.now() + 3000);
        rooms.markCountdownStarted(raceId);

        await db
          .update(races)
          .set({ status: "ongoing", startAt })
          .where(eq(races.id, raceId));

        io.to(`race:${raceId}`).emit("race-starting", {
          startAt: startAt.toISOString(),
        });
      }
    }
  );

  socket.on(
    "progress-update",
    (data: {
      raceId: string;
      participantId: string;
      progress: number;
      mistakes: number;
      totalAttempted: number;
      wpm: number;
    }) => {
      const { raceId, participantId, progress, mistakes, totalAttempted, wpm } =
        data;

      // Persist to DB (fire and forget)
      db.update(participants)
        .set({ progress, mistakes, totalAttempted, wpm })
        .where(eq(participants.id, participantId))
        .then(() => {});

      // Broadcast to room
      socket.to(`race:${raceId}`).emit("race-progress", {
        participantId,
        progress,
        mistakes,
        totalAttempted,
        wpm,
      });
    }
  );

  socket.on(
    "race-complete",
    async (data: {
      raceId: string;
      participantId: string;
      timeSeconds: number;
      wpm: number;
    }) => {
      const { raceId, participantId, timeSeconds, wpm } = data;
      const completedAt = new Date();

      // Query race title and participant nickname BEFORE any mutations
      const [race] = await db
        .select({ title: races.title })
        .from(races)
        .where(eq(races.id, raceId));

      const roomParticipant = rooms.getParticipants(raceId).find(
        (p) => p.id === participantId
      );

      await db
        .update(participants)
        .set({ progress: 100, completedAt })
        .where(eq(participants.id, participantId));

      io.to(`race:${raceId}`).emit("participant-completed", {
        participantId,
        completedAt: completedAt.toISOString(),
      });

      // Insert into leaderboard using in-memory nickname (avoids DB race condition)
      console.log("[race-complete]", {
        participantId,
        timeSeconds,
        wpm,
        hasRace: !!race,
        hasParticipant: !!roomParticipant,
      });

      if (race && roomParticipant) {
        await checkAndInsertWinner({
          nickname: roomParticipant.nickname,
          raceTitle: race.title,
          timeSeconds,
          wpm,
          completedAt,
        });
      }

      // Check if all participants are done — endRace deletes DB records
      const { allDone } = rooms.markParticipantDone(raceId);
      if (allDone) {
        await endRace(raceId);
      }
    }
  );

  socket.on("disconnect", async () => {
    const found = rooms.findBySocketId(socket.id);
    if (!found) return;

    const { raceId, participant } = found;
    const wasCountdownStarted = rooms.isCountdownStarted(raceId);
    rooms.removeParticipant(raceId, socket.id);

    // Remove from DB
    await db
      .delete(participants)
      .where(eq(participants.id, participant.id));

    const remaining = rooms.getParticipants(raceId);
    io.to(`race:${raceId}`).emit("participant-left", {
      participants: remaining.map((p) => ({ id: p.id, nickname: p.nickname })),
    });

    // If race was in progress and all remaining are done (or room empty), end race
    if (wasCountdownStarted && rooms.isAllDone(raceId)) {
      await endRace(raceId);
    }
  });
});

console.log(`Socket.io server running on port ${PORT}`);