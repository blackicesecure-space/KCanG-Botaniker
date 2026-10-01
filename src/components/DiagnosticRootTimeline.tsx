import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';
import { RootHealthLog } from '../types/rootLog';
import { INITIAL_ROOT_LOGS } from '../data/telemetryData';
import {
  Clock,
  Activity,
  Microscope,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Info,
  Beaker,
  Thermometer,
} from 'lucide-react';

interface DiagnosticRootTimelineProps {
  onSelectEventLog?: (log: RootHealthLog) => void;
}

export const DiagnosticRootTimeline: React.FC<DiagnosticRootTimelineProps> = ({
  onSelectEventLog,
}) => {
  // Retrieve root logs from localStorage or default initial logs
  const rootLogs: RootHealthLog[] = useMemo(() => {
    const saved = localStorage.getItem('kcang_root_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ROOT_LOGS;
      }
    }
    return INITIAL_ROOT_LOGS;
  }, []);

  const [selectedLogId, setSelectedLogId] = useState<string>(rootLogs[0]?.id || '');
  const [metricMode, setMetricMode] = useState<'both' | 'ph' | 'ec'>('both');

  // Synthesize a correlated chronological timeline of 7 days (day -6 to day 0)
  // Mapping the historical root events accurately onto pH and EC fluctuations
  const timelineData = useMemo(() => {
    const days: {
      dayLabel: string;
      dayIndex: number;
      timestamp: number;
      dateFormatted: string;
      ph: number;
      ec: number;
      waterTemp: number;
      pythiumRisk: number;
      eventTitle?: string;
      hasEvent: boolean;
      eventLog?: RootHealthLog;
    }[] = [];

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Days from -6 to 0 (Today)
    const dayTemplates = [
      {
        offset: 6,
        dayLabel: 'Tag -6',
        dateFormatted: 'Vor 6 Tagen',
        ph: 6.45,
        ec: 1.72,
        waterTemp: 24.2,
        pythiumRisk: 88,
        matchId: 'root-log-1',
      },
      {
        offset: 5,
        dayLabel: 'Tag -5',
        dateFormatted: 'Vor 5 Tagen',
        ph: 6.35,
        ec: 1.62,
        waterTemp: 22.8,
        pythiumRisk: 75,
      },
      {
        offset: 4,
        dayLabel: 'Tag -4',
        dateFormatted: 'Vor 4 Tagen',
        ph: 6.1,
        ec: 1.48,
        waterTemp: 21.0,
        pythiumRisk: 58,
      },
      {
        offset: 3,
        dayLabel: 'Tag -3',
        dateFormatted: 'Vor 3 Tagen',
        ph: 5.85,
        ec: 1.32,
        waterTemp: 19.1,
        pythiumRisk: 42,
        matchId: 'root-log-2',
      },
      {
        offset: 2,
        dayLabel: 'Tag -2',
        dateFormatted: 'Vor 2 Tagen',
        ph: 5.82,
        ec: 1.35,
        waterTemp: 18.9,
        pythiumRisk: 28,
      },
      {
        offset: 1,
        dayLabel: 'Tag -1',
        dateFormatted: 'Gestern',
        ph: 5.8,
        ec: 1.4,
        waterTemp: 18.8,
        pythiumRisk: 15,
      },
      {
        offset: 0,
        dayLabel: 'Heute',
        dateFormatted: 'Heute (Aktuell)',
        ph: 5.82,
        ec: 1.45,
        waterTemp: 18.8,
        pythiumRisk: 8,
        matchId: 'root-log-3',
      },
    ];

    dayTemplates.forEach((t) => {
      // Find if an actual user log matches this time/day
      let matchedLog = rootLogs.find((l) => l.id === t.matchId);
      if (!matchedLog && t.offset === 0 && rootLogs.length > 0) {
        matchedLog = rootLogs[0]; // newest
      }

      days.push({
        dayLabel: t.dayLabel,
        dayIndex: 6 - t.offset,
        timestamp: now - t.offset * oneDay,
        dateFormatted: t.dateFormatted,
        ph: matchedLog ? matchedLog.phAtCheck : t.ph,
        ec: matchedLog ? matchedLog.ecAtCheck : t.ec,
        waterTemp: matchedLog ? matchedLog.waterTempAtCheck : t.waterTemp,
        pythiumRisk: matchedLog ? matchedLog.pythiumRiskScore : t.pythiumRisk,
        hasEvent: Boolean(matchedLog),
        eventTitle: matchedLog
          ? `Befund: ${matchedLog.colorGrade.replace('_', ' ').toUpperCase()} (${matchedLog.plantOrBatch})`
          : undefined,
        eventLog: matchedLog,
      });
    });

    return days;
  }, [rootLogs]);

  // Selected Log object
  const activeSelectedLog = useMemo(() => {
    return rootLogs.find((l) => l.id === selectedLogId) || rootLogs[0];
  }, [rootLogs, selectedLogId]);

  // Custom Timeline Tooltip
  const CustomTimelineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs font-mono space-y-2 min-w-[240px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-sans">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {data.dayLabel} ({data.dateFormatted})
            </span>
            {data.hasEvent && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1 font-semibold">
                <Microscope className="w-3 h-3 text-teal-400" />
                Root Log
              </span>
            )}
          </div>

          <div className="space-y-1 font-sans">
            <div className="flex justify-between items-center text-amber-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Beaker className="w-3 h-3 text-amber-400" /> pH-Wert:
              </span>
              <span className="font-mono font-bold text-amber-300">{data.ph.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-cyan-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Activity className="w-3 h-3 text-cyan-400" /> EC-Wert:
              </span>
              <span className="font-mono font-bold text-cyan-300">{data.ec.toFixed(2)} mS/cm</span>
            </div>

            <div className="flex justify-between items-center text-rose-300 pt-1 border-t border-slate-800/80">
              <span className="flex items-center gap-1 text-slate-400">
                <Thermometer className="w-3 h-3 text-rose-400" /> Nährlösungs-Temp:
              </span>
              <span className="font-mono font-bold text-rose-300">{data.waterTemp.toFixed(1)} °C</span>
            </div>

            <div className="flex justify-between items-center text-teal-300">
              <span className="text-slate-400">Pythium-Risikoindex:</span>
              <span className="font-mono font-bold text-teal-300">{data.pythiumRisk} / 100</span>
            </div>

            {data.eventLog && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-teal-200 bg-teal-950/40 p-1.5 rounded">
                <strong>Ereignis:</strong> {data.eventLog.notes.substring(0, 90)}...
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Title & Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Korrelations-Zeitstrahl: pH/EC-Messhistorie & Wurzel-Ereignisse
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Letzte 7 Tage
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Verknüpft chemische Nährlösungs-Schwankungen direkt mit den optischen & olfaktorischen Befunden des RootHealthTrackers.
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setMetricMode('both')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
              metricMode === 'both'
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            pH & EC Kombi
          </button>
          <button
            onClick={() => setMetricMode('ph')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              metricMode === 'ph'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Beaker className="w-3 h-3 text-amber-400" />
            <span>Nur pH</span>
          </button>
          <button
            onClick={() => setMetricMode('ec')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              metricMode === 'ec'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>Nur EC</span>
          </button>
        </div>
      </div>

      {/* Correlated Recharts Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={timelineData}
            margin={{ top: 15, right: 20, left: -20, bottom: 0 }}
            onClick={(state: any) => {
              if (state && typeof state.activeTooltipIndex === 'number') {
                const clickedDay = timelineData[state.activeTooltipIndex];
                if (clickedDay?.eventLog) {
                  setSelectedLogId(clickedDay.eventLog.id);
                  if (onSelectEventLog) onSelectEventLog(clickedDay.eventLog);
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            <XAxis
              dataKey="dayLabel"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={false}
            />

            {/* Left Y-Axis for pH (5.0 to 7.0) */}
            <YAxis
              yAxisId="ph"
              domain={[5.0, 7.0]}
              stroke="#f59e0b"
              tick={{ fill: '#fbbf24', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              unit=" pH"
            />

            {/* Right Y-Axis for EC (0.5 to 2.2 mS/cm) */}
            <YAxis
              yAxisId="ec"
              orientation="right"
              domain={[0.5, 2.2]}
              stroke="#06b6d4"
              tick={{ fill: '#22d3ee', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              unit=" mS"
            />

            <Tooltip content={<CustomTimelineTooltip />} />

            {/* pH Optimal Zone Reference Area (5.6 - 6.0) */}
            <ReferenceArea
              yAxisId="ph"
              y1={5.6}
              y2={6.0}
              fill="#10b981"
              fillOpacity={0.07}
              strokeOpacity={0}
            />

            {/* Ideal pH line at 5.8 */}
            <ReferenceLine
              yAxisId="ph"
              y={5.8}
              stroke="#10b981"
              strokeDasharray="2 2"
              strokeOpacity={0.5}
            />

            {/* Lines */}
            {(metricMode === 'both' || metricMode === 'ph') && (
              <Line
                yAxisId="ph"
                type="monotone"
                dataKey="ph"
                name="pH-Wert"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#f59e0b', stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#f59e0b' }}
              />
            )}

            {(metricMode === 'both' || metricMode === 'ec') && (
              <Line
                yAxisId="ec"
                type="monotone"
                dataKey="ec"
                name="EC (mS/cm)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#06b6d4', stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#06b6d4' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Timeline Event Markers */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Microscope className="w-3.5 h-3.5 text-teal-400" />
            Wurzel-Ereignisse auf dem Zeitstrahl auswählen:
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Klicke ein Ereignis zur Korrelations-Inspektion
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {timelineData
            .filter((d) => d.hasEvent && d.eventLog)
            .map((item) => {
              const log = item.eventLog!;
              const isSelected = log.id === selectedLogId;
              const isDanger = log.pythiumRiskScore >= 60;
              const isWarning = log.pythiumRiskScore >= 30 && log.pythiumRiskScore < 60;

              return (
                <button
                  key={log.id}
                  onClick={() => {
                    setSelectedLogId(log.id);
                    if (onSelectEventLog) onSelectEventLog(log);
                  }}
                  className={`text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-teal-400 shadow-md shadow-teal-950/40 ring-1 ring-teal-400'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-teal-400" />
                      {item.dayLabel} ({item.dateFormatted})
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isDanger
                          ? 'bg-rose-500/20 text-rose-300'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      Pythium {log.pythiumRiskScore}%
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-white truncate mb-1">
                    {log.colorGrade.replace('_', ' ').toUpperCase()} • {log.plantOrBatch}
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-2">
                    {log.notes}
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                    <span>pH: <strong className="text-amber-400">{log.phAtCheck}</strong></span>
                    <span>•</span>
                    <span>EC: <strong className="text-cyan-400">{log.ecAtCheck}</strong></span>
                    <span>•</span>
                    <span>H₂O: <strong className="text-rose-400">{log.waterTempAtCheck}°C</strong></span>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Selected Event Details Callout */}
      {activeSelectedLog && (
        <div className="bg-slate-950/80 border border-teal-500/30 rounded-xl p-3.5 text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-teal-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Botanische Korrelations-Analyse zu diesem Ereignis:
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {activeSelectedLog.plantOrBatch} ({activeSelectedLog.phase} W{activeSelectedLog.week})
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed">
            {activeSelectedLog.pythiumRiskScore >= 60 ? (
              <>
                <strong className="text-rose-400">Physiologische Kausalität:</strong> Am Tag dieser Inspektion lag der pH-Wert bei {activeSelectedLog.phAtCheck} und die Wassertemperatur bei {activeSelectedLog.waterTempAtCheck} °C. Die Kombination aus erhöhter Wassertemperatur (&gt;21°C) und EC {activeSelectedLog.ecAtCheck} mS/cm hat zu Hypoxie (Sauerstoffmangel) geführt, wodurch das Pythium-Myzel den charakteristischen Schleimfilm bilden konnte.
              </>
            ) : activeSelectedLog.pythiumRiskScore >= 30 ? (
              <>
                <strong className="text-amber-400">Stabilisierungsphase:</strong> Nach Senkung der Nährlösungstemperatur auf {activeSelectedLog.waterTempAtCheck} °C und Einregulierung des pH-Wertes auf {activeSelectedLog.phAtCheck} begann die Neubildung vitaler weißer Wurzelspitzen.
              </>
            ) : (
              <>
                <strong className="text-emerald-400">Regeneriertes Optimum:</strong> Bei pH {activeSelectedLog.phAtCheck} und kühlen {activeSelectedLog.waterTempAtCheck} °C ist die Sauerstoffsättigung optimal. Der pelzartige Besatz mit Trichoblasten (Wurzelhaaren) belegt maximale Nährstoffaufnahme im Nebel.
              </>
            )}
          </p>

          {activeSelectedLog.treatmentApplied && (
            <div className="text-emerald-300 text-[11px] bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/20">
              <strong>Angewandte Therapie:</strong> {activeSelectedLog.treatmentApplied}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
