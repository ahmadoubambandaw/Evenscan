import { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import SignIn from './auth/SignIn.jsx';
import ScannerView from './scanner/ScannerView.jsx';
import DashboardView from './dashboard/DashboardView.jsx';

function Shell() {
  const { user, role, loading, logOut } = useAuth();
  const [view, setView] = useState('scanner');

  if (loading) {
    return <div className="centered">Chargement…</div>;
  }

  if (!user) {
    return <SignIn />;
  }

  if (!role) {
    return <SignIn deniedReason="Accès refusé : votre compte Google n'est pas autorisé." />;
  }

  const isAdmin = role === 'admin';

  return (
    <div>
      <header className="app-header">
        <strong>
          Event<span>Scan</span>
        </strong>
        <nav className="nav-tabs">
          <button className={view === 'scanner' ? 'active' : ''} onClick={() => setView('scanner')}>
            📷 Scanner
          </button>
          {isAdmin && (
            <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
              📊 Dashboard
            </button>
          )}
        </nav>
        <div className="user-area">
          <span>
            {user.displayName || user.email} · {isAdmin ? 'Administrateur' : 'Agent scanner'}
          </span>
          <button onClick={logOut}>Déconnexion</button>
        </div>
      </header>
      <main className="app-main">{view === 'dashboard' && isAdmin ? <DashboardView /> : <ScannerView />}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
