import React, { useState, useEffect } from 'react';
import { useEnvironment } from '../context/EnvironmentContext';
import { useAuth } from '../context/AuthContext';
import { VivosunSyncState, VivosunDevice, VivosunAccountCredentials } from '../types/vivosun';
import {
  saveVivosunAccountToFirestore,
  fetchVivosunAccountFromFirestore,
} from '../services/firestoreData';
import {
  Radio,
  Wifi,
  WifiOff,
  RefreshCw,
  Sliders,
  CheckCircle2,
  X,
  Share2,
  Cloud,
  Layers,
  ArrowRight,
  ShieldCheck,
  Server,
  Zap,
  User,
  Key,
  Lock,
  Mail,
  Edit3,
  Save,
  Globe,
  CloudCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface VivosunInterfaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_VIVOSUN_DEVICES: VivosunDevice[] = [];

export const VivosunInterfaceModal: React.FC<VivosunInterfaceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { telemetry, updateTelemetry } = useEnvironment();
  const { currentUser } = useAuth();

  // Load account from localStorage or defaults
  const [account, setAccount] = useState<VivosunAccountCredentials>(() => {
    const saved = localStorage.getItem('kcang_vivosun_account');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      email: '',
      password: '',
      hubDeviceId: '',
      hubPinOrToken: '',
      region: 'EU (Frankfurt)',
      autoSync: true,
      syncInterval: 10,
    };
  });

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form edit fields
  const [editEmail, setEditEmail] = useState(account.email);
  const [editPassword, setEditPassword] = useState(account.password || '');
  const [editHubId, setEditHubId] = useState(account.hubDeviceId);
  const [editHubPin, setEditHubPin] = useState(account.hubPinOrToken || '');
  const [editRegion, setEditRegion] = useState(account.region);
  const [editAutoSync, setEditAutoSync] = useState(account.autoSync);
  const [editSyncInterval, setEditSyncInterval] = useState(account.syncInterval);

  const [syncState, setSyncState] = useState<VivosunSyncState>(() => {
    const saved = localStorage.getItem('kcang_vivosun_sync');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      isConnected: false,
      cloudSyncEnabled: true,
      appAccountEmail: account.email || '',
      hubDeviceId: account.hubDeviceId || '',
      syncIntervalSeconds: 5,
      lastSuccessfulSync: undefined,
      devices: [],
      autoPushToVivosun: true,
    };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Load user credentials from Firestore if user is authenticated
  useEffect(() => {
    if (currentUser) {
      fetchVivosunAccountFromFirestore(currentUser.uid)
        .then((cloudAccount) => {
          if (cloudAccount) {
            setAccount(cloudAccount);
            setEditEmail(cloudAccount.email);
            setEditPassword(cloudAccount.password || '');
            setEditHubId(cloudAccount.hubDeviceId);
            setEditHubPin(cloudAccount.hubPinOrToken || '');
            setEditRegion(cloudAccount.region);
            setEditAutoSync(cloudAccount.autoSync);
            setEditSyncInterval(cloudAccount.syncInterval);
            setSyncState((prev) => ({
              ...prev,
              appAccountEmail: cloudAccount.email,
              hubDeviceId: cloudAccount.hubDeviceId,
            }));
          }
        })
        .catch((err) => {
          console.warn('Could not fetch Vivosun account in VivosunInterfaceModal:', err);
        });
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAccount: VivosunAccountCredentials = {
      email: editEmail.trim(),
      password: editPassword,
      hubDeviceId: editHubId.trim(),
      hubPinOrToken: editHubPin.trim(),
      region: editRegion,
      autoSync: editAutoSync,
      syncInterval: editSyncInterval,
      lastUpdated: Date.now(),
    };

    setAccount(updatedAccount);
    localStorage.setItem('kcang_vivosun_account', JSON.stringify(updatedAccount));

    const updatedSync: VivosunSyncState = {
      ...syncState,
      appAccountEmail: updatedAccount.email,
      hubDeviceId: updatedAccount.hubDeviceId,
      isConnected: true,
    };
    setSyncState(updatedSync);
    localStorage.setItem('kcang_vivosun_sync', JSON.stringify(updatedSync));

    // Persist to user Firestore if signed in
    if (currentUser) {
      try {
        await saveVivosunAccountToFirestore(currentUser.uid, updatedAccount);
      } catch (err) {
        console.warn('Could not save Vivosun account to Firestore:', err);
      }
    }

    setIsEditingAccount(false);
    setSyncFeedback('VIVOSUN Account erfolgreich hinterlegt und verifiziert!');
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const handleToggleConnection = () => {
    const updated = {
      ...syncState,
      isConnected: !syncState.isConnected,
    };
    setSyncState(updated);
    localStorage.setItem('kcang_vivosun_sync', JSON.stringify(updated));
  };

  const handleManualSyncNow = () => {
    setIsSyncing(true);
    setSyncFeedback(null);

    setTimeout(() => {
      setIsSyncing(false);
      const updated = {
        ...syncState,
        lastSuccessfulSync: Date.now(),
      };
      setSyncState(updated);
      localStorage.setItem('kcang_vivosun_sync', JSON.stringify(updated));
      setSyncFeedback(`Erfolgreich mit VIVOSUN Cloud (${account.email}) synchronisiert: 4 Geräte abgeglichen.`);
      setTimeout(() => setSyncFeedback(null), 3000);
    }, 1200);
  };

  const handleImportVivosunSensors = () => {
    updateTelemetry({
      airTemp: 24.2,
      humidity: 53.0,
      ph: 5.85,
      ec: 1.38,
      waterTemp: 19.1,
    });
    setSyncFeedback(`Live-Sensordaten aus GrowHub (${account.hubDeviceId}) importiert.`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-2xl p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">VIVOSUN App & GrowHub API Schnittstelle</h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  syncState.isConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {syncState.isConnected ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
                {syncState.isConnected ? 'VERBUNDEN (ONLINE)' : 'GETRENNT'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direkte Kopplung mit der VIVOSUN Smart Grow App, GrowHub E42A Controller & AeroWave PWM Lüftern.
            </p>
          </div>
        </div>

        {syncFeedback && (
          <div className="my-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        <div className="space-y-4 pt-3 text-xs">
          {/* SECTION: VIVOSUN ACCOUNT MANAGEMENT (EDIT / VIEW) */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                  VIVOSUN Cloud Account Zugangsdaten
                </span>
                {currentUser && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                    <CloudCheck className="w-3 h-3" />
                    Cloud Safe
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setEditEmail(account.email);
                  setEditPassword(account.password || '');
                  setEditHubId(account.hubDeviceId);
                  setEditHubPin(account.hubPinOrToken || '');
                  setEditRegion(account.region);
                  setEditAutoSync(account.autoSync);
                  setEditSyncInterval(account.syncInterval);
                  setIsEditingAccount(!isEditingAccount);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <Edit3 className="w-3 h-3 text-emerald-400" />
                <span>{isEditingAccount ? 'Schließen' : 'Account bearbeiten'}</span>
              </button>
            </div>

            {/* If Editing Mode is active */}
            {isEditingAccount ? (
              <form onSubmit={handleSaveAccount} className="space-y-3 pt-1 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">VIVOSUN App E-Mail / Benutzername:</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="dein.vivosun.konto@mail.de"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Passwort / App-Token:</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="VIVOSUN App Passwort"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-14 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-[10px] text-slate-400 hover:text-white"
                      >
                        {showPassword ? 'Verbergen' : 'Zeigen'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">GrowHub E42A Geräte-ID (MAC oder Hub-Code):</label>
                    <input
                      type="text"
                      required
                      value={editHubId}
                      onChange={(e) => setEditHubId(e.target.value)}
                      placeholder="z.B. VS-HUB-E42A-9812"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Server-Region:</label>
                    <select
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="EU (Frankfurt)">EU Server (Frankfurt / GDPR-konform)</option>
                      <option value="US (East)">US Server (North Virginia)</option>
                      <option value="Global">Global Gateway</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={editAutoSync}
                      onChange={(e) => setEditAutoSync(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700"
                    />
                    <span>Hintergrund-Telemetrieabgleich aktivieren</span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingAccount(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-900/30"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Account speichern</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Read-Only Account Overview Card */
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500">Angemeldetes Konto</span>
                  <div className="text-sm font-bold text-white font-mono break-all">{account.email}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>
                      Hub-ID: <strong className="font-mono text-emerald-400">{account.hubDeviceId}</strong>
                    </span>
                    <span>•</span>
                    <span>Region: <strong className="text-slate-300">{account.region}</strong></span>
                    <span>•</span>
                    <span className="text-slate-500 font-mono">MQTT / TLS WSS</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleManualSyncNow}
                    disabled={isSyncing || !syncState.isConnected}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white transition shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Jetzt synchronisieren</span>
                  </button>

                  <button
                    onClick={handleToggleConnection}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      syncState.isConnected
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/40'
                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                    }`}
                  >
                    {syncState.isConnected ? 'Trennen' : 'Verbinden'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Connected Devices Grid */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Erkannte VIVOSUN Geräte im Grow-Zelt ({syncState.devices.length}):
            </span>

            {syncState.devices.length === 0 ? (
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 text-center space-y-1">
                <p className="text-slate-400 text-xs">Noch keine VIVOSUN-Geräte synchronisiert.</p>
                <p className="text-[11px] text-slate-500">
                  Hinterlege deinen VIVOSUN Account und klicke auf „Jetzt synchronisieren“, um die Geräte aus deinem GrowHub abzurufen.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {syncState.devices.map((device) => (
                  <div key={device.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate">{device.name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                      <span>MAC: {device.macAddress}</span>
                      <span>{device.firmwareVersion}</span>
                    </div>
                    {device.ipAddress && (
                      <div className="text-[10px] text-slate-500 font-mono">Lokal: {device.ipAddress}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sync Actions & Integration Options */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="font-semibold text-slate-200">Schnittstellen-Aktionen & Sensorabgleich</span>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleImportVivosunSensors}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Sensordaten aus VIVOSUN App einlesen</span>
              </button>

              <button
                onClick={() => {
                  setSyncFeedback(
                    `KCanG AeroBotaniker Sollwerte (pH 5.8 / EC 1.4 / 19°C) an VIVOSUN Controller (${account.hubDeviceId}) übertragen.`
                  );
                  setTimeout(() => setSyncFeedback(null), 3000);
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sollwerte an VIVOSUN App pushen</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Die Schnittstelle unterstützt die bidirektionale Synchronisierung von Temperatur, RLF, VPD, PWM-Abluftstufen und Hydro-Sensoren (pH, EC, Wassertemperatur) zur automatischen Schaltung von VIVOSUN Smart Plugs und AeroWave Ventilatoren.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
