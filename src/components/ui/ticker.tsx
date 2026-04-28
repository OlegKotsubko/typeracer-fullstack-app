function Ticker({ items }: { items: { label: string; value: string }[] }) {
  const doubled = [...items, ...items];
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
