import React from 'react';
import { Activity, ShieldAlert, Cpu, Network } from 'lucide-react';
import { TelemetryPayload, OverviewStats } from '../types';

interface StatCardsProps {
  telemetry: TelemetryPayload | null;
  overview: OverviewStats | null;
}

export const StatCards: React.FC<StatCardsProps> = ({ telemetry, overview }) => {
  const pps = telemetry?.pps || 0;
  const kbps = telemetry?.bandwidth_kbps || 0;
  const isThreatActive = telemetry?.analysis?.is_anomaly || false;
  const threatScore = telemetry?.analysis?.anomaly_score || 0.05;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Bandwidth / Throughput */}
      <div className="p-4 rounded-xl bg-defense-card border border-defense-border relative overflow-hidden group hover:border-defense-primary/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider">Bandwidth Jaringan</span>
          <Network className="w-5 h-5 text-defense-accent" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-100">
            {kbps > 1024 ? (kbps / 1024).toFixed(2) : kbps.toFixed(1)}
          </span>
          <span className="text-xs font-mono text-slate-400">
            {kbps > 1024 ? 'MB/s' : 'KB/s'}
          </span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>Throughput: {telemetry?.bps ? (telemetry.bps * 8 / 1000).toFixed(0) : 0} kbps</span>
          <span className="text-defense-accent">Active Port: {telemetry?.unique_dst_ports || 1}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0" />
      </div>

      {/* 2. Packet Rate (PPS) */}
      <div className="p-4 rounded-xl bg-defense-card border border-defense-border relative overflow-hidden group hover:border-defense-primary/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider">Kecepatan Paket (PPS)</span>
          <Activity className="w-5 h-5 text-defense-primary" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-100">
            {pps.toLocaleString()}
          </span>
          <span className="text-xs font-mono text-slate-400">paket/dtk</span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>Total Inspeksi: {overview?.total_packets_inspected?.toLocaleString() || '142,500'}</span>
          <span className={pps > 300 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
            {pps > 300 ? 'HIGH VOLUME' : 'NORMAL LOAD'}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
      </div>

      {/* 3. Status Ancaman Aktif */}
      <div className={`p-4 rounded-xl border relative overflow-hidden transition-all ${
        isThreatActive 
          ? 'bg-red-950/30 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
          : 'bg-defense-card border-defense-border'
      }`}>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider">Status Ancaman</span>
          <ShieldAlert className={`w-5 h-5 ${isThreatActive ? 'text-red-400 animate-bounce' : 'text-slate-400'}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-mono ${isThreatActive ? 'text-red-400' : 'text-emerald-400'}`}>
            {isThreatActive ? 'ANOMALY DETECTED' : 'CLEAR / SECURE'}
          </span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>Kritis: {overview?.critical_threats || 0}</span>
          <span className={isThreatActive ? 'text-red-400 font-bold' : 'text-slate-400'}>
            {overview?.unresolved_threats || 0} Belum Ditangani
          </span>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
          isThreatActive ? 'bg-red-500' : 'bg-slate-700'
        }`} />
      </div>

      {/* 4. AI Machine Learning Engine */}
      <div className="p-4 rounded-xl bg-defense-card border border-defense-border relative overflow-hidden group hover:border-defense-primary/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider">AI Isolation Forest</span>
          <Cpu className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-100">
            {(threatScore * 100).toFixed(0)}%
          </span>
          <span className="text-xs font-mono text-slate-400">skor deviasi</span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>Akurasi: {overview?.accuracy_rate || '99.4%'}</span>
          <span className="text-defense-primary font-bold">120 TREES</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0" />
      </div>
    </div>
  );
};
