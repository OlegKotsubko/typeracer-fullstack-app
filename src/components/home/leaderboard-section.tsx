import { db } from "@/db";
import { winners } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function LeaderboardSection() {
  const topWinners = await db
    .select()
    .from(winners)
    .orderBy(asc(winners.timeSeconds))
    .limit(10);

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="kick">Hall of Drifters</div>
            <h2>Top 10 fastest</h2>
          </div>
          <div className="meta">The cleanest runs on the grid this cycle</div>
        </div>

        {topWinners.length === 0 ? (
          <div className="lb-empty">// No winners yet — be the first to claim the top spot</div>
        ) : (
          <div className="lb-wrap">
            <table className="lb">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Racer</th>
                  <th>Race</th>
                  <th>Time</th>
                  <th>WPM</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {topWinners.map((w, i) => (
                  <tr key={w.id} className={i < 3 ? "lb-top3" : ""}>
                    <td className="lb-rank">{String(i + 1).padStart(2, "0")}</td>
                    <td className="lb-nick">{w.nickname}</td>
                    <td className="lb-race">{w.raceTitle}</td>
                    <td className="lb-num">{w.timeSeconds.toFixed(1)}s</td>
                    <td className="lb-num">{w.wpm}</td>
                    <td className="lb-date">{new Date(w.completedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
