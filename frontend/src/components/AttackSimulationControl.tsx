import React, { useState } from 'react';
import { Play, Square, Crosshair, Zap, ShieldAlert, KeyRound, Loader2 } from 'lucide-react';
import { SimulationState } from '../types';
import { triggerAttackSimulation, stopAttackSimulation } from '../services/api';

interface AttackSimulationControlProps {
  simulation: SimulationState | undefined;
  onSimulationChange?: () => void;
}

export const AttackSimulationControl: React.FC<AttackSimulationControlProps> = ({
  simulation,
  onSimulationChange
}) => {
  const [loading, setLoading] = useState(false);
  const isActive = simulation?.active || false;
  const currentAttack = simulation?.current_attack || 'NONE';
  const remaining = simulation?.remaining_seconds || 0;

  const handleTrigger = async (type: string) => {
    try {
      setLoading(true);
      await triggerAttackSimulation(type, 15);
      onSimulationChange?.();
    } catch (err) {
      console.error('Gagal memicu simulasi serangan', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      await stopAttackSimulation();
      onSimulationChange?.();
    } catch (err) {
      console.error('Gagal menghentikan simulasi', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-5 rounded-xl bg-defense-card border transition-all ${
      isActive ? 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-defense-border'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 flex items-center gap-2">
              <Crosshair className={`w-4 h-4 ${isActive ? 'text-amber-400 animate-spin' : 'text-defense-accent'}`} />
              PANEL KONTROL SIMULASI SERANGAN (HACKATHON DEMO)
            </h3>
            {isActive && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse">
                AKTIF: {currentAttack} ({remaining}s)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Uji responsivitas deteksi anomali AI secara langsung dengan 1 klik skenario serangan siber
          </p>
        </div>

        {isActive && (
          <button
            onClick={handleStop}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-mono text-xs font-bold transition-all"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5 fill-current" />}
            HENTIKAN SERANGAN
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Scenario 1: Port Scan */}
        <button
          onClick={() => handleTrigger('PORT_SCAN')}
          disabled={loading || (isActive && currentAttack === 'PORT_SCAN')}
          className={`p-3 rounded-lg border text-left transition-all ${
            isActive && currentAttack === 'PORT_SCAN'
              ? 'bg-amber-950/40 border-amber-500 text-amber-300 ring-1 ring-amber-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Crosshair className="w-4 h-4 text-amber-400" />
            <Play className="w-3 h-3 text-slate-400" />
          </div>
          <div className="font-mono text-xs font-bold">Port Scanning (Nmap)</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Reconnaissance 20-1024 port</div>
        </button>

        {/* Scenario 2: ICMP Flood */}
        <button
          onClick={() => handleTrigger('PING_FLOOD')}
          disabled={loading || (isActive && currentAttack === 'PING_FLOOD')}
          className={`p-3 rounded-lg border text-left transition-all ${
            isActive && currentAttack === 'PING_FLOOD'
              ? 'bg-red-950/40 border-red-500 text-red-300 ring-1 ring-red-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Zap className="w-4 h-4 text-red-400" />
            <Play className="w-3 h-3 text-slate-400" />
          </div>
          <div className="font-mono text-xs font-bold">ICMP / Ping Flood</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">DDoS 800+ PPS echo flood</div>
        </button>

        {/* Scenario 3: SYN Flood */}
        <button
          onClick={() => handleTrigger('SYN_FLOOD')}
          disabled={loading || (isActive && currentAttack === 'SYN_FLOOD')}
          className={`p-3 rounded-lg border text-left transition-all ${
            isActive && currentAttack === 'SYN_FLOOD'
              ? 'bg-red-950/40 border-red-500 text-red-300 ring-1 ring-red-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <Play className="w-3 h-3 text-slate-400" />
          </div>
          <div className="font-mono text-xs font-bold">TCP SYN Flood</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Exhaustion handshake socket</div>
        </button>

        {/* Scenario 4: SSH Brute Force */}
        <button
          onClick={() => handleTrigger('SSH_BRUTE_FORCE')}
          disabled={loading || (isActive && currentAttack === 'SSH_BRUTE_FORCE')}
          className={`p-3 rounded-lg border text-left transition-all ${
            isActive && currentAttack === 'SSH_BRUTE_FORCE'
              ? 'bg-blue-950/40 border-blue-500 text-blue-300 ring-1 ring-blue-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <KeyRound className="w-4 h-4 text-blue-400" />
            <Play className="w-3 h-3 text-slate-400" />
          </div>
          <div className="font-mono text-xs font-bold">SSH Brute Force</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Port 22 rapid credential flood</div>
        </button>
      </div>
    </div>
  );
};
