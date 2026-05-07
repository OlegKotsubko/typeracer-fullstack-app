import Link from "next/link";
import {db} from "@/db";
import { races, participants } from "@/db/schema";
import {eq, count} from "drizzle-orm";

export async function RacesSection() {
  const activeRaces = await db
    .select()
    .from(races)
    .where(eq(races.status, "active"));

  const allRaces = await Promise.all(
    activeRaces.map(async (race) => {
      const [result] = await db
        .select({ count: count() })
        .from(participants)
        .where(eq(participants.raceId, race.id));
      return { ...race, participantCount: result?.count ?? 0 };
    })
  );

  return (
    <section id="races" className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="kick">Active Circuits</div>
            <h2>Pick your race</h2>
          </div>
          <div className="meta">
            {allRaces.length} / {allRaces.length} Live · Updated just now
          </div>
        </div>

        {allRaces.length === 0 ? (
          <div className="races-empty">// No active circuits — check back when the grid lights up</div>
        ) : (
          <div className="races">
            {allRaces.map((race, i) => {
              const wordCount = race.text.split(/\s+/).filter(Boolean).length;
              const tagTone = i % 3 === 1 ? "amber" : i % 3 === 2 ? "pink" : "";
              return (
                <Link key={race.id} href={`/race/${race.id}`} className="race-card">
                  <div className="rc-top">
                    <span>{race.id.slice(0, 8).toUpperCase()} // Circuit</span>
                    <span className={`rc-tag ${tagTone}`}>● LIVE</span>
                  </div>
                  <h3>{race.title}</h3>
                  <div className="rc-excerpt">{race.text}</div>
                  <div className="rc-stats">
                    <span>
                      Words <b>{wordCount}</b>
                    </span>
                    <span>
                      Racers <b>{race.participantCount}</b>
                    </span>
                  </div>
                  <div className="rc-cta">Enter Race</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
