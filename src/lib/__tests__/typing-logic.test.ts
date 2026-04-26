import { validateInput, calculateWpm } from "../typing-logic";

describe("validateInput", () => {
  it("returns all correct for matching input", () => {
    const result = validateInput("Lor", "Lorem");
    expect(result).toEqual([
      { char: "L", status: "correct" },
      { char: "o", status: "correct" },
      { char: "r", status: "correct" },
    ]);
  });

  it("marks first wrong char and everything after as incorrect", () => {
    const result = validateInput("Lom", "Lorem");
    expect(result).toEqual([
      { char: "L", status: "correct" },
      { char: "o", status: "correct" },
      { char: "m", status: "incorrect" },
    ]);
  });

  it("marks all chars after first mistake as incorrect even if they match", () => {
    const result = validateInput("Lomer", "Lorem");
    expect(result).toEqual([
      { char: "L", status: "correct" },
      { char: "o", status: "correct" },
      { char: "m", status: "incorrect" },
      { char: "e", status: "incorrect" },
      { char: "r", status: "incorrect" },
    ]);
  });

  it("handles input longer than target word", () => {
    const result = validateInput("Loremm", "Lorem");
    expect(result).toEqual([
      { char: "L", status: "correct" },
      { char: "o", status: "correct" },
      { char: "r", status: "correct" },
      { char: "e", status: "correct" },
      { char: "m", status: "correct" },
      { char: "m", status: "incorrect" },
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(validateInput("", "Lorem")).toEqual([]);
  });

  it("detects if input has any error", () => {
    const correct = validateInput("Lor", "Lorem");
    expect(correct.some((c) => c.status === "incorrect")).toBe(false);

    const wrong = validateInput("Lom", "Lorem");
    expect(wrong.some((c) => c.status === "incorrect")).toBe(true);
  });

  it("returns exact match when input equals target", () => {
    const result = validateInput("Lorem", "Lorem");
    expect(result.every((c) => c.status === "correct")).toBe(true);
  });
});

describe("calculateWpm", () => {
  it("returns 0 when no time has elapsed", () => {
    expect(calculateWpm(50, 0)).toBe(0);
  });

  it("calculates WPM as (chars / 5) / minutes", () => {
    // 50 chars in 60 seconds = 10 WPM
    expect(calculateWpm(50, 60000)).toBe(10);
  });

  it("rounds to nearest integer", () => {
    // 27 chars in 30 seconds = (27/5) / 0.5 = 10.8 -> 11
    expect(calculateWpm(27, 30000)).toBe(11);
  });
});