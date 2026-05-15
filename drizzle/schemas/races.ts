import { pgTable, text, timestamp, integer, real, uuid, index } from "drizzle-orm/pg-core";

export const races = pgTable("races", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  text: text("text").notNull(),
  durationSeconds: integer("duration_seconds"),
  status: text("status", { enum: ["draft", "active", "ongoing", "completed"] })
    .notNull()
    .default("draft"),
  startAt: timestamp("start_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const participants = pgTable(
  "participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    raceId: uuid("race_id")
      .notNull()
      .references(() => races.id, { onDelete: "cascade" }),
    nickname: text("nickname").notNull(),
    progress: integer("progress").notNull().default(0),
    mistakes: integer("mistakes").notNull().default(0),
    totalAttempted: integer("total_attempted").notNull().default(0),
    wpm: integer("wpm").notNull().default(0),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("participants_raceId_idx").on(table.raceId)]
);

export const winners = pgTable("winners", {
  id: uuid("id").defaultRandom().primaryKey(),
  nickname: text("nickname").notNull(),
  raceTitle: text("race_title").notNull(),
  timeSeconds: real("time_seconds").notNull(),
  wpm: integer("wpm").notNull(),
  completedAt: timestamp("completed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
