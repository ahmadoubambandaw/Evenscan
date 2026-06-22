import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

const ticketsCol = collection(db, 'tickets');

export function subscribeTickets(onChange, onError) {
  const q = query(ticketsCol, orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => ({ ...d.data(), firestoreId: d.id }))),
    onError,
  );
}

// Limité à status/entryTime : c'est le seul update qu'un agent scanner
// est autorisé à faire d'après firestore.rules.
export async function checkInTicket(ticketId, entryTime) {
  await updateDoc(doc(db, 'tickets', ticketId), { status: 'entered', entryTime });
}

export async function resetTicket(ticketId) {
  await updateDoc(doc(db, 'tickets', ticketId), { status: 'pending', entryTime: null });
}
