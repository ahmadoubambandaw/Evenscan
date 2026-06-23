import { useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useCamera } from './useCamera.js';

const SCAN_COOLDOWN_MS = 2500;

export default function Scanner({ onDecode }) {
  const { videoRef, status, error, start, stop, switchCamera } = useCamera();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const cooldownRef = useRef(false);

  if (!canvasRef.current && typeof document !== 'undefined') {
    canvasRef.current = document.createElement('canvas');
  }

  useEffect(() => {
    if (status !== 'active') return undefined;
    let active = true;

    function tick() {
      if (!active) return;
      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
        if (code?.data && !cooldownRef.current) {
          cooldownRef.current = true;
          onDecode(code.data);
          setTimeout(() => {
            cooldownRef.current = false;
          }, SCAN_COOLDOWN_MS);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [status, videoRef, onDecode]);

  return (
    <div className="scanner-card">
      <div className="scanner-area">
        {/* playsInline + muted sont obligatoires sur iOS Safari : sans eux
            la vidéo passe en plein écran natif et l'autoplay est bloqué. */}
        <video ref={videoRef} className="scanner-video" playsInline autoPlay muted />
        {status !== 'active' && (
          <div className="scanner-placeholder">
            {status === 'error' ? <ScannerError error={error} /> : <p>Caméra arrêtée</p>}
          </div>
        )}
      </div>
      <div className="scanner-controls">
        {status === 'active' ? (
          <>
            <button onClick={stop}>⏹ Arrêter</button>
            <button onClick={switchCamera}>🔄 Changer de caméra</button>
          </>
        ) : (
          <button onClick={() => start()} disabled={status === 'starting'}>
            ▶ Démarrer la caméra
          </button>
        )}
      </div>
    </div>
  );
}

function ScannerError({ error }) {
  const isPermission = error?.name === 'NotAllowedError';
  const isNotFound = error?.name === 'NotFoundError';
  return (
    <div className="scanner-error">
      <p>Caméra non accessible.</p>
      {isPermission && (
        <p>
          Autorisez l'accès à la caméra : sur iPhone, Réglages → Safari →
          Caméra (ou l'icône "aA" dans la barre d'adresse → Réglages du
          site) ; sur Android, l'icône 🔒 dans la barre d'adresse →
          Autorisations → Caméra.
        </p>
      )}
      {isNotFound && <p>Aucune caméra détectée sur cet appareil.</p>}
      <p>En attendant, utilisez la saisie manuelle ci-dessous.</p>
    </div>
  );
}
