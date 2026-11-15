import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, X, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';
import { AnomalyAnalysis } from '../types';

interface ThreatAlertModalProps {
  analysis: AnomalyAnalysis | null;
  sourceIp: string;
  destIp: string;
  onDismiss: () => void;
  onIsolate?: (sourceIp: string) => void;
}

export const ThreatAlertModal: React.FC<ThreatAlertModalProps> = ({
  analysis,
  sourceIp,
  destIp,
  onDismiss,
  onIsolate
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isIsolating, setIsIsolating] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sintesis Suara Sirene Taktis Web Audio API tanpa file eksternal
  const playAlertBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Nada A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25); // Slur ke A4

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio autoplay policy / blocked
    }
  };

  useEffect(() => {
    if (analysis?.is_anomaly) {
      playAlertBeep();
    }
  }, [analysis?.is_anomaly, analysis?.threat_type]);

  if (!analysis || !analysis.is_anomaly) {
    return null;
  }

  const isCritical = analysis.severity === 'CRITICAL';

  const handleIsolateClick = () => {
    setIsIsolating(true);
    if (onIsolate) {
      onIsolate(sourceIp);
    }
    setTimeout(() => {
      setIsIsolating(false);
      onDismiss();
    }, 600);
  };

  return (
    <div className="fixed inset-x-4 top-20 z-50 max-w-2xl mx-auto animate-bounce-once">
      <div className={`p-5 rounded-xl border-2 shadow-2xl backdrop-blur-md transition-all ${
        isCritical 
          ? 'bg-red-950/95 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' 
          : 'bg-amber-950/95 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${
              isCritical ? 'bg-red-900/60 border-red-500 text-red-300 animate-pulse' : 'bg-amber-900/60 border-amber-500 text-amber-300'
            }`}>
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded tracking-widest ${
                  isCritical ? 'bg-red-500 text-black' : 'bg-amber-500 text-black'
                }`}>
                  {analysis.severity} THREAT ALARM
                </span>
                <span className="text-xs font-mono text-slate-300">
                  AI Conf: {(analysis.anomaly_score * 100).toFixed(0)}%
                </span>
              </div>
              <h2 className="text-lg font-bold font-mono tracking-wider text-white mt-1">
                WARNING: {analysis.threat_type}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Matikan Suara Sirene' : 'Aktifkan Suara Sirene'}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onDismiss}
              title="Tutup Alert"
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Detail Vektor Serangan */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded bg-black/40 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">IP Penyerang (Source):</span>
            <span className="text-red-400 font-bold text-sm tracking-wider">{sourceIp}</span>
          </div>
          <div className="p-2.5 rounded bg-black/40 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Target Pertahanan (Destination):</span>
            <span className="text-emerald-400 font-bold text-sm tracking-wider">{destIp}</span>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-200 font-mono bg-black/30 p-2.5 rounded border border-slate-800/80">
          <span className="text-amber-400 font-bold mr-1">ANALISIS FORENSIK:</span>
          {analysis.details}
        </div>

        {/* Tombol Aksi Mitigasi */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
          <span className="text-[11px] text-slate-400 font-mono">
            Rekomendasi: Blokir IP Sumber via Firewall IPTables Pussiberad
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 rounded text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700 transition-colors"
            >
              Tutup Alert
            </button>
            <button
              onClick={handleIsolateClick}
              disabled={isIsolating}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all cursor-pointer"
            >
              {isIsolating ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white animate-spin" />
                  <span>Memblokir IP...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-white" />
                  <span>Isolasi IP Penyerang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
