import { calculateWpm, isExactMatch, validateInput } from "@/lib/typing-logic"

export type RoomParticipant = {
  id: string;
  nickname: string;
  socketId: string;
  wordIndex: number;
  mistakes: number;
  startedAt: number;
  lastInput: string;
};

type RoomState = {
  participants: RoomParticipant[];
  countdownStarted: boolean;
  completedCount: number;
  text: string;
  words: string[];
  durationSeconds: number | null;
};

export type KeystrokeResult = {
  progress: number;
  wpm: number;
  mistakes: number;
  wordIndex: number;
  completed: boolean;
  timeSeconds?: number;
  totalCorrectChars: number;
};

export class RoomManager {
  private rooms = new Map<string, RoomState>()

  private getOrCreateRoom(raceId: string): RoomState {
    let room = this.rooms.get(raceId)
    if (!room) {
      room = { participants: [], countdownStarted: false, completedCount: 0, text: "", words: [], durationSeconds: null }
      this.rooms.set(raceId, room)
    }
    return room
  }

  addParticipant(raceId: string, participant: Pick<RoomParticipant, "id" | "nickname" | "socketId">): void {
    const room = this.getOrCreateRoom(raceId)
    room.participants.push({
      ...participant,
      wordIndex: 0,
      mistakes: 0,
      startedAt: 0,
      lastInput: "",
    })
  }

  removeParticipant(raceId: string, socketId: string): RoomParticipant | null {
    const room = this.rooms.get(raceId)
    if (!room) return null
    const index = room.participants.findIndex((p) => p.socketId === socketId)
    if (index === -1) return null
    const [removed] = room.participants.splice(index, 1)
    return removed
  }

  getParticipants(raceId: string): RoomParticipant[] {
    return this.rooms.get(raceId)?.participants ?? []
  }

  isFull(raceId: string): boolean {
    return this.getParticipants(raceId).length >= 3
  }

  canJoin(raceId: string): boolean {
    const room = this.rooms.get(raceId)
    if (!room) return true
    if (room.countdownStarted) return false
    return room.participants.length < 3
  }

  markCountdownStarted(raceId: string): void {
    const room = this.getOrCreateRoom(raceId)
    room.countdownStarted = true
  }

  isCountdownStarted(raceId: string): boolean {
    return this.rooms.get(raceId)?.countdownStarted ?? false
  }

  findBySocketId(socketId: string): { raceId: string; participant: RoomParticipant } | null {
    for (const [raceId, room] of Array.from(this.rooms.entries())) {
      const participant = room.participants.find((p) => p.socketId === socketId)
      if (participant) return { raceId, participant }
    }
    return null
  }

  markParticipantDone(raceId: string): { allDone: boolean } {
    const room = this.rooms.get(raceId)
    if (!room) return { allDone: true }
    room.completedCount++
    return { allDone: room.completedCount >= room.participants.length }
  }

  isAllDone(raceId: string): boolean {
    const room = this.rooms.get(raceId)
    if (!room) return false
    return room.participants.length === 0 || room.completedCount >= room.participants.length
  }

  resetRoom(raceId: string): void {
    this.rooms.delete(raceId)
  }

  setRaceText(raceId: string, text: string): void {
    const room = this.getOrCreateRoom(raceId)
    room.text = text
    room.words = text.split(" ").filter((w) => w.length > 0)
  }

  setDurationSeconds(raceId: string, durationSeconds: number | null): void {
    const room = this.getOrCreateRoom(raceId)
    room.durationSeconds = durationSeconds
  }

  setStartedAt(raceId: string): void {
    const room = this.rooms.get(raceId)
    if (!room) return
    const now = Date.now()
    for (const p of room.participants) {
      p.startedAt = now
    }
  }

  handleKeystroke(raceId: string, participantId: string, input: string): KeystrokeResult | null {
    const room = this.rooms.get(raceId)
    if (!room || room.words.length === 0) return null

    const participant = room.participants.find((p) => p.id === participantId)
    if (!participant || participant.startedAt === 0) return null

    if (room.durationSeconds !== null && participant.startedAt > 0) {
      const elapsed = Math.floor((Date.now() - participant.startedAt) / 1000)
      if (elapsed >= room.durationSeconds) return null
    }

    // Already completed
    if (participant.wordIndex >= room.words.length) return null

    const { words } = room
    const currentWord = words[participant.wordIndex]

    // Count mistakes only for newly added characters
    if (input.length > participant.lastInput.length) {
      const newChars = input.slice(participant.lastInput.length)
      for (let i = 0; i < newChars.length; i++) {
        const charIndex = participant.lastInput.length + i
        const expected = currentWord[charIndex]
        if (expected === undefined || newChars[i] !== expected) {
          participant.mistakes++
        }
      }
    }
    participant.lastInput = input

    const isLastWord = participant.wordIndex === words.length - 1
    const trimmed = input.endsWith(" ") ? input.slice(0, -1) : input
    const isSubmission = input.endsWith(" ") || (isLastWord && isExactMatch(input, currentWord))

    if (isSubmission && isExactMatch(trimmed, currentWord)) {
      participant.wordIndex++
      participant.lastInput = ""

      const totalCorrectChars = words
        .slice(0, participant.wordIndex)
        .reduce((sum, w) => sum + w.length, 0)

      const elapsed = Date.now() - participant.startedAt
      const wpm = calculateWpm(totalCorrectChars, elapsed)
      const progress = Math.round((participant.wordIndex / words.length) * 100)
      const completed = participant.wordIndex >= words.length
      const timeSeconds = completed ? parseFloat((elapsed / 1000).toFixed(1)) : undefined

      return { progress, wpm, mistakes: participant.mistakes, wordIndex: participant.wordIndex, completed, timeSeconds, totalCorrectChars }
    }

    // Partial input — compute intermediate progress
    const completedChars = words
      .slice(0, participant.wordIndex)
      .reduce((sum, w) => sum + w.length, 0)
    const correctInCurrent = validateInput(input, currentWord).filter((c) => c.status === "correct").length
    const totalCorrectChars = completedChars + correctInCurrent
    const totalChars = words.reduce((sum, w) => sum + w.length, 0)
    const elapsed = Date.now() - participant.startedAt
    const wpm = calculateWpm(totalCorrectChars, elapsed)
    const progress = totalChars > 0 ? Math.round((totalCorrectChars / totalChars) * 100) : 0

    return { progress, wpm, mistakes: participant.mistakes, wordIndex: participant.wordIndex, completed: false, totalCorrectChars }
  }
}
