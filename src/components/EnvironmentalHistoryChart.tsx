import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { HistoryDataPoint } from '../types/rootLog';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Moon,
  Clock,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface EnvironmentalHistoryChartProps {
  historyData: HistoryDataPoint[];
}

export const EnvironmentalHistoryChart: React.FC<EnvironmentalHistoryChartProps> = ({
  historyData,
}) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'temp' | 'humidity' | 'vpd'>('all');

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: HistoryDataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-sans">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {label} Uhr
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold ${
                data.isLightOn
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {data.isLightOn ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-400" />}
              {data.isLightOn ? 'Tag (Licht)' : 'Nacht (Dunkel)'}
            </span>
          </div>

          <div className="space-y-1 pt-1 font-sans">
            <div className="flex justify-between items-center text-orange-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Thermometer className="w-3 h-3 text-orange-400" /> Raumtemperatur:
              </span>
              <span className="font-mono font-bold text-orange-300">{data.airTemp.toFixed(1)} °C</span>
            </div>

            <div className="flex justify-between items-center text-blue-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Droplets className="w-3 h-3 text-blue-400" /> Luftfeuchtigkeit:
              </span>
              <span className="font-mono font-bold text-blue-300">{data.humidity.toFixed(1)} %</span>
            </div>

            <div className="flex justify-between items-center text-emerald-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Wind className="w-3 h-3 text-emerald-400" /> Blatt-VPD:
              </span>
              <span className="font-mono font-bold text-emerald-300">{data.vpd.toFixed(2)} kPa</span>
            </div>

            <div className="flex justify-between items-center text-cyan-300 pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Nährlösung H₂O:</span>
              <span className="font-mono font-bold text-cyan-300">{data.waterTemp.toFixed(1)} °C</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Top Bar with Title and Metric Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Historischer 24h-Verlauf: Temperatur, RLF & Blatt-VPD
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Recharts Live-Telemetry
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Überwachung der Tag-/Nacht-Fluktuation und Stomata-Transpiration zur Schimmel- und Stressprävention.
            </p>
          </div>
        </div>

        {/* View mode toggle pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
              activeMetric === 'all'
                ? 'bg-slate-700 text-white font-bold shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Alle 3 Kurven
          </button>
          <button
            onClick={() => setActiveMetric('temp')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              activeMetric === 'temp'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Thermometer className="w-3 h-3 text-orange-400" />
            <span>Temp (°C)</span>
          </button>
          <button
            onClick={() => setActiveMetric('humidity')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              activeMetric === 'humidity'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Droplets className="w-3 h-3 text-blue-400" />
            <span>RLF (%)</span>
          </button>
          <button
            onClick={() => setActiveMetric('vpd')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              activeMetric === 'vpd'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Wind className="w-3 h-3 text-emerald-400" />
            <span>VPD (kPa)</span>
          </button>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="vpdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={false}
            />
            {/* Primary Left Y Axis for Temperature & Humidity (0 - 80) */}
            <YAxis
              yAxisId="primary"
              domain={[10, 75]}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={false}
              unit=""
            />
            {/* Secondary Right Y Axis for VPD (0.0 - 2.5 kPa) */}
            <YAxis
              yAxisId="vpd"
              orientation="right"
              domain={[0, 2.4]}
              stroke="#10b981"
              tick={{ fill: '#34d399', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={false}
              unit=" kPa"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Target Korridore als Orientierungslinien */}
            <ReferenceLine
              yAxisId="primary"
              y={26}
              stroke="#f97316"
              strokeDasharray="2 2"
              strokeOpacity={0.5}
              label={{ value: 'Max Temp 26°C', fill: '#f97316', fontSize: 10, position: 'insideTopLeft' }}
            />
            <ReferenceLine
              yAxisId="primary"
              y={60}
              stroke="#3b82f6"
              strokeDasharray="2 2"
              strokeOpacity={0.5}
              label={{ value: 'Max RLF 60%', fill: '#3b82f6', fontSize: 10, position: 'insideTopLeft' }}
            />
            <ReferenceLine
              yAxisId="vpd"
              y={1.2}
              stroke="#10b981"
              strokeDasharray="2 2"
              strokeOpacity={0.6}
              label={{ value: 'Ziel VPD 1.2 kPa', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }}
            />

            {/* Area & Lines based on filter */}
            {(activeMetric === 'all' || activeMetric === 'temp') && (
              <Area
                yAxisId="primary"
                type="monotone"
                dataKey="airTemp"
                name="Temperatur (°C)"
                stroke="#f97316"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#f97316', stroke: '#fff' }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'humidity') && (
              <Area
                yAxisId="primary"
                type="monotone"
                dataKey="humidity"
                name="Luftfeuchtigkeit (%)"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#humidityGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff' }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'vpd') && (
              <Area
                yAxisId="vpd"
                type="monotone"
                dataKey="vpd"
                name="Blatt-VPD (kPa)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#vpdGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#10b981', stroke: '#fff' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Metric legend cards with instant reading */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
            <span className="text-slate-400">Temperatur (24h Schnitt):</span>
          </div>
          <span className="font-mono font-bold text-orange-400">
            {(historyData.reduce((acc, p) => acc + p.airTemp, 0) / historyData.length).toFixed(1)} °C
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span className="text-slate-400">RLF (24h Schnitt):</span>
          </div>
          <span className="font-mono font-bold text-blue-400">
            {(historyData.reduce((acc, p) => acc + p.humidity, 0) / historyData.length).toFixed(1)} %
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-400">VPD (24h Schnitt):</span>
          </div>
          <span className="font-mono font-bold text-emerald-400">
            {(historyData.reduce((acc, p) => acc + p.vpd, 0) / historyData.length).toFixed(2)} kPa
          </span>
        </div>
      </div>
    </div>
  );
};
