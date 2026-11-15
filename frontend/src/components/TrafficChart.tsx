import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export interface TrafficDataPoint {
  time: string;
  pps: number;
  bandwidth_kbps: number;
  is_anomaly: boolean;
  threat_type?: string;
}

interface TrafficChartProps {
  data: TrafficDataPoint[];
  isAnomalyActive: boolean;
}

export const TrafficChart: React.FC<TrafficChartProps> = ({ data, isAnomalyActive }) => {
  return (
    <div className={`p-5 rounded-xl bg-defense-card border transition-all ${
      isAnomalyActive ? 'border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.25)]' : 'border-defense-border'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold font-mono tracking-wider text-slate-100 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isAnomalyActive ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
            LIVE NETWORK TRAFFIC TELEMETRY (REAL-TIME)
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Pemantauan lonjakan paket per detik (PPS) & ambang batas anomali AI
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-400 rounded-full" />
            <span className="text-slate-300">Normal (PPS)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-red-500 rounded-full" />
            <span className="text-red-400">Anomali Spike</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ppsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isAnomalyActive ? "#EF4444" : "#10B981"} stopOpacity={0.6}/>
                <stop offset="95%" stopColor={isAnomalyActive ? "#EF4444" : "#10B981"} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#64748B" 
              tick={{ fontSize: 10, fontFamily: 'monospace' }} 
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#64748B" 
              tick={{ fontSize: 10, fontFamily: 'monospace' }}
              domain={[0, 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as TrafficDataPoint;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl font-mono text-xs text-slate-200">
                      <div className="text-slate-400 mb-1">{item.time}</div>
                      <div className="font-bold text-emerald-400">
                        Kecepatan: {item.pps} paket/dtk
                      </div>
                      <div className="text-blue-400">
                        Bandwidth: {item.bandwidth_kbps.toFixed(1)} KB/s
                      </div>
                      {item.is_anomaly && (
                        <div className="text-red-400 font-bold mt-1 pt-1 border-t border-slate-700">
                          ⚠️ {item.threat_type || 'ANOMALI TERDETEKSI'}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="pps"
              stroke={isAnomalyActive ? "#EF4444" : "#10B981"}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#ppsGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
