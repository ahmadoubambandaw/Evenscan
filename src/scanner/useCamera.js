import { useCallback, useEffect, useRef, useState } from 'react';

// iOS Safari et Chrome Android exigent un contexte sécurisé (HTTPS ou
// localhost) pour getUserMedia. En dehors de ça, le comportement est
// identique sur les deux plateformes une fois les contraintes "ideal"
// utilisées (et non "exact", qui échoue sur les appareils à une seule
// caméra).
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | starting | active | error
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStatus('idle');
  }, []);

  const start = useCallback(
    async (mode = facingMode) => {
      setStatus('starting');
      setError(null);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setFacingMode(mode);
        setStatus('active');
      } catch (e) {
        setError(e);
        setStatus('error');
      }
    },
    [facingMode],
  );

  const switchCamera = useCallback(() => {
    return start(facingMode === 'environment' ? 'user' : 'environment');
  }, [facingMode, start]);

  useEffect(() => stop, [stop]);

  return { videoRef, status, error, start, stop, switchCamera, facingMode };
}
