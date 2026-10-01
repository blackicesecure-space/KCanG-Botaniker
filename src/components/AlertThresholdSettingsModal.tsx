import React, { useState } from 'react';
import { useEnvironment } from '../context/EnvironmentContext';
import {
  Sliders,
  Check,
  RotateCcw,
  X,
  AlertTriangle,
  Flame,
  Thermometer,
  Beaker,
  Activity,
  Droplets,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface AlertThresholdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertThresholdSettingsModal: React.FC<AlertThresholdSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings } = useEnvironment();

  // Local state for editing thresholds
  const [phMin, setPhMin] = useState(settings.phTargetMin);
  const [phMax, setPhMax] = useState(settings.phTargetMax);
  const [phCritMin, setPhCritMin] = useState(settings.phCriticalMin ?? 5.2);
  const [phCritMax, setPhCritMax] = useState(settings.phCriticalMax ?? 6.4);

  const [ecMin, setEcMin] = useState(settings.ecTargetMin);
  const [ecMax, setEcMax] = useState(settings.ecTargetMax);
  const [ecCritMin, setEcCritMin] = useState(settings.ecCriticalMin ?? 0.8);
  const [ecCritMax, setEcCritMax] = useState(settings.ecCriticalMax ?? 1.85);

  const [tempDayMin, setTempDayMin] = useState(settings.tempDayTargetMin);
  const [tempDayMax, setTempDayMax] = useState(settings.tempDayTargetMax);
  const [tempCritMin, setTempCritMin] = useState(settings.tempCriticalMin ?? 17.0);
  const [tempCritMax, setTempCritMax] = useState(settings.tempCriticalMax ?? 28.5);

  const [waterTempMax, setWaterTempMax] = useState(settings.waterTempTargetMax);
  const [waterTempCritMax, setWaterTempCritMax] = useState(settings.waterTempCriticalMax ?? 21.0);

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      phTargetMin: phMin,
      phTargetMax: phMax,
      phCriticalMin: phCritMin,
      phCriticalMax: phCritMax,
      ecTargetMin: ecMin,
      ecTargetMax: ecMax,
      ecCriticalMin: ecCritMin,
      ecCriticalMax: ecCritMax,
      tempDayTargetMin: tempDayMin,
      tempDayTargetMax: tempDayMax,
      tempCriticalMin: tempCritMin,
      tempCriticalMax: tempCritMax,
      waterTempTargetMax: waterTempMax,
      waterTempCriticalMax: waterTempCritMax,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetDefaults = () => {
    setPhMin(5.6);
    setPhMax(6.0);
    setPhCritMin(5.2);
    setPhCritMax(6.4);

    setEcMin(1.1);
    setEcMax(1.5);
    setEcCritMin(0.8);
    setEcCritMax(1.85);

    setTempDayMin(20.0);
    setTempDayMax(26.0);
    setTempCritMin(17.0);
    setTempCritMax(28.5);

    setWaterTempMax(20.0);
    setWaterTempCritMax(21.0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Individuelle Alarmschwellen-Konfiguration
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Gefahrenmelder & Banner
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Lege exakte Sollbereiche sowie kritische Grenzwerte fest, bei deren Verletzung der SensorAlertsBanner warnt.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="my-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Alarmschwellen erfolgreich übernommen und im System aktiviert!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 pt-4 text-xs">
          {/* SECTION 1: pH-Wert Schwellen */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Beaker className="w-4 h-4 text-purple-400" />
                pH-Sonden Schwellenwerte
              </span>
              <span className="text-[11px] font-mono text-purple-300">Optimum: 5.60 – 6.00</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Warnung Min (Sauer):</label>
                <input
                  type="number"
                  step="0.05"
                  value={phMin}
                  onChange={(e) => setPhMin(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Warnung Max (Alkalisch):</label>
                <input
                  type="number"
                  step="0.05"
                  value={phMax}
                  onChange={(e) => setPhMax(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-rose-400 mb-1 font-semibold">KRITISCH Min (&lt;):</label>
                <input
                  type="number"
                  step="0.05"
                  value={phCritMin}
                  onChange={(e) => setPhCritMin(parseFloat(e.target.value))}
                  className="w-full bg-rose-950/40 border border-rose-500/40 rounded-lg px-2.5 py-1.5 text-rose-200 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-rose-400 mb-1 font-semibold">KRITISCH Max (&gt;):</label>
                <input
                  type="number"
                  step="0.05"
                  value={phCritMax}
                  onChange={(e) => setPhCritMax(parseFloat(e.target.value))}
                  className="w-full bg-rose-950/40 border border-rose-500/40 rounded-lg px-2.5 py-1.5 text-rose-200 font-mono font-bold"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Bei Überschreiten von KRITISCH Max schlägt der SensorAlertsBanner rot pulsierenden Alarm (Lockout-Gefahr).
            </p>
          </div>

          {/* SECTION 2: EC-Wert Schwellen */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                EC-Leitfähigkeits-Schwellen (mS/cm)
              </span>
              <span className="text-[11px] font-mono text-cyan-300">Optimum: 1.10 – 1.50 mS/cm</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Warnung Min:</label>
                <input
                  type="number"
                  step="0.05"
                  value={ecMin}
                  onChange={(e) => setEcMin(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Warnung Max:</label>
                <input
                  type="number"
                  step="0.05"
                  value={ecMax}
                  onChange={(e) => setEcMax(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-rose-400 mb-1 font-semibold">KRITISCH Min (&lt;):</label>
                <input
                  type="number"
                  step="0.05"
                  value={ecCritMin}
                  onChange={(e) => setEcCritMin(parseFloat(e.target.value))}
                  className="w-full bg-rose-950/40 border border-rose-500/40 rounded-lg px-2.5 py-1.5 text-rose-200 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-rose-400 mb-1 font-semibold">KRITISCH Max (&gt;):</label>
                <input
                  type="number"
                  step="0.05"
                  value={ecCritMax}
                  onChange={(e) => setEcCritMax(parseFloat(e.target.value))}
                  className="w-full bg-rose-950/40 border border-rose-500/40 rounded-lg px-2.5 py-1.5 text-rose-200 font-mono font-bold"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Ein Überschreiten von KRITISCH Max verhindert osmotische Verbrennungen der jungen Wurzelspitzen.
            </p>
          </div>

          {/* SECTION 3: Temperatur Schwellen (Raum & Wasser) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                Temperatur-Schwellen (Raumluft & Nährlösung)
              </span>
              <span className="text-[11px] font-mono text-orange-300">Pythium-Gefahr ab 21.0 °C</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Luft Tag Ziel Max (°C):</label>
                <input
                  type="number"
                  step="0.5"
                  value={tempDayMax}
                  onChange={(e) => setTempDayMax(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-rose-400 mb-1 font-semibold">Luft KRITISCH Hitzestress:</label>
                <input
                  type="number"
                  step="0.5"
                  value={tempCritMax}
                  onChange={(e) => setTempCritMax(parseFloat(e.target.value))}
                  className="w-full bg-rose-950/40 border border-rose-500/40 rounded-lg px-2.5 py-1.5 text-rose-200 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Wassertemp Ziel Max (°C):</label>
                <input
                  type="number"
                  step="0.5"
                  value={waterTempMax}
                  onChange={(e) => setWaterTempMax(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-rose-400 mb-1 font-semibold">Wasser KRITISCH (Pythium):</label>
                <input
                  type="number"
                  step="0.2"
                  value={waterTempCritMax}
                  onChange={(e) => setWaterTempCritMax(parseFloat(e.target.value))}
                  className="w-full bg-rose-950/40 border border-rose-500/40 rounded-lg px-2.5 py-1.5 text-rose-200 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Standard-Schwellenwerte wiederherstellen</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-900/30 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Schwellenwerte speichern & anwenden</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
