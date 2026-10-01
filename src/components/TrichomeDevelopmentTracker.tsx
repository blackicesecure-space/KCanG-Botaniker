import React, { useState, useEffect } from 'react';
import { TrichomeLog } from '../types/trichome';
import { INITIAL_TRICHOME_LOGS } from '../data/trichomeData';
import { useAuth } from '../context/AuthContext';
import {
  saveTrichomeLogToFirestore,
  deleteTrichomeLogFromFirestore,
  subscribeToTrichomeLogs,
} from '../services/firestoreData';
import {
  Eye,
  Camera,
  Trash2,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
  CloudCheck,
  TrendingUp,
  Percent,
} from 'lucide-react';

export const TrichomeDevelopmentTracker: React.FC = () => {
  const { currentUser } = useAuth();

  const [logs, setLogs] = useState<TrichomeLog[]>(() => {
    const saved = localStorage.getItem('kcang_trichome_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_TRICHOME_LOGS;
      }
    }
    return INITIAL_TRICHOME_LOGS;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);

  // New Inspection Form state
  const [plantOrStrain, setPlantOrStrain] = useState('');
  const [flowerWeek, setFlowerWeek] = useState(8);
  const [bloomDay, setBloomDay] = useState(56);
  const [sampleLocation, setSampleLocation] = useState<TrichomeLog['sampleLocation']>('head_bud');
  const [percentClear, setPercentClear] = useState<number>(20);
  const [percentMilky, setPercentMilky] = useState<number>(70);
  const [percentAmber, setPercentAmber] = useState<number>(10);
  const [intendedProfile, setIntendedProfile] = useState<TrichomeLog['intendedProfile']>('balanced_hybrid');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sync with Firestore if logged in
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToTrichomeLogs(currentUser.uid, (cloudLogs) => {
      if (cloudLogs.length > 0) {
        setLogs(cloudLogs);
        localStorage.setItem('kcang_trichome_logs', JSON.stringify(cloudLogs));
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Keep percentages normalized to 100%
  const handleClearChange = (val: number) => {
    const clear = Math.max(0, Math.min(100, val));
    const remaining = 100 - clear;
    const ratioMilky = percentMilky + percentAmber > 0 ? percentMilky / (percentMilky + percentAmber) : 0.8;
    setPercentClear(clear);
    setPercentMilky(Math.round(remaining * ratioMilky));
    setPercentAmber(remaining - Math.round(remaining * ratioMilky));
  };

  const handleMilkyChange = (val: number) => {
    const milky = Math.max(0, Math.min(100, val));
    const remaining = 100 - milky;
    const ratioAmber = percentClear + percentAmber > 0 ? percentAmber / (percentClear + percentAmber) : 0.3;
    setPercentMilky(milky);
    setPercentAmber(Math.round(remaining * ratioAmber));
    setPercentClear(remaining - Math.round(remaining * ratioAmber));
  };

  const handleAmberChange = (val: number) => {
    const amber = Math.max(0, Math.min(100, val));
    const remaining = 100 - amber;
    const ratioMilky = percentClear + percentMilky > 0 ? percentMilky / (percentClear + percentMilky) : 0.8;
    setPercentAmber(amber);
    setPercentMilky(Math.round(remaining * ratioMilky));
    setPercentClear(remaining - Math.round(remaining * ratioMilky));
  };

  // Botanical harvest calculation based on trichome ratio and desired profile
  const evaluateHarvestReadiness = (
    clear: number,
    milky: number,
    amber: number,
    profile: TrichomeLog['intendedProfile']
  ) => {
    let score = 0;
    let recommendation: TrichomeLog['harvestRecommendation'] = 'Zu früh (Glasig dominiert)';
    let days = 14;
    let thcPhase: TrichomeLog['thcDevelopmentPhase'] = 'Synthese';
    let terpene: TrichomeLog['terpeneQuality'] = 'voll_ausgeprägt';

    if (clear > 40) {
      score = Math.round(100 - clear);
      recommendation = 'Zu früh (Glasig dominiert)';
      days = Math.max(7, Math.round((clear - 20) / 4));
      thcPhase = 'Synthese';
      terpene = 'intensiv_flüchtig';
    } else if (amber >= 35) {
      score = 75;
      recommendation = 'Späte Ernte (Erhöhter CBN-Gehalt)';
      days = 0;
      thcPhase = 'Abbau zu CBN';
      terpene = 'beginnende_oxidation';
    } else if (amber > 50) {
      score = 45;
      recommendation = 'Überreif';
      days = 0;
      thcPhase = 'Abbau zu CBN';
      terpene = 'beginnende_oxidation';
    } else {
      // Profile target check
      if (profile === 'cerebral_active') {
        // Ideal: 10-15% clear, 80-85% milky, 5% amber
        if (milky >= 75 && amber <= 10) {
          score = 95;
          recommendation = 'Optimales Erntefenster (Peak THC)';
          days = 0;
        } else if (milky >= 60) {
          score = 80;
          recommendation = 'Erntefenster öffnet sich';
          days = 3;
        } else {
          score = 65;
          days = 6;
        }
      } else if (profile === 'balanced_hybrid') {
        // Ideal: 70% milky, 15-25% amber
        if (milky >= 65 && amber >= 15 && amber <= 30) {
          score = 98;
          recommendation = 'Optimales Erntefenster (Peak THC)';
          days = 0;
        } else if (amber < 15) {
          score = 82;
          recommendation = 'Erntefenster öffnet sich';
          days = 4;
        } else {
          score = 85;
          days = 0;
        }
      } else {
        // body_relax or medical_sedative: 55-65% milky, 30-40% amber
        if (amber >= 25 && amber <= 40) {
          score = 95;
          recommendation = 'Optimales Erntefenster (Peak THC)';
          days = 0;
        } else if (amber < 25) {
          score = 75;
          recommendation = 'Erntefenster öffnet sich';
          days = 5;
        } else {
          score = 80;
          days = 0;
        }
      }
      thcPhase = amber > 20 ? 'Abbau zu CBN' : 'Peak (Maximum)';
      terpene = 'voll_ausgeprägt';
    }

    const cbnEstimate = parseFloat((amber * 0.08).toFixed(1));

    return {
      score: Math.min(100, Math.max(10, score)),
      recommendation,
      days,
      thcPhase,
      cbnEstimate,
      terpene,
    };
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Foto zu groß (maximal 10 MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    const evaluation = evaluateHarvestReadiness(
      percentClear,
      percentMilky,
      percentAmber,
      intendedProfile
    );

    const newLog: TrichomeLog = {
      id: `trichome-${Date.now()}`,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      plantOrStrain: plantOrStrain.trim() || 'Cannabis Pflanze (Aero)',
      flowerWeek,
      bloomDay,
      sampleLocation,
      percentClear,
      percentMilky,
      percentAmber,
      intendedProfile,
      harvestReadinessScore: evaluation.score,
      harvestRecommendation: evaluation.recommendation,
      estimatedDaysToHarvest: evaluation.days,
      thcDevelopmentPhase: evaluation.thcPhase,
      cbnEstimationPercent: evaluation.cbnEstimate,
      terpeneQuality: evaluation.terpene,
      kcangGuidance: {
        plantStatus: 'Lebende Pflanze (zählt zu den 3 legalen Pflanzen gem. § 9 Abs. 1)',
        harvestLimitNotice: 'Achtung: Bis zu 50 g getrocknetes Cannabis am Wohnsitz legal (§ 3 KCanG). Erntemenge planen!',
        curingAdvice: 'Schonende Trocknung bei 18°C & 60% RLF über 10-14 Tage zur Erhaltung der Monoterpene.',
      },
      ...(notes?.trim() ? { notes: notes.trim() } : {}),
      ...(photoUrl ? { photoUrl } : {}),
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem('kcang_trichome_logs', JSON.stringify(updated));

    if (currentUser) {
      try {
        await saveTrichomeLogToFirestore(currentUser.uid, newLog);
      } catch (err) {
        console.error('Error saving trichome log to Firestore:', err);
      }
    }

    setIsFormOpen(false);
    setNotes('');
    setPhotoUrl(undefined);
    setUploadError(null);
  };

  const handleDeleteLog = async (id: string) => {
    const remaining = logs.filter((l) => l.id !== id);
    setLogs(remaining);
    localStorage.setItem('kcang_trichome_logs', JSON.stringify(remaining));
    setDeleteConfirmId(null);

    if (currentUser) {
      try {
        await deleteTrichomeLogFromFirestore(currentUser.uid, id);
      } catch (err) {
        console.error('Error deleting trichome log from Firestore:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Trichom-Reifegrad & KCanG-Erntezeitpunkt-Bestimmung
                </h3>
                <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {logs.length} Inspektionen
                </span>
                {currentUser && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CloudCheck className="w-3 h-3" />
                    Cloud Sync
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Mikroskopische Bewertung der Drüsenköpfe (glasig, milchig, bernstein) zur Bestimmung des idealen Cannabinoid-Peaks (§ 9/§ 10 KCanG konform).
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isFormOpen ? 'Formular schließen' : 'Neue Trichom-Messung erfassen'}</span>
          </button>
        </div>
      </div>

      {/* Form Modal / Collapsible */}
      {isFormOpen && (
        <form
          onSubmit={handleCreateLog}
          className="bg-slate-900 border border-purple-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span>Mikroskop-Inspektion der Trichome (Drüsenhaare)</span>
            </div>
            <span className="text-xs font-mono text-purple-300">Empfehlung: 60x–100x Taschenmikroskop / Makrolinse</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Sorte / Phänotyp / Pflanze:</label>
              <input
                type="text"
                required
                value={plantOrStrain}
                onChange={(e) => setPlantOrStrain(e.target.value)}
                placeholder="z.B. Amnesia Haze #2"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Blütewoche:</label>
              <input
                type="number"
                min="1"
                max="16"
                value={flowerWeek}
                onChange={(e) => setFlowerWeek(parseInt(e.target.value) || 8)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Blütetag (12/12):</label>
              <input
                type="number"
                min="1"
                max="120"
                value={bloomDay}
                onChange={(e) => setBloomDay(parseInt(e.target.value) || 56)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Proben-Entnahmeort:</label>
              <select
                value={sampleLocation}
                onChange={(e) => setSampleLocation(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="head_bud">Hauptbud (Kalyx/Blütenkelch)</option>
                <option value="side_branch">Seitenast (Mitte der Krone)</option>
                <option value="calyx_lower">Untere Blütenkelche (Popcorn)</option>
                <option value="sugar_leaf">Zuckerblatt (reift früher, Achtung!)</option>
              </select>
            </div>
          </div>

          {/* TRICHOME SLIDERS (Clear / Milky / Amber) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-purple-400" />
                Trichom-Farbverteilung (Summe = 100%)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Wichtig: Beurteile Blütenkelche, nicht die äußeren Zuckerblätter!
              </span>
            </div>

            {/* Clear Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border border-slate-400 bg-slate-200/20 inline-block" />
                  Glasig / Durchscheinend (Unreif, THC-Synthese im Gange):
                </span>
                <span className="font-mono font-bold text-slate-200">{percentClear}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={percentClear}
                onChange={(e) => handleClearChange(parseInt(e.target.value))}
                className="w-full accent-slate-400 cursor-pointer"
              />
            </div>

            {/* Milky Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-300 font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
                  Milchig / Trüb (Maximaler THC- & Terpen-Peak):
                </span>
                <span className="font-mono font-bold text-emerald-400">{percentMilky}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={percentMilky}
                onChange={(e) => handleMilkyChange(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Amber Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-400 font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm shadow-amber-500/50" />
                  Bernstein / Golden (CBN-Degradation, körperlich sedierend):
                </span>
                <span className="font-mono font-bold text-amber-400">{percentAmber}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={percentAmber}
                onChange={(e) => handleAmberChange(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Visual Bar Indicator */}
            <div className="h-4 w-full rounded-full bg-slate-900 border border-slate-700 flex overflow-hidden">
              <div
                style={{ width: `${percentClear}%` }}
                className="bg-slate-400/80 transition-all text-[9px] text-black font-bold flex items-center justify-center"
                title={`Glasig: ${percentClear}%`}
              >
                {percentClear > 8 && `${percentClear}%`}
              </div>
              <div
                style={{ width: `${percentMilky}%` }}
                className="bg-emerald-500 transition-all text-[9px] text-black font-bold flex items-center justify-center"
                title={`Milchig: ${percentMilky}%`}
              >
                {percentMilky > 8 && `${percentMilky}%`}
              </div>
              <div
                style={{ width: `${percentAmber}%` }}
                className="bg-amber-500 transition-all text-[9px] text-black font-bold flex items-center justify-center"
                title={`Bernstein: ${percentAmber}%`}
              >
                {percentAmber > 8 && `${percentAmber}%`}
              </div>
            </div>
          </div>

          {/* Desired Profile & Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Angestrebtes Wirkungsprofil (Ernteziel):</label>
              <select
                value={intendedProfile}
                onChange={(e) => setIntendedProfile(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="cerebral_active">Kopflastig & Aktivierend (Peak THC, &lt;5% Bernstein)</option>
                <option value="balanced_hybrid">Ausgewogener Hybrid (Max THC + 15–20% Bernstein)</option>
                <option value="body_relax">Körperliche Entspannung / Couch-Lock (25–35% Bernstein)</option>
                <option value="medical_sedative">Medizinisch Sedierend / Schlaf (&gt;35% Bernstein / CBN)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Makro- / Mikroskop-Foto beifügen (Optional):</label>
              {uploadError && (
                <div className="mb-2 p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>{uploadError}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer border border-slate-700">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <span>Foto hochladen</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {photoUrl && (
                  <div className="flex items-center gap-2">
                    <img src={photoUrl} alt="Preview" className="w-8 h-8 rounded object-cover border border-slate-700" />
                    <span className="text-emerald-400 text-[11px]">Bild geladen</span>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(undefined)}
                      className="text-rose-400 hover:text-rose-300 text-xs"
                    >
                      Entfernen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className="text-xs">
            <label className="block text-slate-400 mb-1">Botanische Beobachtungen & Geruchsentwicklung:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Stigmen zu 70% orange-braun eingetrocknet, Schwellung der Blütenkelche (Calyx-Swelling) voll im Gange, starker Pinen- & Limonengeruch..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30"
            >
              Ergebnis berechnen & speichern
            </button>
          </div>
        </form>
      )}

      {/* Timeline List of Trichome Inspections */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Noch keine Trichom-Analysen erfasst</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Lege deine erste mikroskopische Trichom-Inspektion (Glasig, Milchig, Bernstein) per Bild-Upload oder Schieberegler an, um den optimalen Erntezeitpunkt nach KCanG zu bestimmen.
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm"
            >
              Erste Trichom-Inspektion erfassen
            </button>
          </div>
        ) : (
          logs.map((log) => {
            const isHarvestReady = log.harvestRecommendation === 'Optimales Erntefenster (Peak THC)';
            const isLate = log.harvestRecommendation === 'Späte Ernte (Erhöhter CBN-Gehalt)';

            return (
              <div
                key={log.id}
                className={`bg-slate-900/80 border rounded-2xl p-5 shadow-lg transition space-y-4 ${
                  isHarvestReady
                    ? 'border-emerald-500/50 bg-emerald-950/15'
                    : isLate
                    ? 'border-amber-500/50 bg-amber-950/15'
                    : 'border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-white text-sm">{log.plantOrStrain}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Woche {log.flowerWeek} (Tag {log.bloomDay})
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {log.dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Harvest Readiness Badge */}
                    <div
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                        isHarvestReady
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{log.harvestRecommendation}</span>
                      <span>({log.harvestReadinessScore}%)</span>
                    </div>

                    {deleteConfirmId === log.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm"
                        >
                          Löschen
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(log.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Eintrag löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      Glasig: <strong className="text-white">{log.percentClear}%</strong>
                    </span>
                    <span className="text-emerald-400">
                      Milchig (THC-Peak): <strong>{log.percentMilky}%</strong>
                    </span>
                    <span className="text-amber-400">
                      Bernstein (CBN): <strong>{log.percentAmber}%</strong>
                    </span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-950 border border-slate-800 flex overflow-hidden">
                    <div style={{ width: `${log.percentClear}%` }} className="bg-slate-400/80" />
                    <div style={{ width: `${log.percentMilky}%` }} className="bg-emerald-500" />
                    <div style={{ width: `${log.percentAmber}%` }} className="bg-amber-500" />
                  </div>
                </div>

                {/* Botanical Prediction Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Tage bis Ernte</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {log.estimatedDaysToHarvest === 0 ? 'Heute ernten!' : `ca. ${log.estimatedDaysToHarvest} Tage`}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Cannabinoid-Phase</span>
                    <span className="text-sm font-bold text-purple-300 font-mono">{log.thcDevelopmentPhase}</span>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Geschätztes CBN</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">~{log.cbnEstimationPercent}%</span>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Terpen-Profil</span>
                    <span className="text-sm font-bold text-emerald-400 capitalize">
                      {log.terpeneQuality.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* KCanG Legal & Curing Guidance */}
                <div className="bg-slate-950/90 border border-emerald-500/20 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <Scale className="w-3.5 h-3.5" />
                    <span>KCanG-Richtlinien & Trocknungsleitfaden (§ 9 / § 10):</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1 leading-relaxed">
                    <p>• {log.kcangGuidance.harvestLimitNotice}</p>
                    <p>• {log.kcangGuidance.curingAdvice}</p>
                  </div>
                </div>

                {/* Notes & Optional Image */}
                {log.notes && (
                  <div className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="font-semibold text-slate-400 block mb-0.5">Notizen:</span>
                    {log.notes}
                  </div>
                )}

                {log.photoUrl && (
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Trichom-Makroaufnahme:</span>
                    <img
                      src={log.photoUrl}
                      alt="Trichom-Foto"
                      className="max-h-48 rounded-xl object-contain border border-slate-800 bg-black/40"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
