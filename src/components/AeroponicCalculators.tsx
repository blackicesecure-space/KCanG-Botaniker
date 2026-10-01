import React, { useState } from 'react';
import { calculateVPD, getDissolvedOxygenSaturation, getNutrientAvailabilityAtPh } from '../utils/vpd';
import { NutrientCycleVisualizer } from './NutrientCycleVisualizer';
import { useCultivationSystem } from '../context/CultivationSystemContext';
import { useGrowConfig } from '../config/GrowConfigContext';
import { loadWateringLog, saveWateringEntry, deleteWateringEntry, WateringLogEntry } from '../data/wateringLog';
import {
  SlidersHorizontal,
  Droplets,
  Wind,
  Thermometer,
  ShieldAlert,
  Beaker,
  Gauge,
  HelpCircle,
  Clock,
  Sparkles,
  Info,
  Sprout,
  Scale,
  FileText,
  Trash2,
} from 'lucide-react';

export const AeroponicCalculators: React.FC = () => {
  const { method } = useCultivationSystem();
  const { config } = useGrowConfig();
  const isSoil = method === 'soil';
  const isAutoIrrigation = config.irrigation !== 'manual';

  // VPD Calculator state
  const [vpdAirTemp, setVpdAirTemp] = useState<number>(24.5);
  const [vpdHumidity, setVpdHumidity] = useState<number>(55);
  const [vpdLeafOffset, setVpdLeafOffset] = useState<number>(-1.5);

  // Spray Interval Calculator state (Aeroponic)
  const [systemCategory, setSystemCategory] = useState<'HPA' | 'LPA'>('HPA');
  const [pressureBar, setPressureBar] = useState<number>(6.5);
  const [secondsOn, setSecondsOn] = useState<number>(3);
  const [secondsOff, setSecondsOff] = useState<number>(180);

  // Soil Gießassistent (Abfluss-Methode) state
  const [litersUntilRunoff, setLitersUntilRunoff] = useState<string>('2.0');
  const runoffVolume = parseFloat(litersUntilRunoff) || 0;
  const topUpMl = Math.round(runoffVolume * 0.2 * 1000); // 20 % Nachgießmenge

  // Watering Log State
  const [wateringLogs, setWateringLogs] = useState<WateringLogEntry[]>(loadWateringLog());
  const [logWeek, setLogWeek] = useState<number>(3);
  const [logInputPh, setLogInputPh] = useState<number>(6.4);
  const [logInputEc, setLogInputEc] = useState<number>(1.4);
  const [logDrainPh, setLogDrainPh] = useState<string>('');
  const [logDrainEc, setLogDrainEc] = useState<string>('');
  const [logAmount, setLogAmount] = useState<string>('2.5');

  const handleAddWateringLog = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: WateringLogEntry = {
      id: `w-${Date.now()}`,
      timestamp: Date.now(),
      week: logWeek,
      inputPh: logInputPh,
      inputEc: logInputEc,
      drainPh: logDrainPh ? parseFloat(logDrainPh) : undefined,
      drainEc: logDrainEc ? parseFloat(logDrainEc) : undefined,
      amountLiters: logAmount ? parseFloat(logAmount) : undefined,
    };
    saveWateringEntry(entry);
    setWateringLogs(loadWateringLog());
    setLogDrainPh('');
    setLogDrainEc('');
  };

  // pH Bioavailability state
  const [simulatedPh, setSimulatedPh] = useState<number>(isSoil ? 6.4 : 5.8);
  const nutrientAvailability = getNutrientAvailabilityAtPh(simulatedPh);

  // Water Temp & DO state
  const [simulatedWaterTemp, setSimulatedWaterTemp] = useState<number>(19.5);

  // VPD calculations
  const vpdResult = calculateVPD(vpdAirTemp, vpdHumidity, vpdLeafOffset);

  // Spray calculations
  const totalCycleSeconds = secondsOn + secondsOff;
  const cyclesPerHour = totalCycleSeconds > 0 ? (3600 / totalCycleSeconds) : 0;
  const runtimeMinutesPerDay = totalCycleSeconds > 0 ? ((secondsOn * cyclesPerHour * 24) / 60) : 0;
  const dropletSize = systemCategory === 'HPA' ? '30 – 50 µm (Echter Schwebenebel)' : '100 – 150 µm (Pralltropfen)';

  // DO & Pythium
  const doResult = getDissolvedOxygenSaturation(simulatedWaterTemp);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isSoil
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {isSoil ? 'Boden- & VPD-Kalkulatoren (Soil System)' : 'Botanische Aeroponik-Kalkulatoren & Analysetools'}
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isSoil
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                }`}
              >
                {isSoil ? 'Bodenkultur Modus' : 'Aeroponik Modus'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isSoil
                ? 'Physiologische Berechnungen für Dampfdruckdefizit (VPD), 1/3-Gießmengenregel, Substratgewicht & pH-Nährstoffaufnahmekurven in Erde.'
                : 'Physiologische Berechnungen für Dampfdruckdefizit (VPD), HPA/LPA-Sprühzyklen, pH-Verfügbarkeitskurven & Sauerstoffsättigung.'}
            </p>
          </div>
        </div>
      </div>

      {/* Nutrient Cycle & Ideal EC Curve Visualizer */}
      <NutrientCycleVisualizer />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOOL 1: VPD & TRANSPIRATIONS-RECHNER */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-bold text-white">Vapor Pressure Deficit (VPD Rechner)</h4>
            </div>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                vpdResult.status === 'Optimal'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              }`}
            >
              {vpdResult.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] font-mono uppercase text-slate-400">Blatt-VPD (Leaf VPD)</span>
              <div className="my-1 flex items-baseline gap-1">
                <span className={`text-3xl font-black font-mono tracking-tight ${vpdResult.color}`}>
                  {vpdResult.vpdLeaf.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-slate-400">kPa</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Stomata-Leitfähigkeit: {vpdResult.status === 'Optimal' ? '100% aktiv' : 'Eingeschränkt'}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] font-mono uppercase text-slate-400">Luft-VPD (Air VPD)</span>
              <div className="my-1 flex items-baseline gap-1">
                <span className="text-3xl font-black font-mono tracking-tight text-slate-300">
                  {vpdResult.vpdAir.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-slate-400">kPa</span>
              </div>
              <div className="text-[10px] text-slate-400">Referenz bei gleicher Blatttemperatur</div>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Raumtemperatur Luft:</span>
                <span className="font-mono font-bold text-white">{vpdAirTemp.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="18"
                max="34"
                step="0.5"
                value={vpdAirTemp}
                onChange={(e) => setVpdAirTemp(parseFloat(e.target.value))}
                className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Relative Luftfeuchtigkeit (RLF):</span>
                <span className="font-mono font-bold text-white">{vpdHumidity}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="85"
                step="1"
                value={vpdHumidity}
                onChange={(e) => setVpdHumidity(parseInt(e.target.value, 10))}
                className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Blatt-Temperatur-Offset:</span>
                <span className="font-mono text-slate-300">{vpdLeafOffset.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="1.0"
                step="0.1"
                value={vpdLeafOffset}
                onChange={(e) => setVpdLeafOffset(parseFloat(e.target.value))}
                className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* TOOL 2: SYSTEM-SPEZIFISCHER RECHNER (SOIL GIEßASSISTENT vs. AERO INTERVALL) */}
        {isSoil ? (
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Boden-Gießassistent (Abfluss-Methode)</h4>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                Anti-Staunässe
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Langsam gießen, bis unten die ersten Tropfen kommen. Diese Menge eintragen — die App sagt dir, wie viel du für eine verwertbare Drain-Messung nachgießen solltest.
            </p>

            <div>
              <label className="block text-slate-400 mb-1 text-xs">
                Liter bis erster Abfluss:
              </label>
              <input
                type="number" step="0.1" min="0"
                value={litersUntilRunoff}
                onChange={(e) => setLitersUntilRunoff(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <span className="text-slate-400 text-xs">Empfohlene Nachgießmenge (20 %):</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">+{topUpMl} ml</div>
              <p className="text-[10px] text-slate-400 pt-1">
                Damit entsteht genug Abfluss, um Drain-pH und Drain-EC zuverlässig zu messen. Drain-EC &gt; Eingangs-EC = Salzaufbau im Substrat.
              </p>
            </div>

            <div className="text-[10px] text-slate-500">
              💡 Faustregel: Gesamtmenge pro Gießvorgang ≈ ⅓ des Topfvolumens. Weicht die Abflussmenge deutlich ab, ist das Substrat zu trocken oder noch zu nass.
            </div>
          </div>
        ) : isAutoIrrigation ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Aeroponik-Sprühintervall Rechner</h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSystemCategory('HPA');
                    setSecondsOn(3);
                    setSecondsOff(180);
                    setPressureBar(6.5);
                  }}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold transition ${
                    systemCategory === 'HPA' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  HPA
                </button>
                <button
                  onClick={() => {
                    setSystemCategory('LPA');
                    setSecondsOn(20);
                    setSecondsOff(60);
                    setPressureBar(2.2);
                  }}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold transition ${
                    systemCategory === 'LPA' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  LPA
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <span className="text-slate-400">Tröpfchengröße:</span>
                <div className="font-bold text-cyan-300 font-mono text-sm mt-0.5">{dropletSize}</div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {systemCategory === 'HPA'
                    ? 'Perfekte Schwebeteilchen für maximale Wurzelhaardichte ohne Sauerstoffbarriere.'
                    : 'Große Tropfen erfordern längere Zyklen; Gefahr des Durchnässens (Wurzeln wie in DWC).'}
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <span className="text-slate-400">Laufzeit pro Tag:</span>
                <div className="font-bold text-white font-mono text-sm mt-0.5">
                  {runtimeMinutesPerDay.toFixed(1)} Min / 24h
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Zyklen pro Stunde: <strong className="text-cyan-400 font-mono">{cyclesPerHour.toFixed(1)}x</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Sprühzeit AN (Sekunden):</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={secondsOn}
                  onChange={(e) => setSecondsOn(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Pause AUS (Sekunden):</label>
                <input
                  type="number"
                  min="10"
                  max="600"
                  value={secondsOff}
                  onChange={(e) => setSecondsOff(parseInt(e.target.value, 10) || 10)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono font-bold"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
            <div className="text-2xl">🖐️</div>
            <h4 className="text-sm font-bold text-white">Manuelle Bewässerung aktiv</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Der Sprühzyklus-Rechner ist nur bei automatischen Pumpen- und Aeroponiksystemen relevant.
            </p>
          </div>
        )}

        {/* TOOL 3: pH-NÄHRSTOFF-BIOVERFÜGBARKEIT */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">
                {isSoil ? 'pH-Verfügbarkeit in Erde & Substrat' : 'pH-Nährstoff-Bioverfügbarkeits-Simulator'}
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
              Simulierter pH: {simulatedPh.toFixed(1)}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>{isSoil ? 'Boden- / Gießwasser-pH:' : 'Nährlösungs-pH:'}</span>
              <span className="font-mono font-bold text-emerald-400">{simulatedPh.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="4.5"
              max="7.5"
              step="0.1"
              value={simulatedPh}
              onChange={(e) => setSimulatedPh(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Sauer (4.5)</span>
              <span className={isSoil ? 'text-amber-400 font-bold' : 'text-slate-400'}>Erde Optimum (6.2–6.8)</span>
              <span className={!isSoil ? 'text-emerald-400 font-bold' : 'text-slate-400'}>Aero Optimum (5.6–6.0)</span>
              <span>Alkalisch (7.5)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {nutrientAvailability.map((elem) => (
              <div key={elem.name} className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="font-semibold text-slate-300">
                    {elem.name} ({elem.symbol})
                  </span>
                  <span className={elem.availability > 80 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono font-bold'}>
                    {elem.availability}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      elem.availability > 80 ? 'bg-emerald-500' : elem.availability > 55 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${elem.availability}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOOL 4: SAUERSTOFFSÄTTIGUNG & WURZELGESUNDHEIT */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-rose-400" />
              <h4 className="text-sm font-bold text-white">
                {isSoil ? 'Gießwassertemperatur & O₂-Löslichkeit' : 'Gelöster Sauerstoff (DO) & Pythium-Index'}
              </h4>
            </div>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                doResult.pythiumRiskLevel.includes('Gefahr') || doResult.pythiumRiskLevel.includes('kritisch')
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              }`}
            >
              Risiko: {doResult.pythiumRiskLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] font-mono uppercase text-slate-400">O₂-Sättigung</span>
              <div className="my-1 flex items-baseline gap-1">
                <span className="text-3xl font-black font-mono tracking-tight text-cyan-300">
                  {doResult.mgPerLiter}
                </span>
                <span className="text-xs font-mono text-slate-400">mg/L</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Physikalisches Maximum bei {simulatedWaterTemp.toFixed(1)} °C
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400">Fäulnis-Aktivität</span>
                <div className={`text-sm font-bold mt-1 ${doResult.riskColor}`}>
                  {simulatedWaterTemp >= 22.0 ? 'HOCH / PYTHIUM-GEFAHR' : simulatedWaterTemp <= 19.5 ? 'OPTIMAL / GEHEMMT' : 'ERHÖHT'}
                </div>
              </div>
              <div className="text-[10px] text-slate-500">
                {isSoil ? 'Zu warmes Gießwasser reduziert Wurzelatmung in Erde.' : 'Oomyceten lieben anaerobes, warmes Wasser.'}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>{isSoil ? 'Gießwassertemperatur simulieren:' : 'Nährlösungstemperatur simulieren:'}</span>
              <span className="font-mono font-bold text-white">{simulatedWaterTemp.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="15"
              max="28"
              step="0.5"
              value={simulatedWaterTemp}
              onChange={(e) => setSimulatedWaterTemp(parseFloat(e.target.value))}
              className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* TOOL 5: GIEß-PROTOKOLL & DRAIN-VERGLEICH (SOIL) */}
        {isSoil && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 md:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Gieß-Protokoll & Drain-Vergleich (Soll vs. Ist)</h4>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                {wateringLogs.length} Einträge
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Erfasse hier deine Gießvorgänge mit Eingangswerten und Drain-Messungen. Ist der Drain-EC &gt; Gieß-EC + 0.4 mS/cm, droht ein Salzaufbau (Versalzung), und es sollte mit reinem Wasser gespült werden.
            </p>

            {/* Form */}
            <form onSubmit={handleAddWateringLog} className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Woche:</label>
                <input
                  type="number" min="1" max="16"
                  value={logWeek}
                  onChange={(e) => setLogWeek(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Gieß-pH:</label>
                <input
                  type="number" step="0.1" min="4" max="8"
                  value={logInputPh}
                  onChange={(e) => setLogInputPh(parseFloat(e.target.value) || 6.4)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Gieß-EC:</label>
                <input
                  type="number" step="0.1" min="0" max="3"
                  value={logInputEc}
                  onChange={(e) => setLogInputEc(parseFloat(e.target.value) || 1.4)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Drain-pH:</label>
                <input
                  type="number" step="0.1" min="4" max="8" placeholder="optional"
                  value={logDrainPh}
                  onChange={(e) => setLogDrainPh(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Drain-EC:</label>
                <input
                  type="number" step="0.1" min="0" max="4" placeholder="optional"
                  value={logDrainEc}
                  onChange={(e) => setLogDrainEc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition text-xs"
                >
                  Speichern
                </button>
              </div>
            </form>

            {/* Entries list */}
            {wateringLogs.length > 0 ? (
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-slate-300">Letzte Gießprotokolle:</h5>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {wateringLogs.slice(-5).reverse().map((item) => {
                    const isSaltIssue = item.drainEc && item.drainEc > item.inputEc + 0.4;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                        <div className="flex items-center gap-3 font-mono flex-wrap">
                          <span className="text-emerald-400 font-bold">W{item.week}</span>
                          <span className="text-slate-400">{new Date(item.timestamp).toLocaleDateString('de-DE')}</span>
                          <span>In: pH {item.inputPh} / EC {item.inputEc}</span>
                          {item.drainEc !== undefined && (
                            <span className={isSaltIssue ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                              Drain: pH {item.drainPh ?? '—'} / EC {item.drainEc} {isSaltIssue ? '⚠️ (Salzaufbau)' : ''}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            deleteWateringEntry(item.id);
                            setWateringLogs(loadWateringLog());
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Eintrag löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">Noch keine Gießprotokolle erfasst.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
