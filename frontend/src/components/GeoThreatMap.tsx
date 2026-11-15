import React from 'react';
import { Globe2, Radio, MapPin, Shield } from 'lucide-react';

interface GeoThreatMapProps {
  sourceIp: string;
  destIp: string;
  isAnomaly: boolean;
  threatType: string;
}

export const GeoThreatMap: React.FC<GeoThreatMapProps> = ({
  sourceIp,
  destIp,
  isAnomaly,
  threatType
}) => {
  // Inferensi asal IP: jika private subnet (192.168, 10.x, 172.16) vs Public external
  const isPrivate = sourceIp.startsWith('192.168.') || sourceIp.startsWith('10.') || sourceIp.startsWith('127.');
  const locationLabel = isPrivate ? 'LAN Militer (Internal Subnet / Kodam)' : 'External Public IP (Global Threat)';
  const country = isPrivate ? 'Indonesia (Intranet TNI AD)' : 'Offshore / Suspicious Relay';
  const org = isPrivate ? 'Pussiberad LAN Sector 4' : 'Autonomous System AS45102';

  return (
    <div className="p-5 rounded-xl bg-defense-card border border-defense-border flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-defense-accent" />
            GEOLOCATION & RADAR INTEL
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            SECTOR SCAN
          </span>
        </div>

        {/* Visual Radar Screen */}
        <div className="relative w-full h-44 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden mb-4">
          {/* Radar Circles */}
          <div className="absolute w-36 h-36 rounded-full border border-emerald-900/40" />
          <div className="absolute w-24 h-24 rounded-full border border-emerald-800/40" />
          <div className="absolute w-12 h-12 rounded-full border border-emerald-700/40" />
          {/* Crosshairs */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-900/40" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-900/40" />

          {/* Radar Sweep Ray */}
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(16,185,129,0.2)_60deg,transparent_70deg)] animate-radar-sweep pointer-events-none" />

          {/* Defense Gateway Blip (Center) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-defense-primary shadow-[0_0_10px_#10B981]" />
            <span className="text-[9px] font-mono text-emerald-400 mt-1 font-bold">HQ GATEWAY</span>
          </div>

          {/* Attacker Blip (When Anomaly active) */}
          {isAnomaly && (
            <div className="absolute top-10 right-14 flex flex-col items-center animate-pulse">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_15px_#EF4444]" />
              <span className="text-[9px] font-mono text-red-400 mt-0.5 font-bold">HOSTILE BLIP</span>
            </div>
          )}
        </div>

        {/* Target & Source IP Metadata */}
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-defense-accent" />
              <span>Lokasi Terdeteksi:</span>
            </div>
            <span className="text-slate-200 font-medium">{locationLabel}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Zona Pertahanan:</span>
            </div>
            <span className="text-slate-200 font-medium">{country}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Network ASN:</span>
            </div>
            <span className="text-slate-200 font-medium">{org}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between">
        <span>Vektor: {threatType}</span>
        <span className={isAnomaly ? 'text-red-400 font-bold' : 'text-emerald-400'}>
          {isAnomaly ? 'TARGETED PROBE' : 'STANDBY'}
        </span>
      </div>
    </div>
  );
};
