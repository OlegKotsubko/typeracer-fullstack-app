import { RoomManager } from "../socket-server-logic"

describe("RoomManager", () => {
  let manager: RoomManager

  beforeEach(() => {
    manager = new RoomManager()
  })

  it("adds a participant to a room", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" })
    expect(manager.getParticipants("race-1")).toEqual([
      expect.objectContaining({ id: "p1", nickname: "Alice", socketId: "s1" }),
    ])
  })

  it("returns true when room is full (3 participants)", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" })
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" })
    expect(manager.isFull("race-1")).toBe(false)
    manager.addParticipant("race-1", { id: "p3", nickname: "Charlie", socketId: "s3" })
    expect(manager.isFull("race-1")).toBe(true)
  })

  it("rejects join when room is full", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" })
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" })
    manager.addParticipant("race-1", { id: "p3", nickname: "Charlie", socketId: "s3" })
    expect(manager.canJoin("race-1")).toBe(false)
  })

  it("rejects join when countdown has started", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" })
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" })
    manager.addParticipant("race-1", { id: "p3", nickname: "Charlie", socketId: "s3" })
    manager.markCountdownStarted("race-1")
    expect(manager.canJoin("race-1")).toBe(false)
  })

  it("removes participant and frees slot during lobby", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" })
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" })
    manager.removeParticipant("race-1", "s2")
    expect(manager.getParticipants("race-1")).toEqual([
      expect.objectContaining({ id: "p1", nickname: "Alice", socketId: "s1" }),
    ])
    expect(manager.canJoin("race-1")).toBe(true)
  })

  it("removes participant but keeps slot filled after countdown", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" })
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" })
    manager.addParticipant("race-1", { id: "p3", nickname: "Charlie", socketId: "s3" })
    manager.markCountdownStarted("race-1")
    manager.removeParticipant("race-1", "s2")
    expect(manager.getParticipants("race-1")).toHaveLength(2)
    expect(manager.canJoin("race-1")).toBe(false)
  })

  it("finds participant by socket ID", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" })
    expect(manager.findBySocketId("s1")).toEqual({
      raceId: "race-1",
      participant: expect.objectContaining({ id: "p1", nickname: "Alice", socketId: "s1" }),
    })
  })

  it("returns null for unknown socket ID", () => {
    expect(manager.findBySocketId("unknown")).toBeNull()
  })

  // --- New tests for setRaceText and handleKeystroke ---

  describe("setRaceText", () => {
    it("stores the race text and word list", () => {
      manager.setRaceText("race-1", "hello world")
      manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" })
      manager.setStartedAt("race-1")
      const result = manager.handleKeystroke("race-1", "p1", "hel")
      expect(result).not.toBeNull()
    })
  })

  describe("handleKeystroke", () => {
    beforeEach(() => {
      manager.setRaceText("race-1", "hello world")
      manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" })
      manager.setStartedAt("race-1")
    })

    it("returns null when race text is not loaded", () => {
      const fresh = new RoomManager()
      fresh.addParticipant("race-2", { id: "p1", nickname: "Alice", socketId: "s1" })
      expect(fresh.handleKeystroke("race-2", "p1", "hel")).toBeNull()
    })

    it("returns null for unknown participant", () => {
      expect(manager.handleKeystroke("race-1", "unknown", "hel")).toBeNull()
    })

    it("returns progress for partial input", () => {
      const result = manager.handleKeystroke("race-1", "p1", "hel")
      expect(result).toMatchObject({
        wordIndex: 0,
        completed: false,
        mistakes: 0,
        progress: expect.any(Number),
        wpm: expect.any(Number),
      })
    })

    it("does not advance wordIndex on partial input", () => {
      manager.handleKeystroke("race-1", "p1", "hel")
      const result = manager.handleKeystroke("race-1", "p1", "hell")
      expect(result?.wordIndex).toBe(0)
    })

    it("advances wordIndex when trailing space + exact match", () => {
      const result = manager.handleKeystroke("race-1", "p1", "hello ")
      expect(result?.wordIndex).toBe(1)
      expect(result?.completed).toBe(false)
    })

    it("does not advance wordIndex on wrong word + trailing space", () => {
      const result = manager.handleKeystroke("race-1", "p1", "helo ")
      expect(result?.wordIndex).toBe(0)
    })

    it("completes race on last word exact match without trailing space", () => {
      manager.handleKeystroke("race-1", "p1", "hello ")
      const result = manager.handleKeystroke("race-1", "p1", "world")
      expect(result?.completed).toBe(true)
      expect(result?.wordIndex).toBe(2)
      expect(result?.timeSeconds).toBeGreaterThanOrEqual(0)
      expect(result?.progress).toBe(100)
    })

    it("completes race on last word with trailing space too", () => {
      manager.handleKeystroke("race-1", "p1", "hello ")
      const result = manager.handleKeystroke("race-1", "p1", "world ")
      expect(result?.completed).toBe(true)
    })

    it("returns null when race duration has expired", () => {
      manager.setDurationSeconds("race-1", 1)
      jest.spyOn(Date, "now").mockReturnValue(Date.now() + 2000)
      const result = manager.handleKeystroke("race-1", "p1", "hel")
      expect(result).toBeNull()
      jest.restoreAllMocks()
    })

    it("allows keystrokes when duration has not expired", () => {
      manager.setDurationSeconds("race-1", 60)
      const result = manager.handleKeystroke("race-1", "p1", "hel")
      expect(result).not.toBeNull()
    })

    it("allows keystrokes when durationSeconds is null", () => {
      manager.setDurationSeconds("race-1", null)
      const result = manager.handleKeystroke("race-1", "p1", "hel")
      expect(result).not.toBeNull()
    })

    it("returns null for keystrokes after race completion", () => {
      manager.handleKeystroke("race-1", "p1", "hello ")
      manager.handleKeystroke("race-1", "p1", "world")
      const result = manager.handleKeystroke("race-1", "p1", "extra")
      expect(result).toBeNull()
    })

    it("increments mistakes on newly typed incorrect characters", () => {
      manager.handleKeystroke("race-1", "p1", "x")
      const result = manager.handleKeystroke("race-1", "p1", "xy")
      expect(result?.mistakes).toBe(2)
    })

    it("does not increment mistakes on backspace (shorter input)", () => {
      manager.handleKeystroke("race-1", "p1", "x")
      const result = manager.handleKeystroke("race-1", "p1", "")
      expect(result?.mistakes).toBe(1)
    })

    it("does not increment mistakes for correct characters", () => {
      manager.handleKeystroke("race-1", "p1", "h")
      const result = manager.handleKeystroke("race-1", "p1", "he")
      expect(result?.mistakes).toBe(0)
    })

    it("progress is 100 after completing all words", () => {
      manager.handleKeystroke("race-1", "p1", "hello ")
      const result = manager.handleKeystroke("race-1", "p1", "world")
      expect(result?.progress).toBe(100)
    })
  })
})
