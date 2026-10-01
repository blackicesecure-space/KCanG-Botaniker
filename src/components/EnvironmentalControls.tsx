import React, { useMemo, useState } from 'react';
import { useEnvironment } from '../context/EnvironmentContext';
import { useGrowConfig } from '../config/GrowConfigContext';
import { EnvironmentalHistoryChart } from './EnvironmentalHistoryChart';
import { AlertThresholdSettingsModal } from './AlertThresholdSettingsModal';
import { VivosunInterfaceModal } from './VivosunInterfaceModal';
import { generate24hHistory } from '../data/telemetryData';
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Sun,
  Moon,
  Activity,
  Zap,
  RotateCcw,
  Sliders,
  Flame,
  Snowflake,
  Fan,
  Beaker,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Play,
  ArrowRight,
  Radio,
  Settings2,
} from 'lucide-react';

interface EnvironmentalControlsProps {
  onTransferToDiagnosis: () => void;
}

export const EnvironmentalControls: React.FC<EnvironmentalControlsProps> = ({ onTransferToDiagnosis }) => {
  const {
    settings,
    telemetry,
    updateSettings,
    updateTelemetry,
    toggleDayNight,
    toggleActuator,
    resetToOptimal,
    injectStressScenario,
  } = useEnvironment();

  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [vivosunModalOpen, setVivosunModalOpen] = useState(false);
  const { config } = useGrowConfig();
  const isManualIrrigation = config.irrigation === 'manual';
  const isSoil = config.system === 'soil';

  // Generate and align 24h history data, with the latest point reflecting current live telemetry
  const historyData = useMemo(() => {
    const data = generate24hHistory();
    if (data.length > 0) {
      data[data.length - 1] = {
        ...data[data.length - 1],
        airTemp: telemetry.airTemp,
        humidity: telemetry.humidity,
        vpd: telemetry.vpd,
        waterTemp: telemetry.waterTemp,
        ph: telemetry.ph,
        ec: telemetry.ec,
        co2: telemetry.co2Ppm,
        isLightOn: settings.isDayCycle,
      };
    }
    return data;
  }, [telemetry, settings.isDayCycle]);

  const isDay = settings.isDayCycle;

  // Status evaluators
  const phStatus =
    telemetry.ph < settings.phTargetMin
      ? 'Zu sauer'
      : telemetry.ph > settings.phTargetMax
      ? 'Zu alkalisch'
      : 'Optimal';
  const phColor = phStatus === 'Optimal' ? 'text-emerald-400' : 'text-rose-400';

  const ecStatus =
    telemetry.ec < settings.ecTargetMin
      ? 'Zu niedrig'
      : telemetry.ec > settings.ecTargetMax
      ? 'Zu hoch'
      : 'Optimal';
  const ecColor = ecStatus === 'Optimal' ? 'text-emerald-400' : 'text-amber-400';

  const waterTempStatus =
    telemetry.waterTemp > 21.0
      ? 'Pythium-Risiko (>21°C)'
      : telemetry.waterTemp < settings.waterTempTargetMin
      ? 'Zu kühl (<18°C)'
      : 'Optimal (18–20°C)';
  const waterTempColor =
    telemetry.waterTemp > 21.0 ? 'text-rose-400' : telemetry.waterTemp < 18.0 ? 'text-blue-400' : 'text-emerald-400';

  const humidityStatus =
    telemetry.humidity < settings.humidityTargetMin
      ? 'Zu trocken (<40%)'
      : telemetry.humidity > settings.humidityTargetMax
      ? 'Zu feucht (>60%)'
      : 'Optimal (40–60%)';
  const humidityColor = humidityStatus.includes('Optimal') ? 'text-emerald-400' : 'text-amber-400';

  const tempMinTarget = isDay ? settings.tempDayTargetMin : settings.tempNightTargetMin;
  const tempMaxTarget = isDay ? settings.tempDayTargetMax : settings.tempNightTargetMax;
  const tempStatus =
    telemetry.airTemp < tempMinTarget
      ? 'Zu kühl'
      : telemetry.airTemp > tempMaxTarget
      ? 'Hitzestress'
      : 'Optimal (20–26°C)';
  const tempColor = tempStatus.includes('Optimal') ? 'text-emerald-400' : 'text-rose-400';

  const co2Status = !isDay
    ? 'Dunkelphase (Inaktiv)'
    : telemetry.co2Ppm < 800
    ? 'Unter 800 ppm'
    : telemetry.co2Ppm > 1200
    ? 'Über 1200 ppm'
    : 'Optimal (800–1200 ppm)';
  const co2Color = !isDay
    ? 'text-slate-400'
    : co2Status.includes('Optimal')
    ? 'text-emerald-400'
    : 'text-amber-400';

  return (
    <>
      <div className="space-y-6">
        {/* Top Header / Mode Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Klimacomputer & Nährlösungs-Sensortechnik
                  <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Telemetrie
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Kontinuierliche Regelung von RLF (40–60%), CO₂ (800–1200 ppm), Temperatur & Hydro/Aero-Sonden (pH, EC, Temp).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Day / Night Cycle Button */}
            <button
              onClick={toggleDayNight}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition shadow-sm ${
                isDay
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/20'
                  : 'bg-indigo-950/60 border-indigo-500/30 text-indigo-200 hover:bg-indigo-900/50'
              }`}
            >
              {isDay ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>{isDay ? 'Lichtphase (Tag: 20–26°C, CO₂ An)' : 'Dunkelphase (Nacht: 18–21°C, CO₂ Aus)'}</span>
            </button>

            {/* Reset to Optimal */}
            <button
              onClick={resetToOptimal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Alle Parameter auf perfekte Sollwerte zurücksetzen"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sollwerte laden</span>
            </button>

            {/* Individual Alarm Thresholds Settings Button */}
            <button
              onClick={() => setThresholdModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition shadow-sm"
              title="Alarmschwellen für pH, EC und Temperatur anpassen"
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Alarmschwellen</span>
            </button>

            {/* VIVOSUN App Interface Button */}
            <button
              onClick={() => setVivosunModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 transition shadow-sm"
              title="VIVOSUN Smart Grow App & Hub E42A API Schnittstelle"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>VIVOSUN App</span>
            </button>

            {/* Send to Botanical Diagnosis */}
            <button
              onClick={onTransferToDiagnosis}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition"
            >
              <span>Werte ins Diagnose-Labor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Stress Test Simulation Pills */}
        <div className="pt-4 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Sensor-Stresstest simulieren:
          </span>
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => injectStressScenario('pythium')}
              className="px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 transition"
            >
              ⚠️ Wassertemperatur 24.5 °C (Pythium-Risiko)
            </button>
            <button
              onClick={() => injectStressScenario('phLockout')}
              className="px-2.5 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900/50 border border-amber-500/30 text-amber-300 transition"
            >
              ⚠️ pH-Drift 6.85 & EC 1.85 (Lockout)
            </button>
            <button
              onClick={() => injectStressScenario('co2Drop')}
              className="px-2.5 py-1 rounded-lg bg-blue-950/50 hover:bg-blue-900/50 border border-blue-500/30 text-blue-300 transition"
            >
              ⚠️ CO₂-Flasche leer (510 ppm)
            </button>
            <button
              onClick={() => injectStressScenario('heatHumidity')}
              className="px-2.5 py-1 rounded-lg bg-orange-950/50 hover:bg-orange-900/50 border border-orange-500/30 text-orange-300 transition"
            >
              ⚠️ Hitzestau 29.5 °C & RLF 34%
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Historical 24h Telemetry Chart */}
      <EnvironmentalHistoryChart historyData={historyData} />

      {/* Grid of 4 Control Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* BLOCK 1: NÄHRLÖSUNG HYDRO/AEROPONIK vs SOIL DRAIN */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Beaker className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isSoil ? 'Klimacomputer & Boden-Sensortechnik' : 'Nährlösungs-Monitoring (Hydro & Aero)'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isSoil ? 'Gieß- & Drain-Kontrolle für Substrat' : 'Kontinuierliche Sondenüberwachung im Reservoir'}
                </p>
              </div>
            </div>
            {isSoil ? (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                Soil Mode
              </span>
            ) : (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Tank: {telemetry.reservoirLevelPercent}%
              </span>
            )}
          </div>

          {isSoil ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <h5 className="text-xs font-bold text-white">Gieß- & Drain-Monitoring (Soil)</h5>
              <p className="text-[11px] text-slate-400">
                Kein Reservoir — bei Erde zählt, was reingeht und was unten rauskommt.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400">Gießwasser-pH (Eingang)</div>
                  <div className="text-lg font-bold text-white font-mono">6.4</div>
                  <div className="text-[10px] text-slate-500">Ziel 6.2–6.8</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400">Drain-pH (Abfluss)</div>
                  <div className="text-lg font-bold text-white font-mono">—</div>
                  <div className="text-[10px] text-slate-500">nach Gießen eintragen</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400">Gießwasser-EC</div>
                  <div className="text-lg font-bold text-white font-mono">—</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400">Drain-EC</div>
                  <div className="text-lg font-bold text-white font-mono">—</div>
                  <div className="text-[10px] text-slate-500">Drain &gt; Eingang = Salzaufbau</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                📋 Werte kommen aus dem Gieß-Protokoll — dieses Panel ist die Live-Anzeige.
              </p>
            </div>
          ) : (
            <>
              {/* Sonden-Trio (pH, EC, Temp) */}
              <div className="grid grid-cols-3 gap-3">
                {/* pH Sensor */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-slate-400">pH-Sonde</span>
                    <span className={`text-[10px] font-bold ${phColor}`}>{phStatus}</span>
                  </div>
                  <div className="my-2">
                    <span className={`text-2xl font-black font-mono tracking-tight ${phColor}`}>
                      {telemetry.ph.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1 flex justify-between">
                    <span>Ziel:</span>
                    <span className="font-mono text-slate-300">{settings.phTargetMin}–{settings.phTargetMax}</span>
                  </div>
                </div>

                {/* EC Sensor */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-slate-400">EC-Sonde</span>
                    <span className={`text-[10px] font-bold ${ecColor}`}>{ecStatus}</span>
                  </div>
                  <div className="my-2">
                    <span className={`text-2xl font-black font-mono tracking-tight ${ecColor}`}>
                      {telemetry.ec.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">mS/cm</span>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1 flex justify-between">
                    <span>Ziel:</span>
                    <span className="font-mono text-slate-300">{settings.ecTargetMin}–{settings.ecTargetMax}</span>
                  </div>
                </div>

                {/* Wassertemperatur Sensor */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-slate-400">Wassertemp</span>
                    <span className={`text-[10px] font-bold ${waterTempColor}`}>
                      {telemetry.waterTemp > 21 ? 'Pythium!' : 'OK'}
                    </span>
                  </div>
                  <div className="my-2">
                    <span className={`text-2xl font-black font-mono tracking-tight ${waterTempColor}`}>
                      {telemetry.waterTemp.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">°C</span>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1 flex justify-between">
                    <span>Ziel:</span>
                    <span className="font-mono text-slate-300">18.0–20.0 °C</span>
                  </div>
                </div>
              </div>

              {/* Sauerstoffgehalt (DO) & Chiller Info */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Snowflake className={`w-4 h-4 ${telemetry.waterChillerActive ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-medium text-slate-200">
                      Wasserkühler (Chiller):{' '}
                      <span className={telemetry.waterChillerActive ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                        {telemetry.waterChillerActive ? 'AKTIV (Kühlt auf 18.5°C)' : 'Bereitschaft'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Gelöster Sauerstoff: <span className="font-mono text-emerald-400 font-semibold">{telemetry.dissolvedOxygen} mg/L</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleActuator('waterChillerActive')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    telemetry.waterChillerActive
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {telemetry.waterChillerActive ? 'Chiller Aus' : 'Chiller Ein'}
                </button>
              </div>

              {/* Feinjustierung Sliders */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Manuelle pH-Sondenkalibrierung:</span>
                  <span className="font-mono font-bold text-cyan-300">{telemetry.ph.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="4.5"
                  max="7.5"
                  step="0.05"
                  value={telemetry.ph}
                  onChange={(e) => updateTelemetry({ ph: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between items-center text-slate-300 pt-1">
                  <span>Wassertemperatur-Regler:</span>
                  <span className="font-mono font-bold text-cyan-300">{telemetry.waterTemp.toFixed(1)} °C</span>
                </div>
                <input
                  type="range"
                  min="15.0"
                  max="27.0"
                  step="0.2"
                  value={telemetry.waterTemp}
                  onChange={(e) => updateTelemetry({ waterTemp: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </>
          )}
        </div>

          {/* Feinjustierung Sliders */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Manuelle pH-Sondenkalibrierung:</span>
              <span className="font-mono font-bold text-cyan-300">{telemetry.ph.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="4.5"
              max="7.5"
              step="0.05"
              value={telemetry.ph}
              onChange={(e) => updateTelemetry({ ph: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between items-center text-slate-300 pt-1">
              <span>Wassertemperatur-Regler:</span>
              <span className="font-mono font-bold text-cyan-300">{telemetry.waterTemp.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="15.0"
              max="27.0"
              step="0.2"
              value={telemetry.waterTemp}
              onChange={(e) => updateTelemetry({ waterTemp: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* BLOCK 2: LUFTFEUCHTIGKEITS-REGELUNG (Ziel 40-60%) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Luftfeuchtigkeits-Regelung (RLF)</h4>
                <p className="text-xs text-slate-400">Automatische Hysterese (Zielkorridor: 40–60%)</p>
              </div>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
              humidityStatus.includes('Optimal')
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
            }`}>
              {humidityStatus}
            </span>
          </div>

          {/* RLF Main Gauge & VPD Link */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] font-mono uppercase text-slate-400">Ist-Feuchte</div>
              <div className="my-1 flex items-baseline gap-1">
                <span className={`text-3xl font-black font-mono tracking-tight ${humidityColor}`}>
                  {telemetry.humidity.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-400">% RLF</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Zielkorridor: <span className="font-mono text-emerald-400">40 – 60 %</span>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400">Vapor Pressure Deficit</div>
                <div className="my-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black font-mono tracking-tight text-white">
                    {telemetry.vpd.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">kPa</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400">
                Optimum: <span className="font-mono text-slate-300">0.8–1.2 (Vegi) | 1.2–1.5 (Blüte)</span>
              </div>
            </div>
          </div>

          {/* Aktoren: Befeuchter / Entfeuchter */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              telemetry.humidifierActive
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <Droplets className={`w-4 h-4 ${telemetry.humidifierActive ? 'text-blue-400 animate-pulse' : 'text-slate-600'}`} />
                <span>Befeuchter</span>
              </div>
              <button
                onClick={() => toggleActuator('humidifierActive')}
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  telemetry.humidifierActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {telemetry.humidifierActive ? 'AN' : 'AUS'}
              </button>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              telemetry.dehumidifierActive
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <Wind className={`w-4 h-4 ${telemetry.dehumidifierActive ? 'text-amber-400 animate-spin' : 'text-slate-600'}`} />
                <span>Entfeuchter</span>
              </div>
              <button
                onClick={() => toggleActuator('dehumidifierActive')}
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  telemetry.dehumidifierActive ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {telemetry.dehumidifierActive ? 'AN' : 'AUS'}
              </button>
            </div>
          </div>

          {/* RLF Schieberegler */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Sensorfeuchte simulieren:</span>
              <span className="font-mono font-bold text-blue-300">{telemetry.humidity.toFixed(0)} %</span>
            </div>
            <input
              type="range"
              min="25"
              max="85"
              value={telemetry.humidity}
              onChange={(e) => updateTelemetry({ humidity: parseFloat(e.target.value) })}
              className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* BLOCK 3: CO2-ANREICHERUNG (Ziel 800-1200 ppm im Lichtzyklus) - Nur bei Hydro/Aero */}
        {!isSoil && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">CO₂-Anreicherung (Begasung)</h4>
                  <p className="text-xs text-slate-400">Target: 800–1200 ppm bei Licht | Nachts inaktiv</p>
                </div>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                co2Status.includes('Optimal')
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              }`}>
                {co2Status}
              </span>
            </div>

            {/* CO2 Main Reading */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400">NDIR CO₂-Sensor</div>
                <div className="my-1 flex items-baseline gap-1">
                  <span className={`text-3xl font-black font-mono tracking-tight ${co2Color}`}>
                    {telemetry.co2Ppm}
                  </span>
                  <span className="text-sm font-bold text-slate-400">ppm</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Sollwert bei Licht: <span className="font-mono text-emerald-400">{settings.co2TargetPpm} ppm</span>
                </div>
              </div>

              <div className="text-right space-y-1.5">
                <div className="text-[11px] text-slate-400">Magnetventil Flasche:</div>
                <div className="flex items-center justify-end gap-1.5">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      telemetry.co2SolenoidOpen ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                    }`}
                  />
                  <span className={`text-xs font-mono font-bold ${telemetry.co2SolenoidOpen ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {telemetry.co2SolenoidOpen ? 'VENTIL OFFEN' : 'GESCHLOSSEN'}
                  </span>
                </div>
                <button
                  onClick={() => toggleActuator('co2SolenoidOpen')}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono"
                >
                  Ventil manuell schalten
                </button>
              </div>
            </div>

            {/* Botanische Info & Nachtschutz */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-white">Physiologischer Grundsatz:</strong> Cannabis assimiliert CO₂ ausschließlich bei laufender Lichtreaktion. In der Dunkelphase schalten die Stomata ab und es findet Zellatmung statt; eine CO₂-Zufuhr bei Nacht wird vom System automatisch gesperrt.
              </p>
            </div>

            {/* CO2 Schieberegler */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>CO₂-Sensorwert justieren:</span>
                <span className="font-mono font-bold text-emerald-300">{telemetry.co2Ppm} ppm</span>
              </div>
              <input
                type="range"
                min="400"
                max="1600"
                step="25"
                value={telemetry.co2Ppm}
                onChange={(e) => updateTelemetry({ co2Ppm: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* BLOCK 4: PRÄZISE TEMPERATURREGELUNG (Tag 20-26°C, Nacht 18-21°C) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Präzise Temperaturregelung</h4>
                <p className="text-xs text-slate-400">
                  Tag: {settings.tempDayTargetMin}–{settings.tempDayTargetMax}°C | Nacht: {settings.tempNightTargetMin}–{settings.tempNightTargetMax}°C
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
              tempStatus.includes('Optimal')
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
            }`}>
              {tempStatus}
            </span>
          </div>

          {/* Temperature Gauges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] font-mono uppercase text-slate-400">Growbox Luft</div>
              <div className="my-1 flex items-baseline gap-1">
                <span className={`text-3xl font-black font-mono tracking-tight ${tempColor}`}>
                  {telemetry.airTemp.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-400">°C</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Modus: <span className="font-semibold text-slate-300">{isDay ? 'Licht (Tag)' : 'Dunkel (Nacht)'}</span>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400">Abluftventilator (EC/PWM)</div>
                <div className="my-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black font-mono tracking-tight text-white">
                    {telemetry.exhaustFanSpeedPercent}
                  </span>
                  <span className="text-xs font-mono text-slate-400">% PWM</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400">
                Aktivkohlefilter Druckausgleich aktiv
              </div>
            </div>
          </div>

          {/* Heizung & Klimakühlung Aktoren */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              telemetry.heaterActive
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${telemetry.heaterActive ? 'text-rose-400 animate-bounce' : 'text-slate-600'}`} />
                <span>Heizung</span>
              </div>
              <button
                onClick={() => toggleActuator('heaterActive')}
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  telemetry.heaterActive ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {telemetry.heaterActive ? 'AN' : 'AUS'}
              </button>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              telemetry.acActive
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <Snowflake className={`w-4 h-4 ${telemetry.acActive ? 'text-cyan-400 animate-spin' : 'text-slate-600'}`} />
                <span>Klimakühlung (AC)</span>
              </div>
              <button
                onClick={() => toggleActuator('acActive')}
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  telemetry.acActive ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {telemetry.acActive ? 'AN' : 'AUS'}
              </button>
            </div>
          </div>

          {/* Raumtemperatur Schieberegler */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Temperaturregler simulieren:</span>
              <span className="font-mono font-bold text-orange-300">{telemetry.airTemp.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="16.0"
              max="34.0"
              step="0.2"
              value={telemetry.airTemp}
              onChange={(e) => updateTelemetry({ airTemp: parseFloat(e.target.value) })}
              className="w-full accent-orange-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      <AlertThresholdSettingsModal
        isOpen={thresholdModalOpen}
        onClose={() => setThresholdModalOpen(false)}
      />

      <VivosunInterfaceModal
        isOpen={vivosunModalOpen}
        onClose={() => setVivosunModalOpen(false)}
      />
    </>
  );
};
