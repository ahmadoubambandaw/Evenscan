import { useCallback, useEffect, useRef, useState } from 'react';
import Scanner from './Scanner.jsx';
import ManualEntry from './ManualEntry.jsx';
import ScanResult from './ScanResult.jsx';
import { subscribeTickets, checkInTicket } from '../tickets/ticketsApi.js';

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function categoryLabel(cat) {
  return { vip: '⭐ VIP', premium: '💎 Premium', standard: '🎫 Standard' }[cat] || cat;
}

export default function ScannerView() {
  const ticketsRef = useRef([]);
  const [dbError, setDbError] = useState(null);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({ ok: 0, fail: 0, total: 0 });
  const [log, setLog] = useState([]);

  useEffect(() => {
    return subscribeTickets(
      (list) => {
        ticketsRef.current = list;
        setDbError(null);
      },
      (err) => setDbError(err.message),
    );
  }, []);

  const pushLog = useCallback((type, name) => {
    setLog((l) => [{ type, name, time: getTime() }, ...l].slice(0, 20));
  }, []);

  // useCallback évite de recréer la fonction à chaque render (setResult /
  // setStats / setLog provoquent des re-renders) ce qui sinon annulerait et
  // relancerait la boucle RAF du scanner à chaque scan.
  const handleCode = useCallback(async (rawCode) => {
    const code = rawCode.trim().toUpperCase();
    setStats((s) => ({ ...s, total: s.total + 1 }));
    const ticket = ticketsRef.current.find((t) => t.id.toUpperCase() === code);

    if (!ticket) {
      setStats((s) => ({ ...s, fail: s.fail + 1 }));
      setResult({ type: 'error', name: 'Ticket invalide', code, detail: "Ce ticket n'existe pas." });
      pushLog('fail', `Inconnu — ${code}`);
      return;
    }

    if (ticket.status === 'entered') {
      setStats((s) => ({ ...s, fail: s.fail + 1 }));
      setResult({
        type: 'warning',
        name: ticket.name,
        code: ticket.id,
        detail: 'Ticket déjà utilisé !',
        time: `Entré à ${ticket.entryTime}`,
      });
      pushLog('dup', `${ticket.name} (doublon)`);
      return;
    }

    const time = getTime();
    try {
      await checkInTicket(ticket.id, time);
      setStats((s) => ({ ...s, ok: s.ok + 1 }));
      setResult({ type: 'success', name: ticket.name, code: ticket.id, detail: categoryLabel(ticket.category), time: `Heure d'entrée : ${time}` });
      pushLog('ok', ticket.name);
    } catch (e) {
      setResult({ type: 'error', name: 'Erreur', code: ticket.id, detail: e.message });
    }
  }, [pushLog]);

  return (
    <div className="scanner-layout">
      <div className="scanner-main">
        <Scanner onDecode={handleCode} />
        <ManualEntry onSubmit={handleCode} />
        {dbError && <p className="db-error">Erreur Firestore : {dbError}</p>}
      </div>
      <div className="scanner-side">
        <ScanResult result={result} />
        <div className="mini-stats">
          <div className="mini-stat">
            <div className="mini-stat-val green">{stats.ok}</div>
            <div className="mini-stat-label">Entrées</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-val red">{stats.fail}</div>
            <div className="mini-stat-label">Refusés</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-val violet">{stats.total}</div>
            <div className="mini-stat-label">Scans</div>
          </div>
        </div>
        <div className="scan-log">
          <div className="recent-label">Derniers scans</div>
          {log.length === 0 ? (
            <p className="scan-log-empty">Aucun scan pour l'instant</p>
          ) : (
            log.map((item, i) => (
              <div key={i} className={`scan-item ${item.type}`}>
                <span>{item.name}</span>
                <span className="scan-item-time">{item.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
