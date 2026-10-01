import React, { useState, useEffect } from 'react';
import { RootHealthLog } from '../types/rootLog';
import { INITIAL_ROOT_LOGS } from '../data/telemetryData';
import { useEnvironment } from '../context/EnvironmentContext';
import { useAuth } from '../context/AuthContext';
import { useGrowConfig } from '../config/GrowConfigContext';
import {
  saveRootLogToFirestore,
  deleteRootLogFromFirestore,
  subscribeToRootLogs,
} from '../services/firestoreData';
import {
  Calendar,
  Camera,
  Trash2,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  Thermometer,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  Eye,
  Microscope,
  Info,
  Cloud,
  CloudCheck,
} from 'lucide-react';

export const RootHealthTracker: React.FC = () => {
  const { telemetry } = useEnvironment();
  const { currentUser } = useAuth();
  const { config } = useGrowConfig();
  const isSoil = config.system === 'soil';

  const [logs, setLogs] = useState<RootHealthLog[]>(() => {
    const saved = localStorage.getItem('kcang_root_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ROOT_LOGS;
      }
    }
    return INITIAL_ROOT_LOGS;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);

  // New Log Form State
  const [plantOrBatch, setPlantOrBatch] = useState('Pflanze #1 (AeroTop)');
  const [phase, setPhase] = useState('Hauptblüte');
  const [week, setWeek] = useState('5');
  const [colorGrade, setColorGrade] = useState<RootHealthLog['colorGrade']>('strahlend_weiss');
  const [smell, setSmell] = useState<RootHealthLog['smell']>('frisch_erdig');
  const [slimeBiofilm, setSlimeBiofilm] = useState<RootHealthLog['slimeBiofilm']>('keiner');
  const [rootHairDensity, setRootHairDensity] = useState<RootHealthLog['rootHairDensity']>('dichter_pelz');
  const [waterTemp, setWaterTemp] = useState(telemetry.waterTemp);
  const [ph, setPh] = useState(telemetry.ph);
  const [ec, setEc] = useState(telemetry.ec);
  const [notes, setNotes] = useState('');
  const [treatmentApplied, setTreatmentApplied] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sync with Firestore if logged in
  useEffect(() => {
    if (!currentUser) {
      setCloudSynced(false);
      return;
    }

    const unsubscribe = subscribeToRootLogs(currentUser.uid, (firestoreLogs) => {
      if (firestoreLogs.length > 0) {
        setLogs(firestoreLogs);
        localStorage.setItem('kcang_root_logs', JSON.stringify(firestoreLogs));
      } else if (logs.length > 0) {
        // First login: upload local logs to cloud
        logs.forEach((item) => {
          saveRootLogToFirestore(currentUser.uid, item).catch(console.warn);
        });
      }
      setCloudSynced(true);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Save helper
  const saveLogs = async (newLogs: RootHealthLog[], newLogItem?: RootHealthLog) => {
    setLogs(newLogs);
    localStorage.setItem('kcang_root_logs', JSON.stringify(newLogs));

    if (currentUser && newLogItem) {
      try {
        await saveRootLogToFirestore(currentUser.uid, newLogItem);
        setCloudSynced(true);
      } catch (err) {
        console.error('Error saving root log to Firestore:', err);
      }
    }
  };

  // Calculate Pythium Risk Score (0 - 100)
  const calculatePythiumScore = (
    cGrade: RootHealthLog['colorGrade'],
    sSmell: RootHealthLog['smell'],
    sSlime: RootHealthLog['slimeBiofilm'],
    rDensity: RootHealthLog['rootHairDensity'],
    wTemp: number
  ): number => {
    let score = 0;
    // Color
    if (cGrade === 'strahlend_weiss') score += 0;
    else if (cGrade === 'elfenbein_creme') score += 10;
    else if (cGrade === 'gelblich_beige') score += 30;
    else if (cGrade === 'braun_stumpf') score += 60;
    else if (cGrade === 'dunkelbraun_schwarz') score += 80;

    // Smell
    if (sSmell === 'frisch_erdig') score += 0;
    else if (sSmell === 'neutral') score += 5;
    else if (sSmell === 'schal_stagnierend') score += 20;
    else if (sSmell === 'muffig_modrig') score += 40;
    else if (sSmell === 'faulig_anaerob') score += 60;

    // Slime
    if (sSlime === 'keiner') score += 0;
    else if (sSlime === 'minimal') score += 15;
    else if (sSlime === 'deutlich') score += 40;
    else if (sSlime === 'starker_schleimfilm') score += 60;

    // Root hair density
    if (rDensity === 'dichter_pelz') score += 0;
    else if (rDensity === 'gut_sichtbar') score += 10;
    else if (rDensity === 'spaerlich') score += 25;
    else if (rDensity === 'fehlt_vollstaendig') score += 40;

    // Water temp
    if (wTemp > 21.0) score += (wTemp - 21.0) * 15;

    return Math.min(100, Math.round(score / 2.4));
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
    const score = calculatePythiumScore(colorGrade, smell, slimeBiofilm, rootHairDensity, waterTemp);
    const newLog: RootHealthLog = {
      id: `root-${Date.now()}`,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      plantOrBatch,
      phase,
      week,
      colorGrade,
      smell,
      slimeBiofilm,
      rootHairDensity,
      waterTempAtCheck: parseFloat(waterTemp.toFixed(1)),
      phAtCheck: parseFloat(ph.toFixed(2)),
      ecAtCheck: parseFloat(ec.toFixed(2)),
      pythiumRiskScore: score,
      notes,
      ...(treatmentApplied?.trim() ? { treatmentApplied: treatmentApplied.trim() } : {}),
      ...(photoUrl ? { photoUrl } : {}),
    };

    await saveLogs([newLog, ...logs], newLog);
    setIsFormOpen(false);
    // Reset form
    setNotes('');
    setTreatmentApplied('');
    setPhotoUrl(undefined);
    setUploadError(null);
  };

  const handleDeleteLog = async (id: string) => {
    const remaining = logs.filter((l) => l.id !== id);
    setLogs(remaining);
    localStorage.setItem('kcang_root_logs', JSON.stringify(remaining));
    setDeleteConfirmId(null);

    if (currentUser) {
      try {
        await deleteRootLogFromFirestore(currentUser.uid, id);
      } catch (err) {
        console.error('Error deleting from Firestore:', err);
      }
    }
  };

  const getColorLabel = (grade: RootHealthLog['colorGrade']) => {
    switch (grade) {
      case 'strahlend_weiss':
        return { label: 'Strahlend Weiß (Vital)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'elfenbein_creme':
        return { label: 'Elfenbein / Creme (Normal)', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
      case 'gelblich_beige':
        return { label: 'Gelblich / Beige (Beobachten)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'braun_stumpf':
        return { label: 'Braun & Stumpf (Gefahr)', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 'dunkelbraun_schwarz':
        return { label: 'Dunkelbraun / Schwarz (Nekrose)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isSoil ? 'Wurzel- & Substrat-Tagebuch' : 'Wurzel-Tagebuch & Pythium-Verlaufsprotokoll'}
                </h3>
                <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
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
                {isSoil
                  ? 'Bei Erde keine Sicht ins Reservoir — die Wurzelgesundheit liest du über Substratfeuchte (Finger-Test 3–4 cm tief), Drain-Werte, Blattturgur und Staunässe-Signale ab.'
                  : 'Periodische Dokumentation der Wurzelfarbe, Haptik, Geruch, Schleimfilme und H₂O₂-Therapien.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setWaterTemp(telemetry.waterTemp);
              setPh(telemetry.ph);
              setEc(telemetry.ec);
              setIsFormOpen(!isFormOpen);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isFormOpen ? 'Formular schließen' : 'Neue Wurzel-Inspektion protokollieren'}</span>
          </button>
        </div>
      </div>

      {/* Form Modal / Collapsible */}
      {isFormOpen && (
        <form
          onSubmit={handleCreateLog}
          className="bg-slate-900 border border-teal-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <div className="flex items-center gap-2">
              <Microscope className="w-4 h-4 text-teal-400" />
              <span>Befundaufnahme: Wurzelsystem-Inspektion</span>
            </div>
            <span className="text-xs text-slate-400">Automatische Pythium-Risikoberechnung</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Pflanze / Zelt / System:</label>
              <input
                type="text"
                required
                value={plantOrBatch}
                onChange={(e) => setPlantOrBatch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Phase:</label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="Keimling / Anwurzeln">Keimling / Anwurzeln</option>
                <option value="Vegetation">Vegetation</option>
                <option value="Frühe Blüte">Frühe Blüte</option>
                <option value="Hauptblüte">Hauptblüte</option>
                <option value="Spätblüte / Spülen">Spätblüte / Spülen</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Woche:</label>
              <input
                type="text"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                placeholder="z.B. 4"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Root Health Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Wurzelfarbe:</label>
              <select
                value={colorGrade}
                onChange={(e) => setColorGrade(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="strahlend_weiss">Strahlend Weiß (Sehr gesund)</option>
                <option value="elfenbein_creme">Elfenbein / Creme (Gut)</option>
                <option value="gelblich_beige">Gelblich / Beige (Leicht oxidiert)</option>
                <option value="braun_stumpf">Braun & Stumpf (Pythium-Verdacht)</option>
                <option value="dunkelbraun_schwarz">Dunkelbraun / Schwarz (Fäulnis)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Geruch im Wurzelraum:</label>
              <select
                value={smell}
                onChange={(e) => setSmell(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="frisch_erdig">Frisch & Erdig (Perfekt)</option>
                <option value="neutral">Neutral / Unauffällig</option>
                <option value="schal_stagnierend">Schal / Stagnierend</option>
                <option value="muffig_modrig">Muffig / Teichartig</option>
                <option value="faulig_anaerob">Faulig / Schwefelig (Alarm!)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Schleimfilm / Biofilm:</label>
              <select
                value={slimeBiofilm}
                onChange={(e) => setSlimeBiofilm(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="keiner">Keiner (Knackige Struktur)</option>
                <option value="minimal">Minimal / Beginnend</option>
                <option value="deutlich">Deutlich spürbar</option>
                <option value="starker_schleimfilm">Starker Schleimfilm (Oomyceten)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Wurzelhaardichte (Pelz):</label>
              <select
                value={rootHairDensity}
                onChange={(e) => setRootHairDensity(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="dichter_pelz">Dichter Pelz (Optimale Absorption)</option>
                <option value="gut_sichtbar">Gut sichtbar</option>
                <option value="spaerlich">Spärlich</option>
                <option value="fehlt_vollstaendig">Fehlt vollständig (Verätzt/Verfault)</option>
              </select>
            </div>
          </div>

          {/* Telemetry At Check */}
          <div className="grid grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-400 mb-1">Wassertemp (°C):</label>
              <input
                type="number"
                step="0.1"
                value={waterTemp}
                onChange={(e) => setWaterTemp(parseFloat(e.target.value) || 19)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">pH-Wert:</label>
              <input
                type="number"
                step="0.05"
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value) || 5.8)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">EC (mS/cm):</label>
              <input
                type="number"
                step="0.05"
                value={ec}
                onChange={(e) => setEc(parseFloat(e.target.value) || 1.3)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono"
              />
            </div>
          </div>

          {/* Notes and Treatment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Sichtbare Auffälligkeiten & Notizen:</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="z.B. Obere Wurzelstränge weiß, Spitzen im Tankboden beginnen leicht bräunlich zu werden..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Durchgeführte Sofortmaßnahme (Therapie):</label>
              <textarea
                rows={2}
                value={treatmentApplied}
                onChange={(e) => setTreatmentApplied(e.target.value)}
                placeholder="z.B. Mit 5 ml/l 3% H₂O₂ gespült, Chiller-Filter gereinigt, Sollwert auf 18.5°C gestellt..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          {/* Photo input */}
          <div className="text-xs">
            <label className="block text-slate-400 mb-1">Wurzelfoto beifügen (Optional):</label>
            {uploadError && (
              <div className="mb-2 p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer border border-slate-700">
                <Camera className="w-4 h-4 text-teal-400" />
                <span>Foto auswählen</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {photoUrl && (
                <div className="flex items-center gap-2">
                  <img src={photoUrl} alt="Preview" className="w-8 h-8 rounded object-cover border border-slate-700" />
                  <span className="text-emerald-400 text-[11px]">Foto geladen</span>
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

          {/* Submit */}
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
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
            >
              Inspektion speichern
            </button>
          </div>
        </form>
      )}

      {/* Timeline List of Inspections */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 mx-auto flex items-center justify-center">
              <Microscope className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Noch keine Wurzel-Inspektionen erfasst</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Dokumentiere deine erste Wurzelkammer-Inspektion (Wurzelfarbe, Geruch, Biofilm und Pythium-Index), um den Verlauf deiner Pflanzen im Aeroponik-System festzuhalten.
            </p>
            <button
              onClick={() => {
                setWaterTemp(telemetry.waterTemp);
                setPh(telemetry.ph);
                setEc(telemetry.ec);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition shadow-sm"
            >
              Erste Wurzel-Inspektion anlegen
            </button>
          </div>
        ) : (
          logs.map((log) => {
          const colorInfo = getColorLabel(log.colorGrade);
          const isCritical = log.pythiumRiskScore >= 60;
          const isWarning = log.pythiumRiskScore >= 30 && log.pythiumRiskScore < 60;

          return (
            <div
              key={log.id}
              className={`bg-slate-900/80 border rounded-2xl p-5 shadow-lg transition space-y-3 ${
                isCritical
                  ? 'border-rose-500/40 bg-rose-950/20'
                  : isWarning
                  ? 'border-amber-500/40 bg-amber-950/15'
                  : 'border-slate-800'
              }`}
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-white text-sm">{log.plantOrBatch}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {log.phase} (Woche {log.week})
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {log.dateStr}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Pythium Score Badge */}
                  <div
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    <span>Pythium-Index:</span>
                    <span>{log.pythiumRiskScore} / 100</span>
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

              {/* Status Tags */}
              <div className="flex items-center flex-wrap gap-2 text-xs">
                <span className={`px-2.5 py-1 rounded-lg border font-medium ${colorInfo.color}`}>
                  Farbe: {colorInfo.label}
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  Geruch: <strong className="text-white">{log.smell.replace('_', ' ')}</strong>
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  Biofilm: <strong className="text-white">{log.slimeBiofilm.replace('_', ' ')}</strong>
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  Wurzelhaare: <strong className="text-white">{log.rootHairDensity.replace('_', ' ')}</strong>
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-300">
                  H₂O: {log.waterTempAtCheck}°C | pH {log.phAtCheck} | EC {log.ecAtCheck}
                </span>
              </div>

              {/* Notes & Treatment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="font-semibold text-slate-400 block mb-1">Beobachtung:</span>
                  <p className="text-slate-200 leading-relaxed">{log.notes || 'Keine weiteren Besonderheiten vermerkt.'}</p>
                </div>

                {log.treatmentApplied && (
                  <div className="bg-teal-950/30 p-3 rounded-xl border border-teal-500/30">
                    <span className="font-semibold text-teal-400 block mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Durchgeführte Behandlung (Therapie):
                    </span>
                    <p className="text-teal-200 leading-relaxed">{log.treatmentApplied}</p>
                  </div>
                )}
              </div>

              {/* Optional Photo Attachment */}
              {log.photoUrl && (
                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Befundfoto der Wurzelzone:</span>
                  <img
                    src={log.photoUrl}
                    alt="Wurzelbefund"
                    className="max-h-48 rounded-xl object-contain border border-slate-800 bg-black/40"
                  />
                </div>
              )}
            </div>
          );
        }))}
      </div>
    </div>
  );
};
