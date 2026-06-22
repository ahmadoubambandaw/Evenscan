import QRPreview from './QRPreview.jsx';

export default function QRModal({ ticket, onClose }) {
  if (!ticket) return null;
  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>QR — {ticket.id}</h2>
        <QRPreview ticketId={ticket.id} ticketName={ticket.name} />
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
