import { eq, asc } from "drizzle-orm";
import type { Server, Socket } from "socket.io";
import type { drizzle } from "drizzle-orm/neon-http";
import type * as schema from "@drizzle/schema";
import type { RoomManager } from "@/lib/socket-server-logic";

type DB = ReturnType<typeof drizzle<typeof schema>>;

async function checkAndInsertWinner(
  db: DB,
  winners: typeof schema.winners,
  entry: { nickname: string; raceTitle: string; timeSeconds: number; wpm: number; completedAt: Date }
) {
  const current = await db.select().from(winners).orderBy(asc(winners.timeSeconds));
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

async function endRace(
  db: DB,
  rooms: RoomManager,
  io: Server,
  raceId: string,
  races: typeof schema.races,
  participants: typeof schema.participants
) {
  await db.update(races).set({ status: "active", startAt: null }).where(eq(races.id, raceId));
  await db.delete(participants).where(eq(participants.raceId, raceId));
  rooms.resetRoom(raceId);
  io.to(`race:${raceId}`).emit("race-ended");
}

export function setupSocketHandlers(
  io: Server,
  db: DB,
  rooms: RoomManager,
  races: typeof schema.races,
  participants: typeof schema.participants,
  winners: typeof schema.winners
) {
  io.on("connection", (socket: Socket) => {
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

        const [participant] = await db
          .insert(participants)
          .values({ raceId, nickname: nickname.trim() })
          .returning();

        rooms.addParticipant(raceId, { id: participant.id, nickname: participant.nickname, socketId: socket.id });
        socket.join(`race:${raceId}`);

        io.to(`race:${raceId}`).emit("participant-joined", {
          participants: rooms.getParticipants(raceId).map((p) => ({ id: p.id, nickname: p.nickname })),
          slots: 3,
        });

        callback({ participantId: participant.id });

        if (rooms.isFull(raceId)) {
          const startAt = new Date(Date.now() + 3000);
          rooms.markCountdownStarted(raceId);
          await db.update(races).set({ status: "ongoing", startAt }).where(eq(races.id, raceId));
          io.to(`race:${raceId}`).emit("race-starting", { startAt: startAt.toISOString() });
        }
      }
    );

    socket.on(
      "progress-update",
      (data: { raceId: string; participantId: string; progress: number; mistakes: number; totalAttempted: number; wpm: number }) => {
        const { raceId, participantId, progress, mistakes, totalAttempted, wpm } = data;
        db.update(participants).set({ progress, mistakes, totalAttempted, wpm }).where(eq(participants.id, participantId)).then(() => {});
        socket.to(`race:${raceId}`).emit("race-progress", { participantId, progress, mistakes, totalAttempted, wpm });
      }
    );

    socket.on(
      "race-complete",
      async (data: { raceId: string; participantId: string; timeSeconds: number; wpm: number }) => {
        try {
          const { raceId, participantId, timeSeconds, wpm } = data;
          const completedAt = new Date();

          const roomParticipant = rooms.getParticipants(raceId).find((p) => p.id === participantId);
          const [race] = await db.select({ title: races.title }).from(races).where(eq(races.id, raceId));

          await db.update(participants).set({ progress: 100, completedAt }).where(eq(participants.id, participantId));
          io.to(`race:${raceId}`).emit("participant-completed", { participantId, completedAt: completedAt.toISOString() });

          if (race && roomParticipant) {
            await checkAndInsertWinner(db, winners, { nickname: roomParticipant.nickname, raceTitle: race.title, timeSeconds, wpm, completedAt });
          }

          const { allDone } = rooms.markParticipantDone(raceId);
          if (allDone) await endRace(db, rooms, io, raceId, races, participants);
        } catch (err) {
          console.error("[race-complete] ERROR:", err);
        }
      }
    );

    socket.on("disconnect", async () => {
      const found = rooms.findBySocketId(socket.id);
      if (!found) return;

      const { raceId, participant } = found;
      const wasCountdownStarted = rooms.isCountdownStarted(raceId);
      rooms.removeParticipant(raceId, socket.id);

      await db.delete(participants).where(eq(participants.id, participant.id));

      io.to(`race:${raceId}`).emit("participant-left", {
        participants: rooms.getParticipants(raceId).map((p) => ({ id: p.id, nickname: p.nickname })),
      });

      if (wasCountdownStarted && rooms.isAllDone(raceId)) {
        await endRace(db, rooms, io, raceId, races, participants);
      }
    });
  });
}