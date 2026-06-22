import { useEffect, useState } from 'react';
import { subscribeTickets, deleteTicket, resetTicket } from '../tickets/ticketsApi.js';
import StatsRow from './StatsRow.jsx';
import TicketsTable from './TicketsTable.jsx';
import AddTicketModal from './AddTicketModal.jsx';
import EditTicketModal from './EditTicketModal.jsx';
import QRModal from './QRModal.jsx';

export default function DashboardView() {
  const [tickets, setTickets] = useState([]);
  const [dbError, setDbError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [qrTicket, setQrTicket] = useState(null);

  useEffect(() => subscribeTickets(setTickets, (e) => setDbError(e.message)), []);

  const existingIds = new Set(tickets.map((t) => t.id));

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce ticket définitivement ?')) return;
    await deleteTicket(id);
  }

  async function handleReset(id) {
    await resetTicket(id);
  }

  return (
    <div className="dash-layout">
      <div className="dash-top">
        <h2>Tableau de bord</h2>
        <button className="btn-add" onClick={() => setAddOpen(true)}>
          + Ajouter un ticket
        </button>
      </div>
      {dbError && <p className="db-error">Erreur Firestore : {dbError}</p>}
      <StatsRow tickets={tickets} />
      <TicketsTable
        tickets={tickets}
        onReset={handleReset}
        onDelete={handleDelete}
        onEdit={setEditTicket}
        onShowQR={setQrTicket}
      />
      <AddTicketModal open={addOpen} onClose={() => setAddOpen(false)} existingIds={existingIds} />
      <EditTicketModal ticket={editTicket} onClose={() => setEditTicket(null)} />
      <QRModal ticket={qrTicket} onClose={() => setQrTicket(null)} />
    </div>
  );
}
