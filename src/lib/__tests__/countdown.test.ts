import { getTrafficLightPhase } from "../countdown";

describe("getTrafficLightPhase", () => {
  it("returns 'red' when 3 seconds remain", () => {
    const startAt = new Date(Date.now() + 3000);
    expect(getTrafficLightPhase(startAt, Date.now())).toBe("red");
  });

  it("returns 'red' when between 2-3 seconds remain", () => {
    const startAt = new Date(Date.now() + 2500);
    expect(getTrafficLightPhase(startAt, Date.now())).toBe("red");
  });

  it("returns 'yellow' when between 1-2 seconds remain", () => {
    const startAt = new Date(Date.now() + 1500);
    expect(getTrafficLightPhase(startAt, Date.now())).toBe("yellow");
  });

  it("returns 'green' when less than 1 second remains", () => {
    const startAt = new Date(Date.now() + 500);
    expect(getTrafficLightPhase(startAt, Date.now())).toBe("green");
  });

  it("returns 'go' when startAt is in the past", () => {
    const startAt = new Date(Date.now() - 100);
    expect(getTrafficLightPhase(startAt, Date.now())).toBe("go");
  });

  it("returns 'waiting' when more than 3 seconds remain", () => {
    const startAt = new Date(Date.now() + 5000);
    expect(getTrafficLightPhase(startAt, Date.now())).toBe("waiting");
  });
});