import { useState } from 'react';

const CATEGORY_LABEL = { vip: 'VIP', premium: 'PREMIUM', standard: 'STANDARD' };
const STATUS_LABEL = { entered: '● Entré', pending: '○ En attente', invalid: '✕ Invalide' };

export default function TicketsTable({ tickets, onReset, onDelete, onEdit, onShowQR }) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? tickets.filter((t) =>
        [t.name, t.id, t.category].some((field) => field?.toLowerCase().includes(search.toLowerCase())),
      )
    : tickets;

  return (
    <div className="section-card">
      <div className="section-header">
        <h3>
          Liste des tickets <span className="live-dot">● Temps réel</span>
        </h3>
        <input
          className="search-input"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="table-wrap">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Invité</th>
              <th>Catégorie</th>
              <th>Statut</th>
              <th>Heure d'entrée</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-row">
                  Aucun ticket — ajoutez-en un !
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id}>
                  <td className="ticket-code">{t.id}</td>
                  <td>
                    <div className="ticket-name">{t.name}</div>
                    <div className="ticket-email">{t.email}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${t.category}`}>{CATEGORY_LABEL[t.category] || t.category}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${t.status}`}>{STATUS_LABEL[t.status] || t.status}</span>
                  </td>
                  <td className="entry-time">{t.entryTime || '—'}</td>
                  <td className="actions">
                    <button onClick={() => onShowQR(t)}>QR</button>
                    <button onClick={() => onEdit(t)}>✎</button>
                    <button onClick={() => onReset(t.id)}>Reset</button>
                    <button className="danger" onClick={() => onDelete(t.id)}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
