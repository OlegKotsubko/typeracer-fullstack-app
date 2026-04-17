export function BenefitsSection() {
  return (
    <section className="benefits-section">
      <div className="max-w-350 mx-auto px-8 sm:px-12">
        <h2 className="races-section-heading">Why <span>TypeRacer</span></h2>
        <p className="races-section-subheading">Level up your typing skills while having fun</p>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🚀</div>
            <h3 className="benefit-title">Boost Your Speed</h3>
            <p className="benefit-desc">
              Practice against real opponents and watch your words-per-minute skyrocket. Track your improvement over time.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎯</div>
            <h3 className="benefit-title">Improve Accuracy</h3>
            <p className="benefit-desc">
              Our real-time feedback highlights mistakes instantly, helping you build muscle memory for error-free typing.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3 className="benefit-title">Real-Time Competition</h3>
            <p className="benefit-desc">
              Race head-to-head with live progress tracking. See every opponent&apos;s cursor move in real time.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎮</div>
            <h3 className="benefit-title">No Sign-Up Required</h3>
            <p className="benefit-desc">
              Jump into any race instantly with just a nickname. No accounts, no barriers &mdash; just pure typing action.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📊</div>
            <h3 className="benefit-title">Live Progress Tracking</h3>
            <p className="benefit-desc">
              See your accuracy, speed, and progress in real time. Every keystroke counts toward your final score.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🌐</div>
            <h3 className="benefit-title">Play Anywhere</h3>
            <p className="benefit-desc">
              Works in any modern browser on desktop or tablet. No downloads, no installs &mdash; just open and race.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
