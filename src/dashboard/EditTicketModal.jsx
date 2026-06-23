import { useEffect, useState } from 'react';
import { updateTicketDetails } from '../tickets/ticketsApi.js';

export default function EditTicketModal({ ticket, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('standard');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ticket) {
      setName(ticket.name || '');
      setEmail(ticket.email === 'N/A' ? '' : ticket.email || '');
      setCategory(ticket.category || 'standard');
      setError(null);
    }
  }, [ticket]);

  if (!ticket) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateTicketDetails(ticket.id, { name: name.trim(), email: email.trim() || 'N/A', category });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>✎ Modifier {ticket.id}</h2>
        <form onSubmit={handleSubmit}>
          <label className="form-label">
            Nom
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="form-label">
            Email
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
            <button type="button" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Sauvegarde…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
