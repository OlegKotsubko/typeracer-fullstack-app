import { db } from "@/db";
import { races, participants } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/home/hero-section";
import { RacesSection } from "@/components/home/races-section";
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

  return (
    <main className="flex-1 flex flex-col">
      <Header />
      <HeroSection />
      <RacesSection races={racesWithCounts} />
      <BenefitsSection />
      <SiteFooter />
    </main>
  );
}
