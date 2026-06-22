export default function ScanResult({ result }) {
  if (!result) {
    return (
      <div className="scan-result idle">
        <div className="scan-result-icon">🎫</div>
        <p>En attente d'un scan</p>
      </div>
    );
  }

  const icon = { success: '✅', error: '❌', warning: '⚠️' }[result.type] || '🎫';

  return (
    <div className={`scan-result ${result.type}`}>
      <div className="scan-result-icon">{icon}</div>
      <div className="scan-result-name">{result.name}</div>
      {result.code && <div className="scan-result-code">{result.code}</div>}
      <div className="scan-result-detail">{result.detail}</div>
      {result.time && <div className="scan-result-time">{result.time}</div>}
    </div>
  );
}
