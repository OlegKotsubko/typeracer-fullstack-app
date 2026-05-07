import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/home/hero-section";
import { RacesSection } from "@/components/home/races-section";
import { LeaderboardSection } from "@/components/home/leaderboard-section";
import { BenefitsSection } from "@/components/home/benefits-section";
import { PricingSection } from "@/components/home/pricing-section";
import Ticker from "@/components/ui/ticker";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      <Header />
      <HeroSection />
      <Ticker />
      <RacesSection />
      <LeaderboardSection />
      <BenefitsSection />
      <PricingSection />
      <SiteFooter />
    </main>
  );
}
