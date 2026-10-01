import React, { useState } from 'react';
import { CultivationMethod, SoilSubstrateData } from '../types/botanist';
import { useCultivationSystem } from '../context/CultivationSystemContext';
import { useAuth } from '../context/AuthContext';
import { useGrowConfig } from '../config/GrowConfigContext';
import {
  Layers,
  Wind,
  Sprout,
  CheckCircle2,
  ArrowRight,
  Droplets,
  ShieldCheck,
  Scale,
  Sparkles,
  Info,
} from 'lucide-react';

interface SystemSelectionModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const SystemSelectionModal: React.FC<SystemSelectionModalProps> = ({ isOpen, onClose }) => {
  const { method, setMethod, soilData, setSoilData } = useCultivationSystem();
  const { currentUser } = useAuth();
  const { config, setConfig } = useGrowConfig();

  const [selectedMethod, setSelectedMethod] = useState<CultivationMethod>(method || 'aeroponic');
  const [tempSoilData, setTempSoilData] = useState<SoilSubstrateData>(soilData);
  const [irrigation, setIrrigation] = useState<'manual' | 'auto'>(
    config.irrigation === 'manual' ? 'manual' : 'auto'
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    setSoilData(tempSoilData);
    setMethod(selectedMethod);
    setConfig({
      ...config,
      system: selectedMethod,
      irrigation:
        irrigation === 'manual'
          ? 'manual'
          : selectedMethod === 'aeroponic'
            ? 'high_pressure_aero'
            : 'automated_drip',
      version: config.version + 1,
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center space-y-2 pb-5 border-b border-slate-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>KCanG Konforme System-Kalibrierung</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Wähle dein Anbauverfahren
          </h2>

          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            {currentUser ? `Willkommen, ${currentUser.displayName || currentUser.email}! ` : ''}
            Der KCanG-Botaniker kalibriert alle Algorithmen, Nährstoffempfehlungen, pH/EC-Zielkorridore und Diagnoseabläufe exakt auf dein gewähltes Medium.
          </p>
        </div>

        {/* System Cards Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {/* OPTION 1: SOIL / ERDE */}
          <div
            onClick={() => setSelectedMethod('soil')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
              selectedMethod === 'soil'
                ? 'bg-amber-950/25 border-amber-500 shadow-xl shadow-amber-950/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
            }`}
          >
            {selectedMethod === 'soil' && (
              <div className="absolute top-3 right-3 text-amber-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Sprout className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Soil (Erde & Substrat)</span>
                </h3>
                <span className="text-[11px] font-mono text-amber-400">
                  Organisch, Living Soil oder Mineralisch
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Klassischer Anbau in Erde, BioBizz, Plagron, Living Soil oder Kokos-Mix. Fokus auf Pufferkapazität, Bodenmikrobiologie, Gießzyklen, Staunässe-Vermeidung und Drain-Kontrolle.
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Ziel-pH Wurzelraum:</span>
                  <span className="text-white font-bold">6.2 – 6.8</span>
                </div>
                <div className="flex justify-between">
                  <span>Nährstoff-Dynamik:</span>
                  <span className="text-amber-300 font-bold">Puffernd (Depot)</span>
                </div>
                <div className="flex justify-between">
                  <span>Hauptrisiko:</span>
                  <span className="text-rose-400">Überwässerung / Lock</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <span
                className={`text-xs font-bold inline-flex items-center gap-1 ${
                  selectedMethod === 'soil' ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {selectedMethod === 'soil' ? 'Ausgewählt' : 'Erde wählen'} &rarr;
              </span>
            </div>
          </div>

          {/* OPTION 2: AEROPONIC */}
          <div
            onClick={() => setSelectedMethod('aeroponic')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
              selectedMethod === 'aeroponic'
                ? 'bg-cyan-950/25 border-cyan-500 shadow-xl shadow-cyan-950/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
            }`}
          >
            {selectedMethod === 'aeroponic' && (
              <div className="absolute top-3 right-3 text-cyan-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Wind className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Aeroponic (HPA / LPA)</span>
                </h3>
                <span className="text-[11px] font-mono text-cyan-400">
                  Substratlos • Schwebenebel (30–50 µm)
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                High-End Wurzelkammer ohne Erde. Reine Nährlösungs-Vernebelung via Hochdruck (HPA) oder Niederdruck (LPA). Maximale Sauerstoffversorgung, Wurzelhaar-Entwicklung und Pythium-Prävention.
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Ziel-pH Nährlösung:</span>
                  <span className="text-white font-bold">5.6 – 6.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Nährstoff-Dynamik:</span>
                  <span className="text-cyan-300 font-bold">Direktaufnahme</span>
                </div>
                <div className="flex justify-between">
                  <span>Hauptrisiko:</span>
                  <span className="text-rose-400">Pythium &gt;21°C / Düsen</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <span
                className={`text-xs font-bold inline-flex items-center gap-1 ${
                  selectedMethod === 'aeroponic' ? 'text-cyan-400' : 'text-slate-400'
                }`}
              >
                {selectedMethod === 'aeroponic' ? 'Ausgewählt' : 'Aeroponik wählen'} &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Configuration for Soil if selected */}
        {selectedMethod === 'soil' && (
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 mb-5 space-y-3 animate-in fade-in duration-150 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300 pb-2 border-b border-slate-800">
              <Sprout className="w-4 h-4 text-amber-400" />
              <span>Boden- & Substratdetails konfigurieren:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Substrat-Typ:</label>
                <select
                  value={tempSoilData.substrateType}
                  onChange={(e) =>
                    setTempSoilData({ ...tempSoilData, substrateType: e.target.value as any })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                >
                  <option value="biobizz_light">BioBizz Light Mix (Schwach vorgedüngt)</option>
                  <option value="biobizz_all">BioBizz All Mix (Stark vorgedüngt)</option>
                  <option value="living_soil">Living Soil / No-Till (Mikrobiell aktiv)</option>
                  <option value="plagron_grow">Plagron Growmix</option>
                  <option value="coco_perlite">Kokos / Perlit (Hydro-Substrat)</option>
                  <option value="compost_organic">Eigene Kompost- / Erdmischung</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Topfgröße & Art:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={tempSoilData.potSizeLiters}
                    onChange={(e) =>
                      setTempSoilData({ ...tempSoilData, potSizeLiters: e.target.value })
                    }
                    className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white font-mono"
                  />
                  <select
                    value={tempSoilData.potType}
                    onChange={(e) =>
                      setTempSoilData({ ...tempSoilData, potType: e.target.value as any })
                    }
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white"
                  >
                    <option value="stofftopf">Stofftopf (Gronest/Root Pouch)</option>
                    <option value="airpot">Air-Pot (Superoots)</option>
                    <option value="kunststoff">Klassischer Kunststofftopf</option>
                    <option value="autopot">AutoPot Bewässerungstopf</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Düngekonzept:</label>
                <select
                  value={tempSoilData.fertilizerRegime}
                  onChange={(e) =>
                    setTempSoilData({ ...tempSoilData, fertilizerRegime: e.target.value as any })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                >
                  <option value="organisch (BioBizz/Guanokalong)">Organisch flüssig (BioBizz, etc.)</option>
                  <option value="living_soil_no_till">Living Soil (Nur Wasser & Top-Dress)</option>
                  <option value="mineralisch (Canna Terra/Hesi)">Mineralisch (Canna Terra, Hesi)</option>
                  <option value="komposttee">Wurmhumus & Komposttees</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Bewässerungs-Auswahl (nur bei Soil) */}
        {selectedMethod === 'soil' ? (
          <div className="mb-5">
            <h3 className="text-sm font-bold text-slate-300 mb-3">Bewässerung</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIrrigation('manual')}
                className={`p-4 rounded-xl border text-left transition ${
                  irrigation === 'manual'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900/60'
                }`}
              >
                <div className="text-lg">🖐️</div>
                <div className="text-xs font-bold text-white mt-1">Manuell</div>
                <div className="text-[10px] text-slate-400">
                  Gießkanne / Hand — du misst pH & EC pro Gießvorgang selbst
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIrrigation('auto')}
                className={`p-4 rounded-xl border text-left transition ${
                  irrigation === 'auto'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-700 bg-slate-900/60'
                }`}
              >
                <div className="text-lg">⏱️</div>
                <div className="text-xs font-bold text-white mt-1">Automatisch</div>
                <div className="text-[10px] text-slate-400">
                  Tropfsystem / AutoPot — Tank, Druck, Intervalle
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200">
            ⏱️ Aeroponik läuft grundsätzlich mit automatischen Sprühzyklen (HPA/LPA) — die Bewässerung wird auf <b>Automatisch</b> gesetzt.
          </div>
        )}

        {/* Footer Confirmation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Du kannst das Verfahren später jederzeit im Header mit einem Klick wechseln.</span>
          </div>

          <button
            onClick={handleConfirm}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 ${
              selectedMethod === 'soil'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-900/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-900/30'
            }`}
          >
            <span>Verfahren festlegen & fortfahren</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
