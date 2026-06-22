import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
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

export async function createTicket({ id, name, email, category }) {
  await setDoc(doc(db, 'tickets', id), {
    id,
    name,
    email: email || 'N/A',
    category,
    status: 'pending',
    entryTime: null,
    createdAt: serverTimestamp(),
  });
}

export async function updateTicketDetails(ticketId, { name, email, category }) {
  await updateDoc(doc(db, 'tickets', ticketId), { name, email, category });
}

// Limité à status/entryTime : c'est le seul update qu'un agent scanner
// est autorisé à faire d'après firestore.rules (les admins peuvent aussi
// s'en servir depuis le dashboard).
export async function checkInTicket(ticketId, entryTime) {
  await updateDoc(doc(db, 'tickets', ticketId), { status: 'entered', entryTime });
}

export async function resetTicket(ticketId) {
  await updateDoc(doc(db, 'tickets', ticketId), { status: 'pending', entryTime: null });
}

export async function deleteTicket(ticketId) {
  await deleteDoc(doc(db, 'tickets', ticketId));
}
