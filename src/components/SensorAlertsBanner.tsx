import React, { useState } from 'react';
import { useEnvironment } from '../context/EnvironmentContext';
import { useGrowConfig } from '../config/GrowConfigContext';
import { AlertThresholdSettingsModal } from './AlertThresholdSettingsModal';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
  Volume2,
  VolumeX,
  Settings2,
} from 'lucide-react';

interface SensorAlertsBannerProps {
  onTransferToDiagnosis?: () => void;
}

export const SensorAlertsBanner: React.FC<SensorAlertsBannerProps> = ({ onTransferToDiagnosis }) => {
  const { alerts, clearAlert, soundAlertsEnabled, setSoundAlertsEnabled } = useEnvironment();
  const { config } = useGrowConfig();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const isSoil = config.system === 'soil';
  const corridorDescription = isSoil
    ? 'Soil / Erde: pH 6.2–6.8, EC max 2.0 mS/cm, Wassertemp max 23 °C'
    : 'Aeroponik: pH 5.5–6.1, EC max 1.8 mS/cm, Wassertemp max 21 °C';

  if (alerts.length === 0) {
    return (
      <>
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-200">Alle Vitalparameter im botanischen Optimum</h4>
              <p className="text-xs text-emerald-400/80">
                {corridorDescription} • RLF (40–60%), CO₂ (800–1200 ppm) sind ideal abgestimmt.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Alarmschwellen anpassen"
            >
              <Settings2 className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title={soundAlertsEnabled ? 'Akustischer Alarm aktiv' : 'Akustischer Alarm stumm'}
            >
              {soundAlertsEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              0 Warnungen
            </span>
          </div>
        </div>

        <AlertThresholdSettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
        />
      </>
    );
  }

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className={`w-4 h-4 ${criticalCount > 0 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Echtzeit-Gefahrenmelder ({alerts.length} {alerts.length === 1 ? 'Abweichung' : 'Abweichungen'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onTransferToDiagnosis && (
              <button
                onClick={onTransferToDiagnosis}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-md transition hover:bg-emerald-900/60"
              >
                Werte in Diagnoseformular laden
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setSettingsModalOpen(true)}
              className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition flex items-center gap-1 text-xs"
              title="Individuelle Alarmschwellen für pH, EC & Temperatur festlegen"
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Schwellen</span>
            </button>

            <button
              onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title={soundAlertsEnabled ? 'Akustischer Alarm aktiv' : 'Akustischer Alarm stumm'}
            >
              {soundAlertsEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {alerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                className={`relative rounded-xl p-3.5 border transition-all ${
                  isCritical
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-100 shadow-lg shadow-rose-950/20'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-100'
                }`}
              >
                <button
                  onClick={() => clearAlert(alert.id)}
                  className="absolute top-2.5 right-2.5 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
                  title="Meldung ausblenden"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 p-2 rounded-lg ${
                      isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {isCritical ? <AlertOctagon className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1 pr-6 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                          isCritical ? 'bg-rose-500/30 text-rose-200 font-bold' : 'bg-amber-500/30 text-amber-200'
                        }`}
                      >
                        {alert.parameter} • {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">Ziel: {alert.targetRange}</span>
                      <span className="text-[11px] font-mono text-slate-400">Zeit: {alert.timestamp}</span>
                    </div>

                    <h5 className="text-sm font-semibold text-white">{alert.title}</h5>

                    <p className="text-xs text-slate-300 leading-relaxed">{alert.botanicalExplanation}</p>

                    <div className="pt-1.5 border-t border-white/10 mt-1 flex items-start gap-1.5 text-xs text-emerald-300">
                      <span className="font-semibold text-emerald-400 shrink-0">Sofortmaßnahme:</span>
                      <span>{alert.immediateAction}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AlertThresholdSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </>
  );
};
