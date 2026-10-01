import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  loginAnonymouslyAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync user profile to Firestore
  const syncUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || 'anonym@kcang-aerobotaniker.local',
          displayName: user.displayName || (user.isAnonymous ? 'Gast-Züchter (KCanG)' : 'Aero-Gärtner'),
          isAnonymous: user.isAnonymous,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      } else {
        await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      }
    } catch (e) {
      console.warn('Could not sync user document to Firestore:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        await syncUserProfile(cred.user);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      // In iframes, popup might sometimes be blocked or restricted; provide clear error
      setAuthError(err.message || 'Google Login fehlgeschlagen.');
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await syncUserProfile(cred.user);
      }
    } catch (err: any) {
      console.error('Email Login Error:', err);
      let msg = 'E-Mail oder Passwort ungültig.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Ungültige Anmeldedaten. Bitte prüfe E-Mail und Passwort.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Ungültiges E-Mail Format.';
      }
      setAuthError(msg);
      throw err;
    }
  };

  const signupWithEmail = async (email: string, pass: string, displayName: string) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        if (displayName) {
          await updateProfile(cred.user, { displayName });
        }
        await syncUserProfile(cred.user);
      }
    } catch (err: any) {
      console.error('Signup Error:', err);
      let msg = 'Registrierung fehlgeschlagen.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Diese E-Mail-Adresse ist bereits registriert.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Das Passwort sollte mindestens 6 Zeichen lang sein.';
      }
      setAuthError(msg);
      throw err;
    }
  };

  const loginAnonymouslyAsGuest = async () => {
    setAuthError(null);
    try {
      const cred = await signInAnonymously(auth);
      if (cred.user) {
        await syncUserProfile(cred.user);
      }
    } catch (err: any) {
      console.error('Anonymous Login Error:', err);
      setAuthError('Gastzugang konnte nicht gestartet werden.');
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Logout Error:', err);
      setAuthError(err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        loginAnonymouslyAsGuest,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
