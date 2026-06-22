import { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

const googleProvider = new GoogleAuthProvider();
const AuthContext = createContext(null);

async function resolveRole(email) {
  const lower = email.toLowerCase();
  try {
    const snap = await getDoc(doc(db, 'meta', 'access'));
    if (!snap.exists()) return null;
    const data = snap.data();
    if ((data.admins || []).includes(lower)) return 'admin';
    if ((data.agents || []).includes(lower)) return 'agent';
    return null;
  } catch {
    // Lecture refusée ou hors-ligne : on considère l'utilisateur non autorisé
    // plutôt que de planter l'écran de connexion.
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setRole(firebaseUser ? await resolveRole(firebaseUser.email) : null);
      setLoading(false);
    });
  }, []);

  async function signIn() {
    await signInWithPopup(auth, googleProvider);
  }

  async function logOut() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
