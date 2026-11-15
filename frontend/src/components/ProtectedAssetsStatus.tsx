import React from 'react';
import { Server, ShieldCheck, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import { ProtectedAsset } from '../types';

interface ProtectedAssetsStatusProps {
  assets: ProtectedAsset[];
}

export const ProtectedAssetsStatus: React.FC<ProtectedAssetsStatusProps> = ({ assets }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Diserang':
        return 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse font-bold';
      case 'Waspada':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold';
      case 'Beban Tinggi':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Diserang':
        return 'bg-red-500 animate-ping';
      case 'Waspada':
        return 'bg-amber-400';
      default:
        return 'bg-emerald-400';
    }
  };

  return (
    <div className="p-5 rounded-xl bg-defense-card border border-defense-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-defense-primary" />
            STATUS ASET & INFRASTRUKTUR PERTAHANAN
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Pemantauan integritas node kritis pertahanan siber TNI AD secara real-time
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
          4 NODE AKTIF
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {assets.map((asset, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border transition-all ${
              asset.status === 'Diserang'
                ? 'bg-red-950/30 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : asset.status === 'Waspada'
                ? 'bg-amber-950/20 border-amber-500/50'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-slate-200 truncate" title={asset.name}>
                {asset.name}
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${getStatusDot(asset.status)}`} />
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${getStatusBadge(asset.status)}`}>
                  {asset.status}
                </span>
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
              <div className="flex justify-between">
                <span>IP Aset:</span>
                <span className="text-slate-200">{asset.ip}</span>
              </div>
              <div className="flex justify-between">
                <span>Peran:</span>
                <span className="text-defense-accent truncate max-w-[130px]">{asset.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
