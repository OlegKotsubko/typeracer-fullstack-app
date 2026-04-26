type Winner = {
  id: string;
  nickname: string;
  raceTitle: string;
  timeSeconds: number;
  wpm: number;
  completedAt: Date;
};

export function LeaderboardSection({ winners }: { winners: Winner[] }) {
  return (
    <section className="leaderboard-section">
      <div className="max-w-350 mx-auto px-8 sm:px-12">
        <h2 className="leaderboard-heading">
          Top <span>10</span> Fastest
        </h2>
        <p className="leaderboard-subheading">
          The quickest fingers on the leaderboard
        </p>

        {winners.length === 0 ? (
          <p className="leaderboard-empty">
            No winners yet. Be the first to claim the top spot!
          </p>
        ) : (
          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Racer</th>
                  <th>Race</th>
                  <th>Time</th>
                  <th>WPM</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w, i) => (
                  <tr key={w.id} className={i < 3 ? "leaderboard-top3" : ""}>
                    <td className="leaderboard-rank">{i + 1}</td>
                    <td className="leaderboard-nickname">{w.nickname}</td>
                    <td className="leaderboard-race">{w.raceTitle}</td>
                    <td>{w.timeSeconds.toFixed(1)}s</td>
                    <td>{w.wpm}</td>
                    <td className="leaderboard-date">
                      {new Date(w.completedAt).toLocaleDateString()}
                    </td>
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