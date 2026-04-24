import { config } from "dotenv";
config({ path: ".env.local" });

import { Server } from "socket.io";
import { db } from "./db";
import { participants, races } from "./db/schema";
import { eq } from "drizzle-orm";
import { RoomManager } from "./lib/socket-server-logic";

const PORT = parseInt(process.env.SOCKET_PORT || "3001", 10);

const io = new Server(PORT, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms = new RoomManager();

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
          .set({ startAt })
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
    async (data: { raceId: string; participantId: string }) => {
      const { raceId, participantId } = data;
      const completedAt = new Date();

      await db
        .update(participants)
        .set({ progress: 100, completedAt })
        .where(eq(participants.id, participantId));

      io.to(`race:${raceId}`).emit("participant-completed", {
        participantId,
        completedAt: completedAt.toISOString(),
      });
    }
  );

  socket.on("disconnect", async () => {
    const found = rooms.findBySocketId(socket.id);
    if (!found) return;

    const { raceId, participant } = found;
    rooms.removeParticipant(raceId, socket.id);

    // Remove from DB
    await db
      .delete(participants)
      .where(eq(participants.id, participant.id));

    const remaining = rooms.getParticipants(raceId);
    io.to(`race:${raceId}`).emit("participant-left", {
      participants: remaining.map((p) => ({ id: p.id, nickname: p.nickname })),
    });
  });
});

console.log(`Socket.io server running on port ${PORT}`);