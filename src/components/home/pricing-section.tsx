import { db } from "@drizzle";
import { plan } from "@drizzle/schema";
import { asc } from "drizzle-orm";

const FEATURES: Record<string, string[]> = {
  free: [
    "Public races and leaderboard",
    "Join unlimited public lobbies",
    "Basic stats and history",
  ],
  pro: [
    "Everything in Free",
    "Personal API key for the v1 REST API",
    "Higher per-race participant cap",
    "Priority matchmaking",
  ],
  team: [
    "Everything in Pro",
    "Multi-seat workspace",
    "Team leaderboards & analytics",
    "Highest API throughput",
  ],
};

function priceLabel(cents: number) {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(0)}`;
}

export async function PricingSection() {
  const plans = await db.select().from(plan).orderBy(asc(plan.monthlyPriceCents));

  return (
    <section id="pricing" className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="kick">
              Subscriptions
              <span
                style={{
                  marginLeft: "0.5rem",
                  padding: "0.1rem 0.4rem",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  border: "1px solid currentColor",
                  borderRadius: "0.25rem",
                  textTransform: "uppercase",
                }}
              >
                Beta
              </span>
            </div>
            <h2>Race free, scale when you need it</h2>
          </div>
          <div className="meta">Plans &amp; API access</div>
        </div>

        <div
          className="benefits"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {plans.map((p, i) => {
            const features = FEATURES[p.id] ?? [];
            const limits = p.limits ?? {};
            const isLast = i === plans.length - 1;
            return (
              <div
                key={p.id}
                className="ben"
                style={isLast ? { borderRight: "none" } : undefined}
              >
                <div className="ben-idx">{`// ${p.id}`}</div>
                <h4>{p.name}</h4>
                <p style={{ fontSize: "1.6rem", margin: "0.4rem 0" }}>
                  {priceLabel(p.monthlyPriceCents)}
                  {p.monthlyPriceCents > 0 && (
                    <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                      {" "}
                      / month
                    </span>
                  )}
                </p>
                <ul style={{ margin: "0.5rem 0 0.75rem", paddingLeft: "1rem" }}>
                  {features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p style={{ fontSize: "0.8rem", opacity: 0.75 }}>
                  {limits.racesPerDay ?? "—"} races/day ·{" "}
                  {limits.apiRequestsPerMinute ?? "—"} req/min ·{" "}
                  {limits.maxParticipantsPerRace ?? "—"} racers/lobby
                </p>
                <div className="ben-bar" />
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: "1rem", fontSize: "0.85rem", opacity: 0.7 }}>
          Checkout is coming soon. Free plan is active by default — Pro and
          Team will unlock via Stripe in the next release.
        </p>
      </div>
    </section>
  );
}
