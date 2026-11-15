import axios from 'axios';
import { Incident, OverviewStats } from '../types';
import { autonomousEngine } from './autonomousEngine';

const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return 'http://localhost:8000/api/v1';
  }
  return '/api/v1';
};

const API_BASE = getApiBase();

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 4000,
});

export const fetchOverviewStats = async (): Promise<OverviewStats> => {
  try {
    const res = await api.get('/stats/overview');
    return res.data;
  } catch {
    return autonomousEngine.getOverviewStats();
  }
};

export const fetchIncidents = async (severity?: string, limit: number = 50): Promise<{ total: number; items: Incident[] }> => {
  try {
    const params: any = { limit };
    if (severity && severity !== 'ALL') {
      params.severity = severity;
    }
    const res = await api.get('/incidents', { params });
    return res.data;
  } catch {
    return autonomousEngine.getIncidents(severity, limit);
  }
};

export const resolveIncident = async (incidentId: number) => {
  try {
    const res = await api.post(`/incidents/${incidentId}/resolve`);
    return res.data;
  } catch {
    autonomousEngine.resolveIncident(incidentId);
    return { status: 'success', message: `Insiden #${incidentId} berhasil diselesaikan.` };
  }
};

export const isolateIncident = async (incidentId: number) => {
  try {
    const res = await api.post(`/incidents/${incidentId}/isolate`);
    return res.data;
  } catch {
    autonomousEngine.isolateIncident(incidentId);
    return { status: 'success', message: `IP penyerang berhasil diisolasi dari perimeter pertahanan.` };
  }
};

export const fetchProtectedAssets = async (): Promise<{ assets_monitored: number; assets: any[] }> => {
  try {
    const res = await api.get('/defense/assets');
    return res.data;
  } catch {
    return {
      assets_monitored: 4,
      assets: [
        { name: "Gateway Perimeter Pussiberad", ip: "10.10.20.1", status: "Aman", role: "Firewall & Ingress Filter", traffic_health: "Optimal" },
        { name: "Server Web Portal AD", ip: "10.10.20.80", status: "Aman", role: "Public Defense Service", traffic_health: "Optimal" },
        { name: "VPN Komunikasi Taktis", ip: "10.10.20.254", status: "Aman", role: "Encrypted Command Tunnel", traffic_health: "Optimal" },
        { name: "Database Personel Pussiberad", ip: "10.10.20.5", status: "Aman", role: "Classified Records DB", traffic_health: "Protected" }
      ]
    };
  }
};

export const clearAllIncidents = async () => {
  try {
    const res = await api.delete('/incidents/clear');
    return res.data;
  } catch {
    autonomousEngine.clearAll();
    return { status: 'success', message: 'Semua log insiden berhasil dibersihkan.' };
  }
};

export const triggerAttackSimulation = async (attackType: string, durationSeconds: number = 15) => {
  try {
    const res = await api.post('/simulation/attack', {
      attack_type: attackType,
      duration_seconds: durationSeconds
    });
    return res.data;
  } catch {
    autonomousEngine.triggerAttack(attackType, durationSeconds);
    return { status: 'success', message: `Simulasi serangan ${attackType} berhasil diaktifkan.` };
  }
};

export const stopAttackSimulation = async () => {
  try {
    const res = await api.post('/simulation/stop');
    return res.data;
  } catch {
    autonomousEngine.stopAttack();
    return { status: 'success', message: 'Simulasi serangan dihentikan.' };
  }
};

export const getExportCsvUrl = (): string => {
  return `${API_BASE}/incidents/export/csv`;
};
