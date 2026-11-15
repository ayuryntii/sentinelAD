import React, { useEffect, useState } from 'react';
import { Shield, Radio, Activity, AlertOctagon, Terminal } from 'lucide-react';
import { OverviewStats } from '../types';

interface HeaderProps {
  isConnected: boolean;
  stats: OverviewStats | null;
  trafficSource: string;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, stats, trafficSource }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getDefconBadge = () => {
    const status = stats?.defcon_status || 'NORMAL';
    if (status === 'CRITICAL') {
      return 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse-fast';
    } else if (status === 'ELEVATED') {
      return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    } else if (status === 'GUARDED') {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
  };

  return (
    <header className="border-b border-defense-border bg-defense-surface/90 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Identitas Militer */}
        <div className="flex items-center gap-3.5">
          <div className="relative p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Shield className="w-7 h-7" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-defense-primary animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider text-slate-100 font-mono">
                SENTINEL<span className="text-defense-primary">AD</span>
              </h1>
              <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded font-mono bg-defense-army/40 text-emerald-300 border border-emerald-600/30">
                Pussiberad TNI AD
              </span>
              <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded font-mono bg-blue-950/60 text-blue-300 border border-blue-600/30 hidden sm:inline-block">
                Defensive Shield
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-tight">
              Sistem Penangkalan & Otomatisasi Respons Insiden | Kartika Cyber Hackathon 2026
            </p>
          </div>
        </div>

        {/* Telemetry Status, Defcon Level, Jam Taktis */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          {/* Defcon Indicator */}
          <div className={`px-3 py-1.5 rounded-md border flex items-center gap-2 ${getDefconBadge()}`}>
            <AlertOctagon className="w-4 h-4" />
            <span className="font-semibold tracking-wide">
              {stats?.defcon_level || 'DEFCON 4 (NORMAL)'}
            </span>
          </div>

          {/* Traffic Sniffer Status */}
          <div className="px-3 py-1.5 rounded-md bg-defense-card border border-defense-border text-slate-300 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-defense-primary" />
            <span className="text-slate-400">ENGINE:</span>
            <span className="text-emerald-400 font-medium">
              {trafficSource.includes('SIMULATION') ? 'SIMULATOR ACTIVE' : 'LIVE HYBRID'}
            </span>
          </div>

          {/* WebSocket Status */}
          <div className="px-3 py-1.5 rounded-md bg-defense-card border border-defense-border flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
            <span className="text-slate-400">TELEMETRY:</span>
            <span className={isConnected ? 'text-emerald-400' : 'text-red-400'}>
              {isConnected ? 'ONLINE' : 'CONNECTING'}
            </span>
          </div>

          {/* Tactical Clock */}
          <div className="px-3 py-1.5 rounded-md bg-slate-900 border border-defense-border text-emerald-400 font-bold">
            {timeStr}
          </div>
        </div>
      </div>
    </header>
  );
};
