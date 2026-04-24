import { RoomManager } from "../socket-server-logic";

describe("RoomManager", () => {
  let manager: RoomManager;

  beforeEach(() => {
    manager = new RoomManager();
  });

  it("adds a participant to a room", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    expect(manager.getParticipants("race-1")).toEqual([
      { id: "p1", nickname: "Alice", socketId: "s1" },
    ]);
  });

  it("returns true when room is full (3 participants)", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" });
    expect(manager.isFull("race-1")).toBe(false);
    manager.addParticipant("race-1", { id: "p3", nickname: "Charlie", socketId: "s3" });
    expect(manager.isFull("race-1")).toBe(true);
  });

  it("rejects join when room is full", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" });
    manager.addParticipant("race-1", { id: "p3", nickname: "Charlie", socketId: "s3" });
    expect(manager.canJoin("race-1")).toBe(false);
  });

  it("rejects join when countdown has started", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" });
    manager.addParticipant("race-1", { id: "p3", nickname: "Charlie", socketId: "s3" });
    manager.markCountdownStarted("race-1");
    expect(manager.canJoin("race-1")).toBe(false);
  });

  it("removes participant and frees slot during lobby", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" });
    manager.removeParticipant("race-1", "s2");
    expect(manager.getParticipants("race-1")).toEqual([
      { id: "p1", nickname: "Alice", socketId: "s1" },
    ]);
    expect(manager.canJoin("race-1")).toBe(true);
  });

  it("removes participant but keeps slot filled after countdown", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    manager.addParticipant("race-1", { id: "p2", nickname: "Bob", socketId: "s2" });
    manager.addParticipant("race-1", { id: "p3", nickname: "Charlie", socketId: "s3" });
    manager.markCountdownStarted("race-1");
    manager.removeParticipant("race-1", "s2");
    expect(manager.getParticipants("race-1")).toHaveLength(2);
    expect(manager.canJoin("race-1")).toBe(false);
  });

  it("finds participant by socket ID", () => {
    manager.addParticipant("race-1", { id: "p1", nickname: "Alice", socketId: "s1" });
    expect(manager.findBySocketId("s1")).toEqual({
      raceId: "race-1",
      participant: { id: "p1", nickname: "Alice", socketId: "s1" },
    });
  });

  it("returns null for unknown socket ID", () => {
    expect(manager.findBySocketId("unknown")).toBeNull();
  });
});