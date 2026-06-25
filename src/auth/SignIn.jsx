import { useState } from 'react';
import { useAuth } from './AuthContext.jsx';

export default function SignIn({ deniedReason }) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      await signIn();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>
          Event<span>Scan</span>
        </h1>
        <p className="tagline">Plateforme de contrôle d'accès événementiel</p>
        <button className="google-btn" onClick={handleSignIn} disabled={loading}>
          {loading ? 'Connexion…' : 'Continuer avec Google'}
        </button>
        {deniedReason && (
          <p className="auth-error">
            {deniedReason} Contactez un administrateur pour être ajouté.
          </p>
        )}
      </div>
    </div>
  );
}
