import { db } from "@/db";
import { races, participants, winners } from "@/db/schema";
import { count, max } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const allRaces = await db.select().from(races);
  const active = allRaces.filter((r) => r.status === "active").length;
  const draft = allRaces.filter((r) => r.status === "draft").length;
  const totalPlays = await db.select({ count: count() }).from(participants);
  const peakWpm = await db.select({ peak: max(winners.wpm) }).from(winners);

  return (
    <div>
      <div className="sec-head" style={{ marginBottom: 18 }}>
        <span className="kick">{"// Operator Deck"}</span>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <span className="meta">
          <Link href="/admin/races/new">
            <Button>+ New Race</Button>
          </Link>
        </span>
      </div>

      <div className="stats">
        <div className="stat chamfer">
          <div className="k">Active Races</div>
          <div className="v"><b>{active}</b></div>
          <div className="d">{"// Live now"}</div>
        </div>
        <div className="stat chamfer">
          <div className="k">Draft Races</div>
          <div className="v">{draft}</div>
          <div className="d">{"// Awaiting launch"}</div>
        </div>
        <div className="stat chamfer">
          <div className="k">Total Plays</div>
          <div className="v">{totalPlays[0]?.count ?? 0}</div>
          <div className="d">{"// Sessions logged"}</div>
        </div>
        <div className="stat chamfer">
          <div className="k">Peak WPM</div>
          <div className="v"><b>{peakWpm[0]?.peak ?? 0}</b></div>
          <div className="d">{"// Top-end record"}</div>
        </div>
      </div>
    </div>
  );
}
