import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CATEGORY_LABEL = { vip: 'VIP', premium: 'Premium', standard: 'Standard' };
const STATUS_LABEL = { entered: 'Entré', pending: 'En attente', invalid: 'Invalide' };

function toRows(tickets) {
  return tickets.map((t) => ({
    Code: t.id,
    Nom: t.name,
    Email: t.email,
    Catégorie: CATEGORY_LABEL[t.category] || t.category,
    Statut: STATUS_LABEL[t.status] || t.status,
    "Heure d'entrée": t.entryTime || '',
  }));
}

export function exportTicketsToExcel(tickets, filename = 'tickets-eventscan.xlsx') {
  const ws = XLSX.utils.json_to_sheet(toRows(tickets));
  ws['!cols'] = [{ wch: 22 }, { wch: 22 }, { wch: 26 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
  XLSX.writeFile(wb, filename);
}

export function exportTicketsToPdf(tickets, filename = 'tickets-eventscan.pdf') {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('EventScan — Liste des tickets', 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Généré le ${new Date().toLocaleString('fr-FR')} — ${tickets.length} ticket(s)`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [['Code', 'Nom', 'Email', 'Catégorie', 'Statut', "Heure d'entrée"]],
    body: tickets.map((t) => [
      t.id,
      t.name,
      t.email,
      CATEGORY_LABEL[t.category] || t.category,
      STATUS_LABEL[t.status] || t.status,
      t.entryTime || '—',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [124, 58, 237] },
  });

  doc.save(filename);
}
