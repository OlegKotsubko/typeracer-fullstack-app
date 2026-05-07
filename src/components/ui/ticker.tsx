const TICKER_DATA = [
  { label: "Live Racers", value: "1,284" },
  { label: "Top WPM", value: "168" },
  { label: "Neon District", value: "OPEN" },
  { label: "Chrome Horizon", value: "OPEN" },
  { label: "Patch Notes", value: "v3.14.88" },
  { label: "Next Tournament", value: "T-02:14:08" },
];

function Ticker() {
  const doubled = [...TICKER_DATA, ...TICKER_DATA];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {doubled.map((it, i) => (
          <span key={i}>{it.label} <em>{it.value}</em></span>
        ))}
      </div>
    </div>
  );
}

export default Ticker;
