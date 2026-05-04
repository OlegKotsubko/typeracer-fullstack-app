import { db } from "@/db";
import { races, participants, winners } from "@/db/schema";
import { eq, count, asc } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/home/hero-section";
import { RacesSection } from "@/components/home/races-section";
import { LeaderboardSection } from "@/components/home/leaderboard-section";
import { BenefitsSection } from "@/components/home/benefits-section";
import { PricingSection } from "@/components/home/pricing-section";
import Ticker from "@/components/ui/ticker";
const TICKER_DATA = [
  { label: "Live Racers", value: "1,284" },
  { label: "Top WPM", value: "168" },
  { label: "Neon District", value: "OPEN" },
  { label: "Chrome Horizon", value: "OPEN" },
  { label: "Patch Notes", value: "v3.14.88" },
  { label: "Next Tournament", value: "T-02:14:08" },
];

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
      <Ticker items={TICKER_DATA}/>
      <RacesSection races={racesWithCounts} />
      <LeaderboardSection winners={topWinners} />
      <BenefitsSection />
      <PricingSection />
      <SiteFooter />
    </main>
  );
}
