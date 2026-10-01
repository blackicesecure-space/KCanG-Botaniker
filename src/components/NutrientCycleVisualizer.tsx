import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceArea,
} from 'recharts';
import { NUTRIENT_CYCLE_CURVE } from '../data/telemetryData';
import { NutrientPhaseCurvePoint } from '../types/rootLog';
import {
  Activity,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Beaker,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const NutrientCycleVisualizer: React.FC = () => {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(4); // Default to Bloom W1
  const [displayMode, setDisplayMode] = useState<'ec_and_npk' | 'npk_only' | 'ec_only'>('ec_and_npk');

  const activePoint: NutrientPhaseCurvePoint = NUTRIENT_CYCLE_CURVE[selectedWeekIndex];

  const CustomCycleTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: NutrientPhaseCurvePoint = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[220px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-sans">
            <span className="font-bold text-white">{data.weekLabel}: {data.phase}</span>
          </div>

          <div className="space-y-1 font-sans">
            <div className="flex justify-between items-center text-cyan-300">
              <span className="text-slate-400">Ziel-EC Korridor:</span>
              <span className="font-mono font-bold text-cyan-300">
                {data.targetEcOptimal} mS/cm ({data.targetEcMin}–{data.targetEcMax})
              </span>
            </div>

            <div className="flex justify-between items-center text-purple-300">
              <span className="text-slate-400">Soll-pH:</span>
              <span className="font-mono font-bold text-purple-300">{data.phTarget.toFixed(1)}</span>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-800/80 text-[11px]">
              <span className="text-blue-400">N: {data.n}</span>
              <span className="text-amber-400">P: {data.p}</span>
              <span className="text-rose-400">K: {data.k}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <span className="text-teal-400">Ca: {data.ca}</span>
              <span className="text-emerald-400">Mg: {data.mg}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Title & View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Nährstoffbedarf & Idealer EC-Verlauf (Woche 1 bis 12)
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Phasen-Kurve
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Dynamischer N-P-K-Ca-Mg Bedarf und optimaler aeroponischer EC-Korridor von Keimung bis Spülen.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setDisplayMode('ec_and_npk')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
              displayMode === 'ec_and_npk'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Kombi: EC & N-P-K
          </button>
          <button
            onClick={() => setDisplayMode('ec_only')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
              displayMode === 'ec_only'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Nur EC-Korridor
          </button>
          <button
            onClick={() => setDisplayMode('npk_only')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
              displayMode === 'npk_only'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Nur N-P-K Verhältnisse
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={NUTRIENT_CYCLE_CURVE}
            margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
            onClick={(state: any) => {
              if (state && typeof state.activeTooltipIndex === 'number') {
                setSelectedWeekIndex(state.activeTooltipIndex);
              }
            }}
          >
            <defs>
              <linearGradient id="ecAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            <XAxis
              dataKey="weekLabel"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={false}
            />

            {/* Left Y Axis for Relative NPK Units (0 - 180) */}
            <YAxis
              yAxisId="npk"
              domain={[0, 180]}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              unit=""
            />

            {/* Right Y Axis for EC in mS/cm (0.0 - 2.2) */}
            <YAxis
              yAxisId="ec"
              orientation="right"
              domain={[0, 2.2]}
              stroke="#06b6d4"
              tick={{ fill: '#22d3ee', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              unit=" mS"
            />

            <Tooltip content={<CustomCycleTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-slate-300 font-sans">{value}</span>}
            />

            {/* EC Area and Target Line */}
            {(displayMode === 'ec_and_npk' || displayMode === 'ec_only') && (
              <>
                <Area
                  yAxisId="ec"
                  type="monotone"
                  dataKey="targetEcOptimal"
                  name="Ziel-EC (mS/cm)"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#ecAreaGradient)"
                  dot={{ r: 4, fill: '#06b6d4', stroke: '#fff' }}
                />
                <Line
                  yAxisId="ec"
                  type="monotone"
                  dataKey="targetEcMax"
                  name="Max-Toleranz EC"
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  dot={false}
                />
              </>
            )}

            {/* NPK Lines */}
            {(displayMode === 'ec_and_npk' || displayMode === 'npk_only') && (
              <>
                <Line
                  yAxisId="npk"
                  type="monotone"
                  dataKey="n"
                  name="Stickstoff (N)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#3b82f6' }}
                />
                <Line
                  yAxisId="npk"
                  type="monotone"
                  dataKey="p"
                  name="Phosphor (P)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#f59e0b' }}
                />
                <Line
                  yAxisId="npk"
                  type="monotone"
                  dataKey="k"
                  name="Kalium (K)"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#f43f5e' }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Week Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {NUTRIENT_CYCLE_CURVE.map((point, idx) => (
          <button
            key={point.weekLabel}
            onClick={() => setSelectedWeekIndex(idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition shrink-0 flex flex-col items-center ${
              selectedWeekIndex === idx
                ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-900/40 ring-1 ring-purple-400'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{point.weekLabel}</span>
            <span className="text-[10px] opacity-75 font-sans truncate max-w-[65px]">{point.phase.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Selected Phase Detail Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {activePoint.weekLabel}
            </span>
            <h5 className="text-sm font-bold text-white">{activePoint.phase}</h5>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">
              Opt. EC: <strong className="text-cyan-400">{activePoint.targetEcOptimal} mS/cm</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Bereich: <span className="text-slate-200">{activePoint.targetEcMin} – {activePoint.targetEcMax}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              pH: <strong className="text-purple-400">{activePoint.phTarget}</strong>
            </span>
          </div>
        </div>

        {/* Nutritional Breakdown Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Stickstoff (N):</span>
              <span className="font-mono text-blue-400 font-bold">{activePoint.n}</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: `${(activePoint.n / 130) * 100}%` }} />
            </div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Phosphor (P):</span>
              <span className="font-mono text-amber-400 font-bold">{activePoint.p}</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full" style={{ width: `${(activePoint.p / 140) * 100}%` }} />
            </div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Kalium (K):</span>
              <span className="font-mono text-rose-400 font-bold">{activePoint.k}</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full" style={{ width: `${(activePoint.k / 180) * 100}%` }} />
            </div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Calcium (Ca):</span>
              <span className="font-mono text-teal-400 font-bold">{activePoint.ca}</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full" style={{ width: `${(activePoint.ca / 100) * 100}%` }} />
            </div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Magnesium (Mg):</span>
              <span className="font-mono text-emerald-400 font-bold">{activePoint.mg}</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${(activePoint.mg / 70) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Botanical Instruction */}
        <p className="text-xs text-slate-300 leading-relaxed pt-1">
          <strong className="text-white">Botanische Empfehlung für {activePoint.phase}:</strong>{' '}
          {activePoint.description}
        </p>
      </div>
    </div>
  );
};
