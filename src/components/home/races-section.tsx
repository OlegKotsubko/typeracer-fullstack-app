import Link from "next/link";

type Race = {
  id: string;
  title: string;
  text: string;
  participantCount: number;
};

export function RacesSection({ races }: { races: Race[] }) {
  return (
    <section id="races" className="races-section">
      <div className="max-w-350 mx-auto px-8 sm:px-12">
        <h2 className="races-section-heading">Live <span>Races</span></h2>
        <p className="races-section-subheading">Jump in and start typing</p>

        {races.length === 0 ? (
          <p className="races-empty">No active races right now. Check back soon!</p>
        ) : (
          <div className="races-grid">
            {races.map((race) => (
              <Link key={race.id} href={`/race/${race.id}`} className="race-card">
                <div className="race-card-badge">● Active</div>
                <div className="race-card-title">{race.title}</div>
                <div className="race-card-meta">
                  <span>{race.text.split(/\s+/).length} words</span>
                  <span>·</span>
                  <span>{race.participantCount} racer{race.participantCount !== 1 ? "s" : ""}</span>
                </div>
                <p className="race-card-preview">{race.text}</p>
                <div className="btn-secondary-neon">Join Race</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
