import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRPreview({ ticketId, ticketName }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    let active = true;
    setDataUrl(null);
    QRCode.toDataURL(ticketId, { width: 220, margin: 1 }).then((url) => {
      if (active) setDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [ticketId]);

  function download() {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${ticketId}-QR.png`;
    a.click();
  }

  return (
    <div className="qr-preview">
      {dataUrl ? <img src={dataUrl} alt={`QR ${ticketId}`} width={180} height={180} /> : <p>Génération du QR…</p>}
      <p className="qr-ticket-info">
        {ticketId} — {ticketName}
      </p>
      <button type="button" onClick={download} disabled={!dataUrl}>
        ⬇ Télécharger QR
      </button>
    </div>
  );
}
