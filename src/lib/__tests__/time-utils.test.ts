import { secondsToMinutesSeconds, minutesSecondsToSeconds } from "../time-utils"

describe("secondsToMinutesSeconds", () => {
  it("converts 0 seconds to 0:0", () => {
    expect(secondsToMinutesSeconds(0)).toEqual({ minutes: 0, seconds: 0 })
  })

  it("converts 60 seconds to 1:0", () => {
    expect(secondsToMinutesSeconds(60)).toEqual({ minutes: 1, seconds: 0 })
  })

  it("converts 330 seconds to 5:30", () => {
    expect(secondsToMinutesSeconds(330)).toEqual({ minutes: 5, seconds: 30 })
  })

  it("converts 3661 seconds to 61:1", () => {
    expect(secondsToMinutesSeconds(3661)).toEqual({ minutes: 61, seconds: 1 })
  })
})

describe("minutesSecondsToSeconds", () => {
  it("converts 0:0 to 0 seconds", () => {
    expect(minutesSecondsToSeconds(0, 0)).toBe(0)
  })

  it("converts 1:0 to 60 seconds", () => {
    expect(minutesSecondsToSeconds(1, 0)).toBe(60)
  })

  it("converts 5:30 to 330 seconds", () => {
    expect(minutesSecondsToSeconds(5, 30)).toBe(330)
  })

  it("converts 61:1 to 3661 seconds", () => {
    expect(minutesSecondsToSeconds(61, 1)).toBe(3661)
  })
})
