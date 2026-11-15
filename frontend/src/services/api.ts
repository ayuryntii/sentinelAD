import axios from 'axios';
import { Incident, OverviewStats } from '../types';

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
  timeout: 10000,
});

export const fetchOverviewStats = async (): Promise<OverviewStats> => {
  const res = await api.get('/stats/overview');
  return res.data;
};

export const fetchIncidents = async (severity?: string, limit: number = 50): Promise<{ total: number; items: Incident[] }> => {
  const params: any = { limit };
  if (severity && severity !== 'ALL') {
    params.severity = severity;
  }
  const res = await api.get('/incidents', { params });
  return res.data;
};

export const resolveIncident = async (incidentId: number) => {
  const res = await api.post(`/incidents/${incidentId}/resolve`);
  return res.data;
};

export const isolateIncident = async (incidentId: number) => {
  const res = await api.post(`/incidents/${incidentId}/isolate`);
  return res.data;
};

export const fetchProtectedAssets = async (): Promise<{ assets_monitored: number; assets: any[] }> => {
  const res = await api.get('/defense/assets');
  return res.data;
};

export const clearAllIncidents = async () => {
  const res = await api.delete('/incidents/clear');
  return res.data;
};

export const triggerAttackSimulation = async (attackType: string, durationSeconds: number = 15) => {
  const res = await api.post('/simulation/attack', {
    attack_type: attackType,
    duration_seconds: durationSeconds
  });
  return res.data;
};

export const stopAttackSimulation = async () => {
  const res = await api.post('/simulation/stop');
  return res.data;
};

export const getExportCsvUrl = (): string => {
  return `${API_BASE}/incidents/export/csv`;
};
