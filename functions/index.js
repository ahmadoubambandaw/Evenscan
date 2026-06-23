const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const QRCode = require('qrcode');

admin.initializeApp();
const db = admin.firestore();

// La clé API Resend vit uniquement ici (Cloud Functions secret), jamais
// dans le bundle client ni dans une variable VITE_*.
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');
const EMAIL_FROM = process.env.EMAIL_FROM || 'EventScan <onboarding@resend.dev>';

async function callerIsAdmin(authToken) {
  if (!authToken?.email) return false;
  const snap = await db.doc('meta/access').get();
  if (!snap.exists) return false;
  const admins = snap.data().admins || [];
  return admins.includes(authToken.email.toLowerCase());
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Génère le QR du ticket et envoie le billet par email côté serveur.
// Seuls les comptes listés dans meta/access.admins peuvent déclencher
// l'envoi (même vérification que les règles Firestore côté dashboard).
exports.sendTicketEmail = onCall({ secrets: [RESEND_API_KEY] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Connexion requise.');
  }
  if (!(await callerIsAdmin(request.auth.token))) {
    throw new HttpsError('permission-denied', 'Réservé aux administrateurs.');
  }

  const ticketId = request.data?.ticketId;
  if (!ticketId || typeof ticketId !== 'string') {
    throw new HttpsError('invalid-argument', 'ticketId manquant.');
  }

  const ticketRef = db.doc(`tickets/${ticketId}`);
  const ticketSnap = await ticketRef.get();
  if (!ticketSnap.exists) {
    throw new HttpsError('not-found', 'Ticket introuvable.');
  }

  const ticket = ticketSnap.data();
  if (!ticket.email || ticket.email === 'N/A') {
    throw new HttpsError('failed-precondition', "Ce ticket n'a pas d'adresse email.");
  }

  const qrBuffer = await QRCode.toBuffer(ticket.id, { width: 320, margin: 1 });

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2>Votre billet — ${escapeHtml(ticket.name)}</h2>
      <p>Catégorie : <strong>${escapeHtml(ticket.category)}</strong></p>
      <p>Présentez le QR code joint à cet email à l'entrée de l'événement.</p>
      <p style="color:#666;font-size:12px">Code billet : ${escapeHtml(ticket.id)}</p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY.value()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: ticket.email,
      subject: `Votre billet — ${ticket.name}`,
      html,
      attachments: [
        {
          filename: `${ticket.id}.png`,
          content: qrBuffer.toString('base64'),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new HttpsError('internal', `Échec de l'envoi (Resend) : ${errText}`);
  }

  await ticketRef.update({ emailSentAt: admin.firestore.FieldValue.serverTimestamp() });

  return { ok: true };
});
