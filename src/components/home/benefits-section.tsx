/* eslint-disable max-len */
export function BenefitsSection() {
  const items = [
    {
      idx: "01",
      title: "Sub-8ms input latency",
      body: "Every keystroke lands before the scanline finishes. Tuned for mechanical boards and edge nodes — no middleware between you and the track.",
    },
    {
      idx: "02",
      title: "Lobbies in 30 seconds",
      body: "Three riders minimum, eight maximum. Smart matchmaking pairs you with racers inside your WPM band so the finish line is always within reach.",
    },
    {
      idx: "03",
      title: "Original tracks, weekly",
      body: "Fresh prose every Monday at 03:00 UTC, written by an in-house collective of cyberpunk authors. No recycled corpus, no AI slop, no public-domain fillers.",
    },
    {
      idx: "04",
      title: "Zero-bot guarantee",
      body: "Keystroke cadence analysis flags scripted input the moment a perfect rhythm hits the wire. Leaderboards stay honest — your name sits next to real hands.",
    },
  ]

  return (
    <section id="how"
      className="sec"
      style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="kick">
              Our Benefits
            </div>
            <h2>
              Why racers choose neondrift
            </h2>
          </div>
          <div className="meta">
            Built for the keyboard
          </div>
        </div>
        <div className="benefits">
          {items.map((b) => (
            <div key={b.idx}
              className="ben">
              <div className="ben-idx">
                {`// ${b.idx}`}
              </div>
              <h4>
                {b.title}
              </h4>
              <p>
                {b.body}
              </p>
              <div className="ben-bar" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
