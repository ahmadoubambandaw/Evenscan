import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import SignIn from './auth/SignIn.jsx';

function Shell() {
  const { user, role, loading, logOut } = useAuth();

  if (loading) {
    return <div className="centered">Chargement…</div>;
  }

  if (!user) {
    return <SignIn />;
  }

  if (!role) {
    return <SignIn deniedReason="Accès refusé : votre compte Google n'est pas autorisé." />;
  }

  return (
    <div>
      <header className="app-header">
        <strong>
          Event<span>Scan</span>
        </strong>
        <div className="user-area">
          <span>
            {user.displayName || user.email} · {role === 'admin' ? 'Administrateur' : 'Agent scanner'}
          </span>
          <button onClick={logOut}>Déconnexion</button>
        </div>
      </header>
      <main className="app-main">
        <p>
          Connecté en tant que <strong>{role}</strong>. Le scanner QR et le
          dashboard arrivent aux étapes suivantes de la migration.
        </p>
      </main>
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
