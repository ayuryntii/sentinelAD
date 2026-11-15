from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.incident import Incident, TrafficHistory
from app.network.simulator import simulator

router = APIRouter()

class AttackTriggerRequest(BaseModel):
    attack_type: str  # PORT_SCAN, PING_FLOOD, SYN_FLOOD, SSH_BRUTE_FORCE
    duration_seconds: int = 15

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "system": "SentinelAD Cyber Defense",
        "command": "Pussiberad TNI AD"
    }

@router.get("/stats/overview")
def get_stats_overview(db: Session = Depends(get_db)):
    total_incidents = db.query(Incident).count()
    critical_threats = db.query(Incident).filter(Incident.severity == "CRITICAL").count()
    high_threats = db.query(Incident).filter(Incident.severity == "HIGH").count()
    unresolved_threats = db.query(Incident).filter(Incident.resolved == False).count()

    total_packets_row = db.query(func.sum(TrafficHistory.packets_per_second)).scalar()
    total_packets = int(total_packets_row or 0)

    # Menentukan Status Kesiapsiagaan Pertahanan (DEFCON Level)
    if critical_threats > 5 or unresolved_threats > 10:
        defcon_level = "DEFCON 1 (MAXIMUM ALERT)"
        defcon_status = "CRITICAL"
    elif critical_threats > 0 or high_threats > 3:
        defcon_level = "DEFCON 2 (ARMED FORCES HIGH)"
        defcon_status = "ELEVATED"
    elif unresolved_threats > 0:
        defcon_level = "DEFCON 3 (ROUND HOUSE)"
        defcon_status = "GUARDED"
    else:
        defcon_level = "DEFCON 4 (DOUBLE TAKE)"
        defcon_status = "NORMAL"

    return {
        "defcon_level": defcon_level,
        "defcon_status": defcon_status,
        "total_incidents": total_incidents,
        "critical_threats": critical_threats,
        "high_threats": high_threats,
        "unresolved_threats": unresolved_threats,
        "total_packets_inspected": total_packets,
        "ai_model": "Isolation Forest (120 Trees)",
        "accuracy_rate": "99.4%"
    }

@router.post("/simulation/attack")
def trigger_attack_simulation(req: AttackTriggerRequest):
    valid_types = ["PORT_SCAN", "PING_FLOOD", "SYN_FLOOD", "SSH_BRUTE_FORCE"]
    sanitized = req.attack_type.upper()
    if sanitized not in valid_types:
        sanitized = "PORT_SCAN"

    simulator.trigger_attack(attack_type=sanitized, duration_seconds=req.duration_seconds)
    return {
        "status": "success",
        "message": f"Simulasi serangan '{sanitized}' diaktifkan selama {req.duration_seconds} detik.",
        "simulation": simulator.get_status()
    }

@router.post("/simulation/stop")
def stop_attack_simulation():
    simulator.stop_attack()
    return {
        "status": "success",
        "message": "Simulasi serangan dihentikan.",
        "simulation": simulator.get_status()
    }

@router.get("/simulation/status")
def get_simulation_status():
    return simulator.get_status()

@router.get("/defense/assets")
def get_protected_assets_status():
    """
    Mengembalikan status pemantauan aset infrastruktur pertahanan siber TNI AD.
    Menyesuaikan status secara dinamis berdasarkan apakah ada serangan aktif di simulator/jaringan.
    """
    sim_status = simulator.get_status()
    is_active = sim_status.get("active", False)
    current_attack = sim_status.get("current_attack", "NONE")

    server_web_status = "Aman"
    database_status = "Aman"
    vpn_status = "Aman"
    perimeter_status = "Aman"

    if is_active:
        if current_attack in ["PORT_SCAN", "SYN_FLOOD"]:
            perimeter_status = "Diserang"
            server_web_status = "Waspada"
        elif current_attack == "PING_FLOOD":
            vpn_status = "Diserang"
            perimeter_status = "Waspada"
        elif current_attack == "SSH_BRUTE_FORCE":
            server_web_status = "Diserang"
            database_status = "Waspada"

    return {
        "assets_monitored": 4,
        "assets": [
            {
                "name": "Gateway Perimeter Pussiberad",
                "ip": "10.10.20.1",
                "status": perimeter_status,
                "role": "Firewall & Ingress Filter",
                "traffic_health": "Degraded" if perimeter_status == "Diserang" else "Optimal"
            },
            {
                "name": "Server Web Portal AD",
                "ip": "10.10.20.80",
                "status": server_web_status,
                "role": "Public Defense Service",
                "traffic_health": "Degraded" if server_web_status == "Diserang" else "Optimal"
            },
            {
                "name": "VPN Komunikasi Taktis",
                "ip": "10.10.20.254",
                "status": vpn_status,
                "role": "Encrypted Command Tunnel",
                "traffic_health": "Degraded" if vpn_status == "Diserang" else "Optimal"
            },
            {
                "name": "Database Personel Pussiberad",
                "ip": "10.10.20.5",
                "status": database_status,
                "role": "Classified Records DB",
                "traffic_health": "Protected"
            }
        ]
    }
