import { db } from "@/db";
import { races, participants, winners } from "@/db/schema";
import { eq, count, asc } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/home/hero-section";
import { RacesSection } from "@/components/home/races-section";
import { LeaderboardSection } from "@/components/home/leaderboard-section";
import { BenefitsSection } from "@/components/home/benefits-section";

export default async function HomePage() {
  const activeRaces = await db
    .select()
    .from(races)
    .where(eq(races.status, "active"));

  const racesWithCounts = await Promise.all(
    activeRaces.map(async (race) => {
      const [result] = await db
        .select({ count: count() })
        .from(participants)
        .where(eq(participants.raceId, race.id));
      return { ...race, participantCount: result?.count ?? 0 };
    })
  );

  const topWinners = await db
    .select()
    .from(winners)
    .orderBy(asc(winners.timeSeconds))
    .limit(10);

  return (
    <main className="flex-1 flex flex-col">
      <Header />
      <HeroSection />
      <RacesSection races={racesWithCounts} />
      <LeaderboardSection winners={topWinners} />
      <BenefitsSection />
      <SiteFooter />
    </main>
  );
}
