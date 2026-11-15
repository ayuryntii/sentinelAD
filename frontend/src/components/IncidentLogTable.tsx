import React, { useState } from 'react';
import { Download, Trash2, CheckCircle2, ShieldCheck, Filter, Lock, Unlock, FileSpreadsheet } from 'lucide-react';
import { Incident } from '../types';
import { resolveIncident, isolateIncident, clearAllIncidents } from '../services/api';

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
  const safeIncidents = Array.isArray(incidents) ? incidents : [];
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

  // Ekspor Spreadsheet Excel Berwarna & Tabel Rapi Profesional
  const handleExportExcel = () => {
    try {
      const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' });

      const rowsHtml = safeIncidents.map((inc, index) => {
        const bgRow = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';

        let sevBg = '#DBEAFE';
        let sevColor = '#1E40AF';
        if (inc.severity === 'CRITICAL') {
          sevBg = '#FEE2E2';
          sevColor = '#991B1B';
        } else if (inc.severity === 'HIGH') {
          sevBg = '#FFEDD5';
          sevColor = '#9A3412';
        } else if (inc.severity === 'MEDIUM') {
          sevBg = '#FEF9C3';
          sevColor = '#854D0E';
        }

        const isoBg = inc.is_isolated ? '#EF4444' : '#F1F5F9';
        const isoColor = inc.is_isolated ? '#FFFFFF' : '#475569';
        const isoText = inc.is_isolated ? 'TERISOLASI (BLOCKED)' : 'NORMAL';

        const resBg = inc.resolved ? '#D1FAE5' : '#FEF3C7';
        const resColor = inc.resolved ? '#065F46' : '#92400E';
        const resText = inc.resolved ? 'SELESAI' : 'AKTIF';

        return `
          <tr style="background-color: ${bgRow};">
            <td style="border: 1px solid #CBD5E1; text-align: center; font-weight: bold; font-family: monospace;">${inc.id}</td>
            <td style="border: 1px solid #CBD5E1; font-family: monospace; white-space: nowrap;">${inc.timestamp || '-'}</td>
            <td style="border: 1px solid #CBD5E1; color: #DC2626; font-weight: bold; font-family: monospace;">${inc.source_ip}</td>
            <td style="border: 1px solid #CBD5E1; color: #059669; font-weight: bold; font-family: monospace;">${inc.destination_ip}</td>
            <td style="border: 1px solid #CBD5E1; text-align: center; font-weight: bold;">${inc.protocol}</td>
            <td style="border: 1px solid #CBD5E1; font-weight: bold;">${inc.threat_type}</td>
            <td style="border: 1px solid #CBD5E1; background-color: ${sevBg}; color: ${sevColor}; font-weight: bold; text-align: center;">${inc.severity}</td>
            <td style="border: 1px solid #CBD5E1; text-align: right; font-weight: bold;">${(inc.anomaly_score * 100).toFixed(0)}%</td>
            <td style="border: 1px solid #CBD5E1; text-align: right;">${inc.packet_count}</td>
            <td style="border: 1px solid #CBD5E1; background-color: ${resBg}; color: ${resColor}; font-weight: bold; text-align: center;">${resText}</td>
            <td style="border: 1px solid #CBD5E1; background-color: ${isoBg}; color: ${isoColor}; font-weight: bold; text-align: center;">${isoText}</td>
            <td style="border: 1px solid #CBD5E1; font-size: 9pt; color: #334155;">${inc.details || '-'}</td>
          </tr>
        `;
      }).join('');

      const excelHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Audit Insiden SentinelAD</x:Name>
                  <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th {
              background-color: #064E3B;
              color: #FFFFFF;
              font-weight: bold;
              font-size: 10pt;
              text-align: center;
              padding: 10px 8px;
              border: 1px solid #047857;
            }
            td {
              font-size: 9.5pt;
              padding: 7px 6px;
              vertical-align: middle;
            }
          </style>
        </head>
        <body>
          <table>
            <tr>
              <td colspan="12" style="background-color: #022C22; color: #10B981; font-size: 16pt; font-weight: bold; text-align: center; padding: 14px; border: 1px solid #047857;">
                SENTINELAD | PUSSIBERAD TNI AD - KARTIKA CYBER HACKATHON 2026
              </td>
            </tr>
            <tr>
              <td colspan="12" style="background-color: #064E3B; color: #E2E8F0; font-size: 11pt; text-align: center; padding: 6px; border: 1px solid #047857;">
                LAPORAN RESMI AUDIT FORENSIK SIBER & REKAM ANOMALI JARINGAN
              </td>
            </tr>
            <tr>
              <td colspan="3" style="background-color: #F1F5F9; font-weight: bold; border: 1px solid #CBD5E1; padding: 6px;">Waktu Ekspor:</td>
              <td colspan="3" style="border: 1px solid #CBD5E1; padding: 6px;">${nowStr}</td>
              <td colspan="3" style="background-color: #F1F5F9; font-weight: bold; border: 1px solid #CBD5E1; padding: 6px;">Klasifikasi Keamanan:</td>
              <td colspan="3" style="border: 1px solid #CBD5E1; color: #DC2626; font-weight: bold; padding: 6px;">TERBATAS / DEFENSIVE SHIELD</td>
            </tr>
            <tr>
              <td colspan="3" style="background-color: #F1F5F9; font-weight: bold; border: 1px solid #CBD5E1; padding: 6px;">Unit Pengembang:</td>
              <td colspan="3" style="border: 1px solid #CBD5E1; padding: 6px;">Tim AyySec (Pussiberad TNI AD)</td>
              <td colspan="3" style="background-color: #F1F5F9; font-weight: bold; border: 1px solid #CBD5E1; padding: 6px;">Total Insiden Terekam:</td>
              <td colspan="3" style="border: 1px solid #CBD5E1; font-weight: bold; padding: 6px;">${safeIncidents.length} Catatan Insiden</td>
            </tr>
            <tr>
              <td colspan="12" style="height: 10px;"></td>
            </tr>
            <thead>
              <tr>
                <th style="width: 50px;">ID</th>
                <th style="width: 150px;">WAKTU (WIB)</th>
                <th style="width: 140px;">IP PENYERANG (SRC)</th>
                <th style="width: 140px;">TARGET (DST)</th>
                <th style="width: 80px;">PROTOKOL</th>
                <th style="width: 200px;">TIPE ANCAMAN</th>
                <th style="width: 110px;">KEPARAHAN</th>
                <th style="width: 85px;">SKOR AI</th>
                <th style="width: 85px;">PAKET</th>
                <th style="width: 95px;">STATUS</th>
                <th style="width: 120px;">FIREWALL ISOLASI</th>
                <th style="width: 320px;">ANALISIS FORENSIK PUSSIBERAD</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SentinelAD_Laporan_Audit_Forensik_${new Date().toISOString().slice(0, 10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Gagal mengekspor laporan Excel', e);
    }
  };

  // Ekspor CSV Standar
  const handleExportCsv = () => {
    try {
      const headers = [
        "ID Insiden",
        "Waktu Insiden (WIB)",
        "IP Penyerang (Source)",
        "Target Pertahanan (Destination)",
        "Protokol",
        "Tipe Ancaman",
        "Tingkat Keparahan",
        "Skor Deviasi AI",
        "Volume Paket",
        "Status Resolusi",
        "Status Isolasi IP",
        "Rincian Analisis Forensik"
      ];

      const rows = safeIncidents.map((inc) => [
        inc.id,
        `"${inc.timestamp || new Date().toISOString()}"`,
        `"${inc.source_ip}"`,
        `"${inc.destination_ip}"`,
        `"${inc.protocol}"`,
        `"${inc.threat_type}"`,
        `"${inc.severity}"`,
        `"${(inc.anomaly_score * 100).toFixed(0)}%"`,
        inc.packet_count,
        inc.resolved ? "RESOLVED" : "ACTIVE",
        inc.is_isolated ? "TERISOLASI" : "TIDAK",
        `"${(inc.details || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `SentinelAD_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Gagal mengekspor CSV", e);
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
          {/* Severity Filter - Warna Font Jelas 100% */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-defense-accent" />
            <select
              value={severityFilter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="bg-slate-900 text-slate-100 font-mono text-xs outline-none cursor-pointer border-none font-semibold"
              style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}
            >
              <option value="ALL" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }} className="py-1">
                Semua Tingkat Keparahan
              </option>
              <option value="CRITICAL" style={{ backgroundColor: '#0f172a', color: '#f87171', fontWeight: 'bold' }} className="py-1">
                🔴 CRITICAL
              </option>
              <option value="HIGH" style={{ backgroundColor: '#0f172a', color: '#fb923c', fontWeight: 'bold' }} className="py-1">
                🟠 HIGH
              </option>
              <option value="MEDIUM" style={{ backgroundColor: '#0f172a', color: '#facc15' }} className="py-1">
                🟡 MEDIUM
              </option>
              <option value="LOW" style={{ backgroundColor: '#0f172a', color: '#60a5fa' }} className="py-1">
                🔵 LOW
              </option>
            </select>
          </div>

          {/* Export Excel (Berwarna & Rapi) */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/50 transition-all cursor-pointer font-semibold shadow-sm"
            title="Unduh laporan audit forensik resmi (.xls) dengan tabel dan warna lengkap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekspor Excel (.xls)</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Unduh data teks mentah (.csv)"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-800/50 transition-colors cursor-pointer"
            title="Bersihkan riwayat log"
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
              <th className="py-2.5 px-3">WAKTU (WIB)</th>
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
            {safeIncidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  Tidak ada catatan insiden keamanan yang terdeteksi saat ini.
                </td>
              </tr>
            ) : (
              safeIncidents.map((inc) => (
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
