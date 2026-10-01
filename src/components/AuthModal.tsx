import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { VivosunAccountCredentials } from '../types/vivosun';
import {
  saveVivosunAccountToFirestore,
  fetchVivosunAccountFromFirestore,
} from '../services/firestoreData';
import {
  User,
  LogIn,
  LogOut,
  UserPlus,
  Shield,
  CheckCircle,
  X,
  Mail,
  Lock,
  Sparkles,
  CloudCheck,
  AlertCircle,
  Radio,
  Edit3,
  Save,
  Check,
  Zap,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    loginAnonymouslyAsGuest,
    logout,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // VIVOSUN Account in User Profile
  const [vivosunEmail, setVivosunEmail] = useState('');
  const [vivosunHubId, setVivosunHubId] = useState('');
  const [vivosunPassword, setVivosunPassword] = useState('');
  const [isEditingVivosun, setIsEditingVivosun] = useState(false);
  const [vivosunSavedMsg, setVivosunSavedMsg] = useState(false);

  // Load Vivosun account
  useEffect(() => {
    if (currentUser) {
      fetchVivosunAccountFromFirestore(currentUser.uid)
        .then((cred) => {
          if (cred) {
            setVivosunEmail(cred.email);
            setVivosunHubId(cred.hubDeviceId);
            setVivosunPassword(cred.password || '');
          } else {
            const local = localStorage.getItem('kcang_vivosun_account');
            if (local) {
              try {
                const parsed = JSON.parse(local);
                setVivosunEmail(parsed.email || '');
                setVivosunHubId(parsed.hubDeviceId || '');
                setVivosunPassword(parsed.password || '');
              } catch (e) {}
            }
          }
        })
        .catch((err) => {
          console.warn('Could not fetch vivosun account in AuthModal:', err);
        });
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearAuthError();

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, displayName);
      }
      onClose();
    } catch (err) {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    clearAuthError();
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsSubmitting(true);
    clearAuthError();
    try {
      await loginAnonymouslyAsGuest();
      onClose();
    } catch (err) {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveVivosunAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCredentials: VivosunAccountCredentials = {
      email: vivosunEmail.trim(),
      password: vivosunPassword,
      hubDeviceId: vivosunHubId.trim() || 'VS-HUB-E42A-9812',
      region: 'EU (Frankfurt)',
      autoSync: true,
      syncInterval: 10,
      lastUpdated: Date.now(),
    };

    localStorage.setItem('kcang_vivosun_account', JSON.stringify(newCredentials));

    // Also update active sync state in localStorage
    const savedSync = localStorage.getItem('kcang_vivosun_sync');
    if (savedSync) {
      try {
        const syncObj = JSON.parse(savedSync);
        localStorage.setItem(
          'kcang_vivosun_sync',
          JSON.stringify({
            ...syncObj,
            appAccountEmail: newCredentials.email,
            hubDeviceId: newCredentials.hubDeviceId,
          })
        );
      } catch (e) {}
    }

    if (currentUser) {
      try {
        await saveVivosunAccountToFirestore(currentUser.uid, newCredentials);
      } catch (err) {
        console.warn('Error saving Vivosun credentials in Firestore:', err);
      }
    }

    setIsEditingVivosun(false);
    setVivosunSavedMsg(true);
    setTimeout(() => setVivosunSavedMsg(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {currentUser ? (
          // Logged in state inside modal with VIVOSUN Account configuration
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <User className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Gärtner-Profil & Konten</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.displayName || (currentUser.isAnonymous ? 'Gast-Account (KCanG)' : 'Aero-Gärtner')}
              </p>
              <p className="text-xs font-mono text-emerald-400 mt-1">{currentUser.email || 'Anonymer Cloud-Speicher'}</p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CloudCheck className="w-4 h-4" />
                <span>Cloud-Speicher aktiv (Firebase Firestore)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Deine Wurzel-Tagebücher, 24h-Sensorhistorien und erstellten botanischen Gutachten werden sicher in deinem Profil gespeichert.
              </p>
            </div>

            {/* VIVOSUN ACCOUNT CARD IN USER PROFILE */}
            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3.5 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white">VIVOSUN App Konto</span>
                </div>
                <button
                  onClick={() => setIsEditingVivosun(!isEditingVivosun)}
                  className="text-emerald-400 hover:text-emerald-300 font-medium text-[11px] flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingVivosun ? 'Abbrechen' : 'Hinterlegen / Bearbeiten'}</span>
                </button>
              </div>

              {vivosunSavedMsg && (
                <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>VIVOSUN Zugangsdaten gespeichert!</span>
                </div>
              )}

              {isEditingVivosun ? (
                <form onSubmit={handleSaveVivosunAccount} className="space-y-2 pt-1 animate-in fade-in">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">VIVOSUN E-Mail / Benutzername:</label>
                    <input
                      type="email"
                      required
                      value={vivosunEmail}
                      onChange={(e) => setVivosunEmail(e.target.value)}
                      placeholder="vivosun.grower@beispiel.de"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Passwort / API-Token:</label>
                    <input
                      type="password"
                      value={vivosunPassword}
                      onChange={(e) => setVivosunPassword(e.target.value)}
                      placeholder="VIVOSUN App Passwort"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">GrowHub E42A Geräte-ID:</label>
                    <input
                      type="text"
                      required
                      value={vivosunHubId}
                      onChange={(e) => setVivosunHubId(e.target.value)}
                      placeholder="z.B. VS-HUB-E42A-9812"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end pt-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingVivosun(false)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-[11px]"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-sm"
                    >
                      <Save className="w-3 h-3" />
                      <span>Speichern</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>
                    Konto: <strong className="text-white font-mono">{vivosunEmail || 'Kein Konto hinterlegt'}</strong>
                  </div>
                  <div>
                    GrowHub ID: <strong className="text-emerald-400 font-mono">{vivosunHubId || 'Standard-Hub'}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Zurück zur App
              </button>
              <button
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        ) : (
          // Log in / Sign up form
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center mb-2">
                <LogIn className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {mode === 'login' ? 'Benutzer-Login & Cloud-Speicher' : 'Neues Gärtner-Konto erstellen'}
              </h3>
              <p className="text-xs text-slate-400">
                Speichere deine Aeroponik-Telemetriedaten, VIVOSUN-Zugangsdaten und KCanG-Gutachten dauerhaft.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Google Quick Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-semibold flex items-center justify-center gap-2.5 transition shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Mit Google anmelden</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                oder mit E-Mail
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {mode === 'signup' && (
                <div>
                  <label className="block text-slate-400 mb-1">Benutzername / Züchterkürzel:</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="z.B. AeroGrower_NRW"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">E-Mail-Adresse:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine.email@beispiel.de"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Passwort:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <span>Bitte warten...</span>
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Anmelden</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Konto erstellen</span>
                  </>
                )}
              </button>
            </form>

            {/* Anonymous guest sign in and toggle mode */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2 text-center text-xs">
              <button
                onClick={() => {
                  clearAuthError();
                  setMode(mode === 'login' ? 'signup' : 'login');
                }}
                className="text-emerald-400 hover:text-emerald-300 font-medium transition"
              >
                {mode === 'login' ? 'Noch kein Konto? Jetzt registrieren' : 'Bereits registriert? Hier anmelden'}
              </button>

              <button
                onClick={handleGuestSignIn}
                disabled={isSubmitting}
                className="text-slate-500 hover:text-slate-300 text-[11px] transition"
              >
                Ohne Registrierung als Gast fortfahren (anonyme Session)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
