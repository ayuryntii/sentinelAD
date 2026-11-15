import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TrafficChart, TrafficDataPoint } from './components/TrafficChart';
import { ProtocolDistribution } from './components/ProtocolDistribution';
import { ThreatAlertModal } from './components/ThreatAlertModal';
import { IncidentLogTable } from './components/IncidentLogTable';
import { AttackSimulationControl } from './components/AttackSimulationControl';
import { GeoThreatMap } from './components/GeoThreatMap';
import { ProtectedAssetsStatus } from './components/ProtectedAssetsStatus';
import { wsClient } from './services/websocket';
import { fetchIncidents, fetchOverviewStats, fetchProtectedAssets, isolateByIp, stopAttackSimulation } from './services/api';
import { TelemetryPayload, Incident, OverviewStats, AnomalyAnalysis, ProtectedAsset } from './types';

export const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<TelemetryPayload | null>(null);
  const [trafficHistory, setTrafficHistory] = useState<TrafficDataPoint[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [dismissedAnomaly, setDismissedAnomaly] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleIsolateFromAlert = async (ip: string) => {
    try {
      await isolateByIp(ip);
      await stopAttackSimulation();
      setDismissedAnomaly(true);
      await loadData();
      showNotification(`🛡️ Firewall Pussiberad: IP ${ip} berhasil diisolasi dari seluruh perimeter pertahanan!`);
    } catch (e) {
      console.error(e);
    }
  };
  const [protectedAssets, setProtectedAssets] = useState<ProtectedAsset[]>([
    { name: "Gateway Perimeter Pussiberad", ip: "10.10.20.1", status: "Aman", role: "Firewall & Ingress Filter", traffic_health: "Optimal" },
    { name: "Server Web Portal AD", ip: "10.10.20.80", status: "Aman", role: "Public Defense Service", traffic_health: "Optimal" },
    { name: "VPN Komunikasi Taktis", ip: "10.10.20.254", status: "Aman", role: "Encrypted Command Tunnel", traffic_health: "Optimal" },
    { name: "Database Personel Pussiberad", ip: "10.10.20.5", status: "Aman", role: "Classified Records DB", traffic_health: "Protected" }
  ]);

  // Buffer ref to avoid stale closures in ws handler
  const historyRef = useRef<TrafficDataPoint[]>([]);

  // Load initial REST data
  const loadData = async () => {
    try {
      const [statsData, incidentsData, assetsData] = await Promise.all([
        fetchOverviewStats().catch(() => null),
        fetchIncidents(severityFilter).catch(() => ({ total: 0, items: [] })),
        fetchProtectedAssets().catch(() => null)
      ]);
      if (statsData) setOverview(statsData);
      if (incidentsData) setIncidents(incidentsData.items);
      if (assetsData?.assets) setProtectedAssets(assetsData.assets);
    } catch (err) {
      console.error('Error fetching initial data', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [severityFilter]);

  // Connect WebSocket
  useEffect(() => {
    wsClient.connect();

    const unsubStatus = wsClient.subscribeStatus((connected) => {
      setIsConnected(connected);
    });

    const unsubMsg = wsClient.subscribe((data: TelemetryPayload) => {
      setTelemetry(data);

      // Add to rolling traffic history (max 30 points)
      const now = new Date(data.timestamp);
      const timeLabel = now.toLocaleTimeString('id-ID', { minute: '2-digit', second: '2-digit' });

      const newPoint: TrafficDataPoint = {
        time: timeLabel,
        pps: data.pps,
        bandwidth_kbps: data.bandwidth_kbps,
        is_anomaly: data.analysis?.is_anomaly || false,
        threat_type: data.analysis?.threat_type
      };

      const updated = [...historyRef.current, newPoint].slice(-30);
      historyRef.current = updated;
      setTrafficHistory(updated);

      // Reset dismissed state jika serangan berganti atau terpicu kembali
      if (data.analysis?.is_anomaly) {
        setDismissedAnomaly(false);
      }
    });

    return () => {
      unsubStatus();
      unsubMsg();
      wsClient.close();
    };
  }, []);

  const isAnomalyActive = (telemetry?.analysis?.is_anomaly || false) && !dismissedAnomaly;

  return (
    <div className="min-h-screen bg-defense-bg text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        isConnected={isConnected}
        stats={overview}
        trafficSource={telemetry?.traffic_source || 'MONITOR'}
      />

      {/* Floating Tactical Threat Alert */}
      {isAnomalyActive && (
        <ThreatAlertModal
          analysis={telemetry?.analysis || null}
          sourceIp={telemetry?.dominant_src_ip || '192.168.1.188'}
          destIp={telemetry?.dominant_dst_ip || '10.10.20.1'}
          onDismiss={() => setDismissedAnomaly(true)}
          onIsolate={handleIsolateFromAlert}
        />
      )}

      {/* Main Command Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Panel Simulasi Serangan Hackathon Demo */}
        <AttackSimulationControl
          simulation={telemetry?.simulation}
          onSimulationChange={loadData}
        />

        {/* 4 Stat Cards */}
        <StatCards telemetry={telemetry} overview={overview} />

        {/* Status Aset Kritis Pertahanan (Defensive Shield & Core Infra) */}
        <ProtectedAssetsStatus assets={protectedAssets} />

        {/* Baris 1: Live Traffic Chart & Protocol Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrafficChart
              data={trafficHistory}
              isAnomalyActive={isAnomalyActive}
            />
          </div>
          <div className="lg:col-span-1">
            <ProtocolDistribution protocols={telemetry?.protocols} />
          </div>
        </div>

        {/* Baris 2: Geolocation / Radar & Incident Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <GeoThreatMap
              sourceIp={telemetry?.dominant_src_ip || '192.168.1.1'}
              destIp={telemetry?.dominant_dst_ip || '10.10.20.1'}
              isAnomaly={isAnomalyActive}
              threatType={telemetry?.analysis?.threat_type || 'STANDBY'}
            />
          </div>
          <div className="lg:col-span-2">
            <IncidentLogTable
              incidents={incidents}
              onRefresh={loadData}
              severityFilter={severityFilter}
              onFilterChange={setSeverityFilter}
            />
          </div>
        </div>
      </main>

      {/* Toast Notification Pertahanan */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md px-4 py-3 rounded-xl bg-emerald-950/95 border border-emerald-500/80 text-emerald-300 font-mono text-xs flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.35)] backdrop-blur animate-bounce-once">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-defense-border bg-defense-surface/60 py-4 px-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="text-defense-primary font-bold">SentinelAD</span> | Hak Cipta Komando Pertahanan Siber (Pussiberad TNI AD)
          </div>
          <div>
            Kategori: <span className="text-slate-300">Penangkalan (Cyber Defense Early Warning System)</span> | Tim: <span className="text-defense-primary font-bold">AyySec</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
