export interface ProtocolsBreakdown {
  TCP: number;
  UDP: number;
  ICMP: number;
  OTHER: number;
}

export interface AnomalyAnalysis {
  is_anomaly: boolean;
  threat_type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  anomaly_score: number;
  details: string;
  features_analyzed?: {
    pps: number;
    bps: number;
    syn_ratio: number;
    unique_dst_ports: number;
    icmp_ratio: number;
    entropy: number;
  };
}

export interface SimulationState {
  active: boolean;
  current_attack: string;
  remaining_seconds: number;
}

export interface TelemetryPayload {
  timestamp: string;
  pps: number;
  bps: number;
  bandwidth_kbps: number;
  protocols: ProtocolsBreakdown;
  traffic_source: string;
  dominant_src_ip: string;
  dominant_dst_ip: string;
  unique_dst_ports: number;
  analysis: AnomalyAnalysis;
  simulation: SimulationState;
}

export interface Incident {
  id: number;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  threat_type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  anomaly_score: number;
  packet_count: number;
  details: string;
  resolved: boolean;
  is_isolated?: boolean;
}

export interface ProtectedAsset {
  name: string;
  ip: string;
  status: "Aman" | "Waspada" | "Diserang" | "Beban Tinggi";
  role: string;
  traffic_health: string;
}

export interface OverviewStats {
  defcon_level: string;
  defcon_status: "CRITICAL" | "ELEVATED" | "GUARDED" | "NORMAL";
  total_incidents: number;
  critical_threats: number;
  high_threats: number;
  unresolved_threats: number;
  total_packets_inspected: number;
  ai_model: string;
  accuracy_rate: string;
}
