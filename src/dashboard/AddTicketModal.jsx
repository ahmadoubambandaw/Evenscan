import { useState } from 'react';
import { createTicket, sendTicketEmail } from '../tickets/ticketsApi.js';
import { generateTicketId } from '../tickets/generateId.js';
import QRPreview from './QRPreview.jsx';

export default function AddTicketModal({ open, onClose, existingIds }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('standard');
  const [creating, setCreating] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  function reset() {
    setName('');
    setEmail('');
    setCategory('standard');
    setCreatedTicket(null);
    setError(null);
    setSending(false);
    setSendStatus(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const id = generateTicketId(name, existingIds);
      const cleanEmail = email.trim();
      await createTicket({ id, name: name.trim(), email: cleanEmail, category });
      setCreatedTicket({ id, name: name.trim(), category, email: cleanEmail });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleSendEmail() {
    if (!createdTicket) return;
    setSending(true);
    setSendStatus(null);
    try {
      await sendTicketEmail(createdTicket.id);
      setSendStatus({ ok: true, message: 'Email envoyé.' });
    } catch (err) {
      setSendStatus({ ok: false, message: err.message });
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  const hasEmail = Boolean(createdTicket?.email) && createdTicket.email !== 'N/A';

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal">
        <h2>➕ Nouveau ticket</h2>
        {!createdTicket ? (
          <form onSubmit={handleSubmit}>
            <label className="form-label">
              Nom de l'invité
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom Nom" />
            </label>
            <label className="form-label">
              Email
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
              />
            </label>
            <label className="form-label">
              Catégorie
              <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
            </label>
            {error && <p className="form-error">{error}</p>}
            <div className="modal-actions">
              <button type="button" onClick={handleClose}>
                Fermer
              </button>
              <button type="submit" disabled={creating}>
                {creating ? 'Création…' : 'Créer le ticket'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <QRPreview ticketId={createdTicket.id} ticketName={createdTicket.name} />
            {hasEmail ? (
              <div className="send-email-block">
                <button type="button" onClick={handleSendEmail} disabled={sending}>
                  {sending ? 'Envoi…' : '✉ Envoyer le billet par email'}
                </button>
                {sendStatus && (
                  <p className={sendStatus.ok ? 'form-success' : 'form-error'}>{sendStatus.message}</p>
                )}
              </div>
            ) : (
              <p className="form-hint">Aucun email renseigné — billet à transmettre manuellement.</p>
            )}
            <div className="modal-actions">
              <button type="button" onClick={handleClose}>
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
