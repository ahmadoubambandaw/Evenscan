import { useState } from 'react';
import { createTicket } from '../tickets/ticketsApi.js';
import { generateTicketId } from '../tickets/generateId.js';
import QRPreview from './QRPreview.jsx';

export default function AddTicketModal({ open, onClose, existingIds }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('standard');
  const [creating, setCreating] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [error, setError] = useState(null);

  function reset() {
    setName('');
    setEmail('');
    setCategory('standard');
    setCreatedTicket(null);
    setError(null);
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
      await createTicket({ id, name: name.trim(), email: email.trim(), category });
      setCreatedTicket({ id, name: name.trim(), category });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  if (!open) return null;

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
