export default function StatsRow({ tickets }) {
  const total = tickets.length;
  const entered = tickets.filter((t) => t.status === 'entered').length;
  const pending = tickets.filter((t) => t.status === 'pending').length;
  const pct = total > 0 ? Math.round((entered / total) * 100) : 0;

  return (
    <div className="stats-row">
      <div className="stat-card">
        <div className="stat-icon">🎟️</div>
        <div className="stat-val">{total}</div>
        <div className="stat-label">Tickets total</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-val green">{entered}</div>
        <div className="stat-label">Entrés</div>
        <div className="stat-change">{pct}% du total</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">⏳</div>
        <div className="stat-val yellow">{pending}</div>
        <div className="stat-label">En attente</div>
      </div>
    </div>
  );
}
