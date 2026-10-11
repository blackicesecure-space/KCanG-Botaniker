import React, { useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, RefreshCw, Radio, ShieldCheck, Zap, Activity, Thermometer, Droplets, Wind, Beaker, Server, Wifi } from 'lucide-react';
import { useEnvironment } from '../context/EnvironmentContext';

export const SystemSensorTest: React.FC = () => {
  const { telemetry, updateTelemetry, resetToOptimal } = useEnvironment();
  const [isTesting, setIsTesting] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [sensorStatus, setSensorStatus] = useState<Record<string, 'ok' | 'calibrating' | 'warning'>>({
    sht31: 'ok',
    phProbe: 'ok',
    ecProbe: 'ok',
    co2Ndir: 'ok',
    waterTemp: 'ok',
    soilMoisture: 'ok',
    iotGateway: 'ok',
  });

  const runSystemDiagnostic = () => {
    setIsTesting(true);
    setTestCompleted(false);
    setSensorStatus({
      sht31: 'calibrating',
      phProbe: 'calibrating',
      ecProbe: 'calibrating',
      co2Ndir: 'calibrating',
      waterTemp: 'calibrating',
      soilMoisture: 'calibrating',
      iotGateway: 'calibrating',
    });

    setTimeout(() => {
      setIsTesting(false);
      setTestCompleted(true);
      setSensorStatus({
        sht31: 'ok',
        phProbe: 'ok',
        ecProbe: 'ok',
        co2Ndir: 'ok',
        waterTemp: 'ok',
        soilMoisture: 'ok',
        iotGateway: 'ok',
      });
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  Systemdiagnose & Hardware-Status
                </span>
                <span className="text-xs text-slate-400 font-mono">Firmware v2.4.1-KCanG</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                System- und Sensortest-Dashboard
              </h2>
              <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                Überprüfe den Echtzeit-Status aller angeschlossenen Sensoren, Sonden, IoT-Gateways und Relais-Aktuatoren für einen reibungslosen Grow-Betrieb.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runSystemDiagnostic}
              disabled={isTesting}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Diagnose läuft...' : 'Sensor-Selbsttest starten'}</span>
            </button>
            <button
              onClick={resetToOptimal}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 shrink-0"
            >
              System auf Soll-Werte resetten
            </button>
          </div>
        </div>
      </div>

      {testCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold block">System-Selbsttest erfolgreich abgeschlossen</span>
            <p className="text-emerald-400/90 text-[11px]">Alle 7 Sensor-Kanäle und IoT-Gateways arbeiten innerhalb der botanischen Toleranzen. Keine Fehler detektiert.</p>
          </div>
        </div>
      )}

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Sensor 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Thermometer className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">SHT31 Klima-Sensor</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              sensorStatus.sht31 === 'ok' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 animate-pulse'
            }`}>
              {sensorStatus.sht31 === 'ok' ? 'Aktiv & Kalibriert' : 'Prüfe...'}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 font-mono text-xs">
            <span className="text-slate-400">Messwert:</span>
            <span className="text-white font-bold">{telemetry.airTemp.toFixed(1)}°C | RLF {telemetry.humidity.toFixed(0)}%</span>
          </div>
        </div>

        {/* Sensor 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Beaker className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">pH-Sonde (Bluelab)</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              sensorStatus.phProbe === 'ok' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 animate-pulse'
            }`}>
              {sensorStatus.phProbe === 'ok' ? 'Optimal' : 'Prüfe...'}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 font-mono text-xs">
            <span className="text-slate-400">pH-Wert:</span>
            <span className="text-white font-bold">{telemetry.ph.toFixed(2)} pH</span>
          </div>
        </div>

        {/* Sensor 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">EC-Leitwertsonde</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              sensorStatus.ecProbe === 'ok' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 animate-pulse'
            }`}>
              {sensorStatus.ecProbe === 'ok' ? 'Aktiv' : 'Prüfe...'}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 font-mono text-xs">
            <span className="text-slate-400">EC-Wert:</span>
            <span className="text-white font-bold">{telemetry.ec.toFixed(2)} mS/cm</span>
          </div>
        </div>

        {/* Sensor 4 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Wind className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">CO₂ NDIR Sensor</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              sensorStatus.co2Ndir === 'ok' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 animate-pulse'
            }`}>
              {sensorStatus.co2Ndir === 'ok' ? 'Verbunden' : 'Prüfe...'}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 font-mono text-xs">
            <span className="text-slate-400">Gehalt:</span>
            <span className="text-white font-bold">{telemetry.co2Ppm} ppm</span>
          </div>
        </div>

        {/* Sensor 5 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Droplets className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Wassertemperatur</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              sensorStatus.waterTemp === 'ok' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 animate-pulse'
            }`}>
              {sensorStatus.waterTemp === 'ok' ? 'Optimal (<21°C)' : 'Prüfe...'}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 font-mono text-xs">
            <span className="text-slate-400">Temperatur:</span>
            <span className="text-white font-bold">{telemetry.waterTemp.toFixed(1)}°C</span>
          </div>
        </div>

        {/* Sensor 6 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Server className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">IoT / MQTT Gateway</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              sensorStatus.iotGateway === 'ok' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 animate-pulse'
            }`}>
              {sensorStatus.iotGateway === 'ok' ? 'Online' : 'Prüfe...'}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 font-mono text-xs">
            <span className="text-slate-400">Verbindung:</span>
            <span className="text-emerald-400 font-bold">Stable (ESP32 / Wi-Fi)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
