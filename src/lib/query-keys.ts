export const queryKeys = {
  apiKeys: {
    all: () => ["apiKeys"] as const,
    list: () => ["apiKeys", "list"] as const,
  },
  races: {
    all: () => ["races"] as const,
    list: () => ["races", "list"] as const,
    detail: (id: string) => ["races", "detail", id] as const,
  },
  participants: {
    byRace: (raceId: string) => ["participants", "byRace", raceId] as const,
  },
}