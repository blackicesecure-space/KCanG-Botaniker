import React, { useState, useEffect } from 'react';
import { Grow, GROWSTORYS_AUTO_PLAN, currentGrowWeek, currentPlanWeek, checkAgainstPlan } from '../data/growPlan';
import { loadWateringLog, WateringLogEntry } from '../data/wateringLog';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  ArrowRight,
  Award,
  Layers,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface GrowDashboardProps {
  onNavigateToCalculators?: () => void;
}

const GROW_STORAGE_KEY = 'kcang_current_grow';
const CHECKLIST_STORAGE_KEY = 'kcang_grow_checklist';

export const GrowDashboard: React.FC<GrowDashboardProps> = ({ onNavigateToCalculators }) => {
  const { currentUser } = useAuth();

  // Load or initialize Grow
  const [grow, setGrow] = useState<Grow | null>(() => {
    try {
      const saved = localStorage.getItem(GROW_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default initial grow (Mimosa Zkittlez Auto, started 23 days ago = week 4)
    const defaultStart = Date.now() - 23 * 86400000;
    return {
      id: 'grow-default-1',
      strain: 'Mimosa Zkittlez Auto',
      plantCount: 6,
      startDate: defaultStart,
      potLiters: 20,
      plan: GROWSTORYS_AUTO_PLAN,
    };
  });

  // New Grow Form State
  const [isCreating, setIsCreating] = useState(false);
  const [formStrain, setFormStrain] = useState('Mimosa Zkittlez Auto');
  const [formPlants, setFormPlants] = useState(3);
  const [formPotSize, setFormPotSize] = useState(20);
  const [formDaysAgo, setFormDaysAgo] = useState(0); // 0 = started today

  // Checklist state for actions
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (grow) {
      localStorage.setItem(GROW_STORAGE_KEY, JSON.stringify(grow));
    }
  }, [grow]);

  useEffect(() => {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedActions));
  }, [checkedActions]);

  const handleCreateGrow = (e: React.FormEvent) => {
    e.preventDefault();
    const newGrow: Grow = {
      id: `grow-${Date.now()}`,
      strain: formStrain || 'Autoflower Hybrid',
      plantCount: Number(formPlants) || 3,
      startDate: Date.now() - Number(formDaysAgo) * 86400000,
      potLiters: Number(formPotSize) || 20,
      plan: GROWSTORYS_AUTO_PLAN,
    };
    setGrow(newGrow);
    setIsCreating(false);
  };

  const toggleActionCheck = (actionKey: string) => {
    setCheckedActions(prev => ({ ...prev, [actionKey]: !prev[actionKey] }));
  };

  if (!grow || isCreating) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Neuen Grow-Fahrplan anlegen</h2>
              <p className="text-xs text-slate-400">
                Wähle deine Sorte und Topfgröße. Die App generiert einen 12-Wochen-Fahrplan (Autoflower Soil Reference).
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateGrow} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Genetik / Sorte:</label>
              <input
                type="text"
                value={formStrain}
                onChange={(e) => setFormStrain(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                placeholder="z.B. Northern Lights Auto"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Anzahl Pflanzen:</label>
                <input
                  type="number" min="1" max="10"
                  value={formPlants}
                  onChange={(e) => setFormPlants(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Topfvolumen (Liter):</label>
                <input
                  type="number" min="3" max="50"
                  value={formPotSize}
                  onChange={(e) => setFormPotSize(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bereits gekeimt vor (Tagen):</label>
                <input
                  type="number" min="0" max="90"
                  value={formDaysAgo}
                  onChange={(e) => setFormDaysAgo(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">0 = heute gestartet</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-amber-300">Fahrplan-Profil:</span>
              <p>Basierend auf dem dokumentierten GrowStorys Autoflower-Durchgang (90 Tage bis zur Ernte, Athena Blended Line, 20L Living Soil).</p>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              {grow && (
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Abbrechen
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
              >
                Grow-Fahrplan starten
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const weekNum = currentGrowWeek(grow);
  const planWeek = currentPlanWeek(grow);
  const wateringLogs: WateringLogEntry[] = loadWateringLog();
  const currentWeekLogs = wateringLogs.filter(l => l.week === weekNum);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  Aktiver Grow • {grow.plantCount} Pflanzen ({grow.potLiters}L Topf)
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Tag {Math.floor((Date.now() - grow.startDate) / 86400000) + 1}
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                {grow.strain}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Woche {weekNum} von 12 — Aktuelle Phase: <strong className="text-amber-400 uppercase">{planWeek.phase}</strong> ({planWeek.titel})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreating(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
            >
              Neuen Grow anlegen
            </button>
            {onNavigateToCalculators && (
              <button
                onClick={onNavigateToCalculators}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
              >
                <span>Gieß-Protokoll</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 12-Week Timeline Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 mb-2 flex justify-between">
            <span>Wochen-Fahrplan (12 Wochen)</span>
            <span>Fortschritt: {Math.round((weekNum / 12) * 100)}%</span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {grow.plan.map((p) => {
              const isPast = p.week < weekNum;
              const isCurrent = p.week === weekNum;
              return (
                <div
                  key={p.week}
                  className={`p-2 rounded-xl border text-center transition ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                      : isPast
                      ? 'bg-slate-950 text-slate-400 border-slate-800'
                      : 'bg-slate-950/60 text-slate-600 border-slate-850'
                  }`}
                >
                  <div className="text-[10px] font-mono">W{p.week}</div>
                  <div className="text-xs font-bold truncate">{isPast ? '✓' : p.week}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Current Week Plan & Soll-Ist Ampel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Aktuelle Planwoche & Checkliste */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Woche {planWeek.week}: {planWeek.titel}</h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold uppercase">
              {planWeek.phase}
            </span>
          </div>

          {/* Target Corridors */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
              <span className="text-slate-400">Soll-pH Korridor:</span>
              <div className="font-bold text-white font-mono text-base">
                {planWeek.phMin} – {planWeek.phMax}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
              <span className="text-slate-400">Soll-EC Korridor:</span>
              <div className="font-bold text-amber-300 font-mono text-base">
                {planWeek.ecMin} – {planWeek.ecMax} mS
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
              <span className="text-slate-400">Gießmenge:</span>
              <div className="font-bold text-white font-mono text-sm">
                {planWeek.waterLiters}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
              <span className="text-slate-400">Drain-Ziel:</span>
              <div className="font-bold text-cyan-300 font-mono text-sm">
                {planWeek.drainPercent}
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-300">Wochen-Aktionen & Praxis-Hinweise:</h4>
            <div className="space-y-1.5">
              {planWeek.aktionen.map((act, idx) => {
                const actionKey = `w${planWeek.week}-act-${idx}`;
                const isChecked = !!checkedActions[actionKey];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleActionCheck(actionKey)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition ${
                      isChecked
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-slate-400 line-through'
                        : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="leading-relaxed">{act}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Soll-Ist-Ampel (Gießprotokoll-Vergleich) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Soll-Ist-Ampel (Woche {weekNum})</h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {currentWeekLogs.length} Messungen
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Vergleich deiner Ist-Messungen aus dem Gieß-Protokoll mit den idealen Soll-Korridoren der aktuellen Planwoche.
          </p>

          {currentWeekLogs.length > 0 ? (
            <div className="space-y-3">
              {currentWeekLogs.map((log) => {
                const phLight = checkAgainstPlan(log.inputPh, planWeek.phMin, planWeek.phMax);
                const ecLight = log.inputEc !== undefined ? checkAgainstPlan(log.inputEc, planWeek.ecMin, planWeek.ecMax) : 'green';

                const getBadge = (light: 'green' | 'yellow' | 'red', label: string) => {
                  if (light === 'green') return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">🟢 {label} im Korridor</span>;
                  if (light === 'yellow') return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold">🟡 {label} beobachten</span>;
                  return <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-bold">🔴 {label} abweichend</span>;
                };

                return (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
                      <span>{new Date(log.timestamp).toLocaleDateString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
                      <span>Eingang: pH {log.inputPh} / EC {log.inputEc}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {getBadge(phLight, `pH (${log.inputPh})`)}
                      {getBadge(ecLight, `EC (${log.inputEc})`)}
                    </div>

                    {phLight === 'red' && (
                      <p className="text-[11px] text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
                        ⚠️ pH weicht vom Soll ({planWeek.phMin}–{planWeek.phMax}) ab! Korrigiere das nächste Gießwasser mit pH-Down oder pH-Up.
                      </p>
                    )}
                    {phLight === 'yellow' && (
                      <p className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                        💡 Leichte pH-Abweichung — bei der nächsten Bewässerung anpassen.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
              <div className="text-2xl">📝</div>
              <div className="text-xs text-slate-300 font-bold">Noch keine Gieß-Messungen in Woche {weekNum}</div>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Erfasse im Gieß-Protokoll (Kalkulator-Tab) deine Eingangswerte, um hier die Ampel-Auswertung zu sehen.
              </p>
              {onNavigateToCalculators && (
                <button
                  onClick={onNavigateToCalculators}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition inline-flex items-center gap-1.5"
                >
                  <span>Zum Gieß-Protokoll</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
