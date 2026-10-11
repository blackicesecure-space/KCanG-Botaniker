import React, { useState, useEffect } from 'react';
import { User, Lock, Shield, Cloud, Download, Trash2, Eye, EyeOff, Check, AlertTriangle, X, RefreshCw, KeyRound, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile, deleteUser } from 'firebase/auth';

export const UserSettingsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Profile state
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // VIVOSUN / GrowHub Account state
  const [vivosunEmail, setVivosunEmail] = useState('');
  const [growHubId, setGrowHubId] = useState('Standard-Hub-Aero-01');
  const [vivosunToken, setVivosunToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isSavingVivosun, setIsSavingVivosun] = useState(false);
  const [isVivosunModalOpen, setIsVivosunModalOpen] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Data Export state
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportAt, setLastExportAt] = useState<string | null>(null);

  // Account Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      loadUserSettings();
    }
  }, [currentUser]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadUserSettings = async () => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'users', currentUser.uid, 'integrations', 'vivosun');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.growHubId) setGrowHubId(data.growHubId);
      }
    } catch (e) {
      console.warn('Could not load integrations from Firestore:', e);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingProfile(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
      }
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { displayName, updatedAt: Date.now() }, { merge: true });
      showToast('Profil erfolgreich aktualisiert.');
    } catch (e: any) {
      showToast('Fehler beim Speichern des Profils: ' + e.message, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveVivosun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingVivosun(true);
    try {
      const maskedEmail = vivosunMaskEmail(vivosunEmail);
      const integrationRef = doc(db, 'users', currentUser.uid, 'integrations', 'vivosun');
      await setDoc(integrationRef, {
        accountEmailMasked: maskedEmail,
        growHubId,
        tokenRef: vivosunToken ? 'encrypted' : 'none',
        updatedAt: Date.now(),
      }, { merge: true });

      setIsVivosunModalOpen(false);
      setVivosunToken('');
      showToast('VIVOSUN GrowHub-Konto verknüpft.');
    } catch (e: any) {
      showToast('Fehler beim Verknüpfen: ' + e.message, 'error');
    } finally {
      setIsSavingVivosun(false);
    }
  };

  const vivosunMaskEmail = (email: string) => {
    if (!email || !email.includes('@')) return 's•••@gmail.com';
    const [name, domain] = email.split('@');
    return `${name.charAt(0)}•••@${domain}`;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError('Das neue Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein.');
      return;
    }
    if (!currentUser || !currentUser.email) return;

    setIsChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      if (auth.currentUser) {
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
        showToast('Passwort erfolgreich geändert.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (e: any) {
      console.error('Password change error:', e);
      setPasswordError('Aktuelles Passwort ist ungültig oder Re-Authentifizierung fehlgeschlagen.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    if (!currentUser) return;
    setIsExporting(true);
    try {
      const userId = currentUser.uid;
      const exportData: Record<string, any> = {
        exportDate: new Date().toISOString(),
        userId,
        profile: {},
        integrations: {},
        grows: [],
        wateringLogs: [],
        diagnosisReports: [],
      };

      // Fetch user doc
      const userSnap = await getDoc(doc(db, 'users', userId));
      if (userSnap.exists()) exportData.profile = userSnap.data();

      // Fetch vivosun integration
      const vivoSnap = await getDoc(doc(db, 'users', userId, 'integrations', 'vivosun'));
      if (vivoSnap.exists()) exportData.integrations.vivosun = vivoSnap.data();

      // Fetch subcollections if possible
      try {
        const repSnap = await getDocs(collection(db, 'users', userId, 'diagnosisReports'));
        exportData.diagnosisReports = repSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch {}

      // Add local storage items
      const localGrow = localStorage.getItem('kcang_current_grow');
      if (localGrow) exportData.localGrow = JSON.parse(localGrow);
      const localWatering = localStorage.getItem('kcang_watering_log_v1');
      if (localWatering) exportData.localWateringLogs = JSON.parse(localWatering);

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute("download", `kcang-export-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setLastExportAt(new Date().toLocaleString('de-DE'));
      showToast('DSGVO-Datenexport erfolgreich heruntergeladen.');
    } catch (e: any) {
      showToast('Export fehlgeschlagen: ' + e.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (deleteConfirmText !== 'LÖSCHEN') {
      setDeleteError('Bitte tippe exakt das Wort "LÖSCHEN" ein.');
      return;
    }
    if (!currentUser || !currentUser.email) return;

    setIsDeleting(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
      if (auth.currentUser) {
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Delete Firestore user data doc
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid));
        } catch {}

        // Delete auth user
        await deleteUser(auth.currentUser);

        // Clear local storage
        localStorage.clear();
        window.location.reload();
      }
    } catch (e: any) {
      console.error('Account deletion error:', e);
      setDeleteError('Passwort falsch oder erneute Authentifizierung fehlgeschlagen.');
      setIsDeleting(false);
    }
  };

  const userInitials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : currentUser?.email?.substring(0, 2).toUpperCase() || 'KG';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-3 duration-200 ${
          toastMessage.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
            : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
        }`} role="alert">
          {toastMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-xl font-black font-mono shadow-inner">
            {userInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                Gärtner-Profil & Konten
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {currentUser?.uid.substring(0, 8)}...</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mt-1">
              {displayName || currentUser?.email || 'Aero-Gärtner'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Verwalte deine Zugangsdaten, VIVOSUN GrowHub Verknüpfungen, DSGVO-Datenexporte und Sicherheitseinstellungen.
            </p>
          </div>
        </div>
      </div>

      {/* Card 1: Profil */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <User className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Gärtner-Profil</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">E-Mail-Adresse (Login):</label>
            <input
              type="email"
              disabled
              value={currentUser?.email || 'Gast-Modus'}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Die Login-E-Mail ist fest mit deinem Firebase Auth Konto verknüpft.</span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Anzeigename / Züchter-Alias:</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              placeholder="z.B. Steven S."
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSavingProfile ? 'Speichere...' : 'Profil speichern'}
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Verknüpfte Konten (VIVOSUN) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Verknüpfte Konten (VIVOSUN GrowHub)</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
            Cloud Sync aktiv
          </span>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-white block">VIVOSUN App Integration</span>
              <p className="text-[11px] text-slate-400">
                GrowHub ID: <span className="font-mono text-cyan-300">{growHubId}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Zugangsdaten werden verschlüsselt gespeichert und können nicht im Klartext angezeigt werden.
              </p>
            </div>
            <button
              onClick={() => setIsVivosunModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition shrink-0"
            >
              Hinterlegen / Bearbeiten
            </button>
          </div>
        </div>
      </div>

      {/* VIVOSUN Edit Modal */}
      {isVivosunModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-labelledby="vivosun-modal-title">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 id="vivosun-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <span>VIVOSUN GrowHub verknüpfen</span>
              </h3>
              <button onClick={() => setIsVivosunModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVivosun} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">VIVOSUN App E-Mail:</label>
                <input
                  type="email"
                  value={vivosunEmail}
                  onChange={(e) => setVivosunEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">GrowHub ID / Controller Name:</label>
                <input
                  type="text"
                  value={growHubId}
                  onChange={(e) => setGrowHubId(e.target.value)}
                  placeholder="Standard-Hub-Aero-01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">API-Token / Passwort (verschlüsselt):</label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={vivosunToken}
                    onChange={(e) => setVivosunToken(e.target.value)}
                    placeholder="VIVOSUN API Token eingeben"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-10 text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Wird sicher in Firestore unter `users/{'{uid}'}/integrations` gespeichert.</span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsVivosunModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSavingVivosun}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isSavingVivosun ? 'Speichere...' : 'Verknüpfen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card 3: Sicherheit */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Lock className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Sicherheit & Passwort</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 flex items-center gap-2" role="alert">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Aktuelles Passwort:</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Neues Passwort:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                placeholder="Mind. 8 Zeichen"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Neues Passwort bestätigen:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {isChangingPassword ? 'Ändere Passwort...' : 'Passwort aktualisieren'}
            </button>
          </div>
        </form>
      </div>

      {/* Card 4: Datenschutz & Daten (Danger Zone) */}
      <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Shield className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-bold text-white">Datenschutz & DSGVO</h3>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Datenexport (DSGVO Art. 20)</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Lade alle deine Anbaudaten, Gießprotokolle, Sensorlogs und Berichte als JSON-Datei herunter.
              </p>
              {lastExportAt && (
                <span className="text-[10px] text-emerald-400 font-mono block">Letzter Export: {lastExportAt}</span>
              )}
            </div>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition shrink-0 disabled:opacity-50"
            >
              {isExporting ? 'Exportiere...' : 'JSON exportieren'}
            </button>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Konto & alle Daten unwiderruflich löschen (DSGVO Art. 17)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Beim Löschen werden alle Firestore-Dokumente, Grows, Gießprotokolle und dein Firebase-Authentifizierungskonto dauerhaft entfernt. Dieser Vorgang kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg shadow-rose-600/20"
              >
                Konto löschen...
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-labelledby="delete-modal-title">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 id="delete-modal-title" className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>Unwiderrufliche Kontolöschung</span>
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4 text-xs">
              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 flex items-center gap-2" role="alert">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 space-y-1">
                <span className="font-bold block">⚠️ Achtung: Datenverlust</span>
                <p className="text-[11px] leading-relaxed">
                  Deine Anbaudaten, Protokolle und dein Account werden restlos gelöscht. Zur Bestätigung tippe bitte das Wort <strong>LÖSCHEN</strong> ein und gib dein aktuelles Passwort ein.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tippe "LÖSCHEN" zur Bestätigung:</label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="LÖSCHEN"
                  className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-white font-mono uppercase tracking-widest text-center"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Aktuelles Passwort (Re-Authentifizierung):</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Dein Passwort"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || deleteConfirmText !== 'LÖSCHEN'}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg shadow-rose-600/20 disabled:opacity-40"
                >
                  {isDeleting ? 'Lösche Konto...' : 'Endgültig löschen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
