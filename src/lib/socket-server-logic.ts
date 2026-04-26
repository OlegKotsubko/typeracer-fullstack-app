export type RoomParticipant = {
  id: string;
  nickname: string;
  socketId: string;
};

type RoomState = {
  participants: RoomParticipant[];
  countdownStarted: boolean;
  completedCount: number;
};

export class RoomManager {
  private rooms = new Map<string, RoomState>();

  private getOrCreateRoom(raceId: string): RoomState {
    let room = this.rooms.get(raceId);
    if (!room) {
      room = { participants: [], countdownStarted: false, completedCount: 0 };
      this.rooms.set(raceId, room);
    }
    return room;
  }

  addParticipant(raceId: string, participant: RoomParticipant): void {
    const room = this.getOrCreateRoom(raceId);
    room.participants.push(participant);
  }

  removeParticipant(raceId: string, socketId: string): RoomParticipant | null {
    const room = this.rooms.get(raceId);
    if (!room) return null;
    const index = room.participants.findIndex((p) => p.socketId === socketId);
    if (index === -1) return null;
    const [removed] = room.participants.splice(index, 1);
    return removed;
  }

  getParticipants(raceId: string): RoomParticipant[] {
    return this.rooms.get(raceId)?.participants ?? [];
  }

  isFull(raceId: string): boolean {
    return this.getParticipants(raceId).length >= 3;
  }

  canJoin(raceId: string): boolean {
    const room = this.rooms.get(raceId);
    if (!room) return true;
    if (room.countdownStarted) return false;
    return room.participants.length < 3;
  }

  markCountdownStarted(raceId: string): void {
    const room = this.getOrCreateRoom(raceId);
    room.countdownStarted = true;
  }

  isCountdownStarted(raceId: string): boolean {
    return this.rooms.get(raceId)?.countdownStarted ?? false;
  }

  findBySocketId(
    socketId: string
  ): { raceId: string; participant: RoomParticipant } | null {
    for (const [raceId, room] of Array.from(this.rooms.entries())) {
      const participant = room.participants.find(
        (p) => p.socketId === socketId
      );
      if (participant) return { raceId, participant };
    }
    return null;
  }

  markParticipantDone(raceId: string): { allDone: boolean } {
    const room = this.rooms.get(raceId);
    if (!room) return { allDone: true };
    room.completedCount++;
    return { allDone: room.completedCount >= room.participants.length };
  }

  isAllDone(raceId: string): boolean {
    const room = this.rooms.get(raceId);
    if (!room) return false;
    return room.participants.length === 0 || room.completedCount >= room.participants.length;
  }

  resetRoom(raceId: string): void {
    this.rooms.delete(raceId);
  }
}