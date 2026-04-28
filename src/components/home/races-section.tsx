import Link from "next/link";

type Race = {
  id: string;
  title: string;
  text: string;
  participantCount: number;
};

export function RacesSection({ races }: { races: Race[] }) {
  return (
    <section id="races" className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="kick">Active Circuits</div>
            <h2>Pick your race</h2>
          </div>
          <div className="meta">
            {races.length} / {races.length} Live · Updated just now
          </div>
        </div>

        {races.length === 0 ? (
          <div className="races-empty">// No active circuits — check back when the grid lights up</div>
        ) : (
          <div className="races">
            {races.map((race, i) => {
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
