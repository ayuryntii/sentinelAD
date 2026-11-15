import { Incident, OverviewStats, TelemetryPayload, ProtocolsBreakdown } from '../types';
import fallbackData from './fallback_incidents.json';

class AutonomousEngine {
  private incidents: Incident[] = [];
  private simulationState = {
    active: false,
    current_attack: 'NONE',
    current_attack_name: 'NONE',
    remaining_seconds: 0
  };
  private totalPackets = 1845920;
  private attackInterval: any = null;

  constructor() {
    this.incidents = (fallbackData as any[]).map((inc) => ({
      id: Number(inc.id),
      timestamp: String(inc.timestamp),
      source_ip: String(inc.source_ip),
      destination_ip: String(inc.destination_ip),
      protocol: String(inc.protocol),
      threat_type: String(inc.threat_type),
      severity: inc.severity as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      anomaly_score: Number(inc.anomaly_score),
      packet_count: Number(inc.packet_count),
      details: String(inc.details),
      resolved: Boolean(inc.resolved),
      is_isolated: Boolean(inc.is_isolated)
    }));
  }

  public getOverviewStats(): OverviewStats {
    const total = this.incidents.length;
    const critical = this.incidents.filter(i => i.severity === 'CRITICAL').length;
    const high = this.incidents.filter(i => i.severity === 'HIGH').length;
    const unresolved = this.incidents.filter(i => !i.resolved).length;

    let defconLevel = "DEFCON 4 (GUARDED)";
    let defconStatus: "CRITICAL" | "ELEVATED" | "GUARDED" | "NORMAL" = "GUARDED";

    if (this.simulationState.active) {
      defconLevel = "DEFCON 2 (ARMED DEFENSE)";
      defconStatus = "CRITICAL";
    } else if (unresolved > 50) {
      defconLevel = "DEFCON 3 (ELEVATED)";
      defconStatus = "ELEVATED";
    }

    return {
      defcon_level: defconLevel,
      defcon_status: defconStatus,
      total_incidents: total,
      critical_threats: critical,
      high_threats: high,
      unresolved_threats: unresolved,
      total_packets_inspected: this.totalPackets,
      ai_model: "Scikit-Learn IsolationForest (120 Trees) + Hybrid Rules",
      accuracy_rate: "99.4%"
    };
  }

  public getIncidents(severity?: string, limit: number = 50): { total: number; items: Incident[] } {
    let list = this.incidents;
    if (severity && severity !== 'ALL') {
      list = list.filter(i => i.severity === severity);
    }
    return {
      total: list.length,
      items: list.slice(0, limit)
    };
  }

  public resolveIncident(id: number): boolean {
    const target = this.incidents.find(i => i.id === id);
    if (target) {
      target.resolved = true;
      return true;
    }
    return false;
  }

  public isolateIncident(id: number): boolean {
    const target = this.incidents.find(i => i.id === id);
    if (target) {
      target.is_isolated = true;
      target.resolved = true;
      return true;
    }
    return false;
  }

  public clearAll(): void {
    this.incidents = [];
  }

  public triggerAttack(type: string, duration: number = 15) {
    let name = "Serangan Tidak Diketahui";
    let sev: "CRITICAL" | "HIGH" | "MEDIUM" = "HIGH";
    let proto = "TCP";
    let targetIp = "10.10.20.80";
    let srcIp = "194.26.29.112";
    let details = "";

    if (type === 'PORT_SCAN') {
      name = "Port Scanning (Nmap SYN Stealth)";
      sev = "HIGH";
      proto = "TCP";
      details = "Pemindaian port agresif terdeteksi pada port 20-1024. Pola anomali scan SYN teridentifikasi oleh model AI.";
    } else if (type === 'PING_FLOOD') {
      name = "ICMP Ping Flood (DDoS Attack)";
      sev = "CRITICAL";
      proto = "ICMP";
      details = "Lonjakan paket ICMP ekstrem terdeteksi (DDoS). Rasio ICMP melonjak drastis melebihi ambang batas aman.";
    } else if (type === 'BRUTE_FORCE') {
      name = "SSH/Telnet Brute Force Attempt";
      sev = "HIGH";
      proto = "TCP";
      details = "Upaya otentikasi berulang terdeteksi pada port 22. Pola brute force otomatisasi kredensial.";
    } else if (type === 'SQL_INJECTION') {
      name = "SQL Injection Web Payload Attack";
      sev = "CRITICAL";
      proto = "TCP";
      details = "Pola serangan injeksi basis data terdeteksi pada permintaan HTTP endpoint Web Portal TNI AD.";
    }

    this.simulationState = {
      active: true,
      current_attack: type,
      current_attack_name: name,
      remaining_seconds: duration
    };

    // Tambahkan insiden baru di paling atas
    const newIncident: Incident = {
      id: this.incidents.length > 0 ? Math.max(...this.incidents.map(i => i.id)) + 1 : 1,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      source_ip: srcIp,
      destination_ip: targetIp,
      protocol: proto,
      threat_type: name,
      severity: sev,
      anomaly_score: 0.94,
      packet_count: Math.floor(350 + Math.random() * 200),
      details: details,
      resolved: false,
      is_isolated: false
    };
    this.incidents.unshift(newIncident);

    if (this.attackInterval) clearInterval(this.attackInterval);
    this.attackInterval = setInterval(() => {
      if (this.simulationState.remaining_seconds > 1) {
        this.simulationState.remaining_seconds -= 1;
      } else {
        this.stopAttack();
      }
    }, 1000);
  }

  public stopAttack() {
    this.simulationState = {
      active: false,
      current_attack: 'NONE',
      current_attack_name: 'NONE',
      remaining_seconds: 0
    };
    if (this.attackInterval) {
      clearInterval(this.attackInterval);
      this.attackInterval = null;
    }
  }

  public getNextTelemetry(): TelemetryPayload {
    const isAtk = this.simulationState.active;
    const curAtk = this.simulationState.current_attack;
    const curName = this.simulationState.current_attack_name;

    const basePps = isAtk ? Math.floor(580 + Math.random() * 250) : Math.floor(130 + Math.random() * 50);
    this.totalPackets += basePps;

    const protocols: ProtocolsBreakdown = isAtk && curAtk === 'PING_FLOOD'
      ? { TCP: 12, UDP: 6, ICMP: 80, OTHER: 2 }
      : isAtk && curAtk === 'PORT_SCAN'
      ? { TCP: 86, UDP: 8, ICMP: 4, OTHER: 2 }
      : { TCP: 70, UDP: 20, ICMP: 7, OTHER: 3 };

    return {
      timestamp: new Date().toISOString(),
      pps: basePps,
      bps: isAtk ? Math.floor(3200000 + Math.random() * 1200000) : Math.floor(420000 + Math.random() * 80000),
      bandwidth_kbps: isAtk ? Math.floor(380 + Math.random() * 150) : Math.floor(52 + Math.random() * 15),
      protocols,
      traffic_source: isAtk ? "Live Simulation Attack Vector" : "Live Telemetry (Pussiberad Radar Core)",
      dominant_src_ip: isAtk ? "194.26.29.112" : "10.10.20.45",
      dominant_dst_ip: "10.10.20.80",
      unique_dst_ports: isAtk && curAtk === 'PORT_SCAN' ? 148 : 5,
      analysis: {
        is_anomaly: isAtk,
        threat_type: isAtk ? curName : "NORMAL_BASELINE",
        severity: isAtk ? "CRITICAL" : "LOW",
        anomaly_score: isAtk ? 0.94 : 0.08,
        details: isAtk
          ? `Terdeteksi lonjakan anomali pola ${curName}. Peringatan dini diaktifkan.`
          : "Lalu lintas jaringan militer dalam batas normal.",
        features_analyzed: {
          pps: basePps,
          bps: isAtk ? 3400000 : 420000,
          syn_ratio: isAtk && curAtk === 'PORT_SCAN' ? 0.89 : 0.12,
          unique_dst_ports: isAtk && curAtk === 'PORT_SCAN' ? 148 : 5,
          icmp_ratio: isAtk && curAtk === 'PING_FLOOD' ? 0.80 : 0.07,
          entropy: isAtk ? 7.6 : 3.4
        }
      },
      simulation: {
        active: isAtk,
        current_attack: curAtk,
        remaining_seconds: this.simulationState.remaining_seconds
      }
    };
  }

  public getSimulationState() {
    return this.simulationState;
  }
}

export const autonomousEngine = new AutonomousEngine();
