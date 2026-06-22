const CURRENT_YEAR = new Date().getFullYear();
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans 0/O ni 1/I, ambigus à l'écran

function randomCode(length) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join('');
}

// Génère un identifiant lisible et vérifie son unicité contre les tickets
// déjà chargés (contrairement à l'ancienne version qui utilisait
// `tickets.length + 1`, sujette à collision en cas de créations
// concurrentes).
export function generateTicketId(name, existingIds = new Set()) {
  const initials = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4).padEnd(4, 'X');
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const id = `TK-${CURRENT_YEAR}-${randomCode(4)}-${initials}`;
    if (!existingIds.has(id)) return id;
  }
  throw new Error("Impossible de générer un identifiant de ticket unique, réessayez.");
}
