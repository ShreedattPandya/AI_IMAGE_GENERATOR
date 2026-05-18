export default function History({ items, onSelect }) {
  if (!items.length) return null;

  return (
    <section className="history-section">
      <h2>Recent Generations</h2>
      <div className="history-grid">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="hist-item"
            onClick={() => onSelect(item)}
          >
            <img src={item.imageUrl} loading="lazy" alt="" />
            <div className="hist-label">{item.prompt}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
