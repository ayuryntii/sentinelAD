import React, { useState } from 'react';
import { Download, Trash2, CheckCircle2, ShieldCheck, Filter, Lock, Unlock } from 'lucide-react';
import { Incident } from '../types';
import { resolveIncident, isolateIncident, clearAllIncidents, getExportCsvUrl } from '../services/api';

interface IncidentLogTableProps {
  incidents: Incident[];
  onRefresh: () => void;
  severityFilter: string;
  onFilterChange: (severity: string) => void;
}

export const IncidentLogTable: React.FC<IncidentLogTableProps> = ({
  incidents,
  onRefresh,
  severityFilter,
  onFilterChange
}) => {
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [isolatingId, setIsolatingId] = useState<number | null>(null);

  const handleResolve = async (id: number) => {
    try {
      setResolvingId(id);
      await resolveIncident(id);
      onRefresh();
    } catch (err) {
      console.error('Gagal menyelesaikan insiden', err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleIsolate = async (id: number) => {
    try {
      setIsolatingId(id);
      await isolateIncident(id);
      onRefresh();
    } catch (err) {
      console.error('Gagal mengubah status isolasi IP', err);
    } finally {
      setIsolatingId(null);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat log insiden?')) {
      try {
        await clearAllIncidents();
        onRefresh();
      } catch (err) {
        console.error('Gagal menghapus log insiden', err);
      }
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
    }
  };

  return (
    <div className="p-5 rounded-xl bg-defense-card border border-defense-border">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-defense-primary" />
            INCIDENT LOG & AUDIT FORENSIK SIBER
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Pencatatan otomatis anomali lalu lintas untuk kebutuhan investigasi dan pelaporan Pussiberad
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-defense-border">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">Semua Tingkat Keparahan</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Export CSV Button */}
          <a
            href={getExportCsvUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-defense-accent" />
            <span>Ekspor CSV</span>
          </a>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-defense-border text-slate-400">
              <th className="py-2.5 px-3">WAKTU (UTC)</th>
              <th className="py-2.5 px-3">IP PENYERANG (SRC)</th>
              <th className="py-2.5 px-3">TARGET (DST)</th>
              <th className="py-2.5 px-3">PROTOKOL</th>
              <th className="py-2.5 px-3">TIPE ANCAMAN</th>
              <th className="py-2.5 px-3">KEPARAHAN</th>
              <th className="py-2.5 px-3">AI SCORE</th>
              <th className="py-2.5 px-3 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-defense-border/50 text-slate-300">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  Tidak ada catatan insiden keamanan yang terdeteksi saat ini.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {inc.timestamp ? new Date(inc.timestamp).toLocaleTimeString('id-ID') : '-'}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-red-400">
                    {inc.source_ip}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400">
                    {inc.destination_ip}
                  </td>
                  <td className="py-2.5 px-3 font-medium">
                    {inc.protocol}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-100">{inc.threat_type}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{inc.details}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${getSeverityBadge(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">
                    {(inc.anomaly_score * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleIsolate(inc.id)}
                        disabled={isolatingId === inc.id}
                        title={inc.is_isolated ? "Buka isolasi IP firewall" : "Isolasi otomatis IP firewall"}
                        className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-colors ${
                          inc.is_isolated
                            ? "bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
                        }`}
                      >
                        {inc.is_isolated ? (
                          <>
                            <Lock className="w-3 h-3 text-red-400" />
                            <span>Terisolasi</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3 text-slate-400" />
                            <span>Isolasi IP</span>
                          </>
                        )}
                      </button>

                      {inc.resolved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 px-2 py-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                        </span>
                      ) : (
                        <button
                          onClick={() => handleResolve(inc.id)}
                          disabled={resolvingId === inc.id}
                          className="px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-white border border-emerald-800/60 text-[11px] transition-colors"
                        >
                          {resolvingId === inc.id ? 'Memproses...' : 'Tandai Selesai'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
