import React, { useState } from 'react';
import { useEnvironment } from '../context/EnvironmentContext';
import { useAuth } from '../context/AuthContext';
import { useCultivationSystem } from '../context/CultivationSystemContext';
import { useGrowConfig } from '../config/GrowConfigContext';
import { AuthModal } from './AuthModal';
import { SystemSelectionModal } from './SystemSelectionModal';
import {
  Activity,
  Sprout,
  FileText,
  Calculator,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  Sun,
  Moon,
  Microscope,
  Eye,
  User,
  LogIn,
  CloudCheck,
  Wind,
  Layers,
  RefreshCw,
} from 'lucide-react';

export type ActiveTab = 'mygrow' | 'diagnosis' | 'environment' | 'root-log' | 'trichome-log' | 'report' | 'calculators' | 'knowledge';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasReport: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, hasReport }) => {
  const { alerts, settings, telemetry } = useEnvironment();
  const { currentUser } = useAuth();
  const { method, resetSelection } = useCultivationSystem();
  const { config } = useGrowConfig();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [systemModalOpen, setSystemModalOpen] = useState(false);
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  const isSoil = method === 'soil';

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Logo & Botanical Identity */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
                  isSoil
                    ? 'bg-gradient-to-br from-amber-600 to-amber-900 shadow-amber-950/40'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-900/30'
                }`}
              >
                {isSoil ? <Sprout className="w-6 h-6 text-amber-200" /> : <Wind className="w-6 h-6 text-emerald-100" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                    <span>KCanG {isSoil ? 'BodenBotaniker' : 'AeroBotaniker'}</span>
                  </h1>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                      isSoil
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {isSoil ? 'Soil / Erde' : 'Aeroponik'}
                    {' • '}
                    {config.irrigation === 'manual' ? '🖐️ Manuell' : '⏱️ Auto'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {isSoil
                    ? 'Cannabis sativa L. Bodenkultur, Living Soil & Substrat-Diagnose (KCanG)'
                    : 'Cannabis sativa L. Aeroponik-Diagnose & Umweltregelung (KCanG)'}
                </p>
              </div>
            </div>

            {/* Badges / System Switcher / Live Telemetry / Auth Button */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* System Switcher Button */}
              <button
                onClick={() => setSystemModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-sm ${
                  isSoil
                    ? 'bg-amber-950/70 border-amber-500/40 text-amber-300 hover:bg-amber-900/70'
                    : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/70'
                }`}
                title="Zwischen Soil (Erde) und Aeroponik wechseln"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>System: {isSoil ? 'Soil (Erde)' : 'Aeroponic'}</span>
                <RefreshCw className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {/* KCanG Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">KCanG § 9/10</span>
              </div>

              {/* Quick Live Parameters Pill */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
                <span className="flex items-center gap-1 text-slate-400">
                  {settings.isDayCycle ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                  <span className="text-slate-200">{telemetry.airTemp.toFixed(1)}°C</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">RLF {telemetry.humidity.toFixed(0)}%</span>
                <span className="text-slate-600">|</span>
                <span className={telemetry.waterTemp > 21 ? 'text-rose-400 font-bold' : isSoil ? 'text-amber-300' : 'text-cyan-400'}>
                  {isSoil ? `Gießwasser ${telemetry.waterTemp.toFixed(1)}°C` : `H₂O ${telemetry.waterTemp.toFixed(1)}°C`}
                </span>
              </div>

              {/* Alerts pill */}
              {alerts.length > 0 && (
                <button
                  onClick={() => setActiveTab('environment')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    criticalCount > 0
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{alerts.length}</span>
                </button>
              )}

              {/* User Login & Cloud Storage Profile Button */}
              <button
                onClick={() => setAuthModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  currentUser
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
                title={currentUser ? 'Angemeldet als ' + (currentUser.displayName || currentUser.email) : 'Anmelden oder Registrieren'}
              >
                {currentUser ? (
                  <>
                    <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="max-w-[100px] truncate">
                      {currentUser.displayName || (currentUser.isAnonymous ? 'Gast-Account' : 'Mein Profil')}
                    </span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Login / Cloud</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-800/60">
            <button
              onClick={() => setActiveTab('mygrow')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'mygrow'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sprout className="w-4 h-4 text-amber-400" />
              <span>🌱 Mein Grow</span>
            </button>

            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'diagnosis'
                  ? isSoil
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>Diagnose & Fallaufnahme</span>
            </button>

            <button
              onClick={() => setActiveTab('environment')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition relative ${
                activeTab === 'environment'
                  ? isSoil
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{isSoil ? 'Klima- & Boden-Sensoren' : 'Klima- & Hydro-Sensoren'}</span>
              {alerts.length > 0 && (
                <span className={`w-2 h-2 rounded-full ${criticalCount > 0 ? 'bg-rose-400 animate-ping' : 'bg-amber-400'}`} />
              )}
            </button>

            <button
              onClick={() => setActiveTab('root-log')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'root-log'
                  ? isSoil
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Microscope className="w-4 h-4" />
              <span>{isSoil ? 'Wurzel- & Substratkontrolle' : 'Wurzel-Tagebuch & Pythium'}</span>
            </button>

            <button
              onClick={() => setActiveTab('trichome-log')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'trichome-log'
                  ? 'bg-purple-500 text-slate-950 font-bold shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Trichom-Reifegrad & Ernte</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition relative ${
                activeTab === 'report'
                  ? isSoil
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Befundbericht & Therapieplan</span>
              {hasReport && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('calculators')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'calculators'
                  ? isSoil
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>{isSoil ? 'VPD- & Gießmengen-Kalkulator' : 'Aeroponik-Kalkulatoren & VPD'}</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'knowledge'
                  ? isSoil
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>KCanG Kompendium</span>
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Manual System Change Modal */}
      <SystemSelectionModal isOpen={systemModalOpen} onClose={() => setSystemModalOpen(false)} />
    </>
  );
};
