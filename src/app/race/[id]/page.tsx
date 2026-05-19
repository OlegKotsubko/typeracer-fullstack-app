import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { db } from "@drizzle"
import { races } from "@drizzle/schema"
import { Header } from "@/components/layout/header"
import { RaceInterface } from "@/components/race/race-interface"

export default async function RacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params
  let race
  try {
    [race] = await db.select().from(races).where(eq(races.id, id))
  } catch {
    notFound()
  }

  if (!race || race.status !== "active") {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <RaceInterface
          raceId={race.id}
          raceTitle={race.title}
          raceText={race.text}
          durationSeconds={race.durationSeconds}
        />
      </main>
    </>
  )
}
