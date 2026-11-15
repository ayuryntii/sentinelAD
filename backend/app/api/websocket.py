import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.network.sniffer import sniffer
from app.network.simulator import simulator
from app.ml_models.anomaly_detector import detector
from app.core.database import SessionLocal
from app.models.incident import Incident, TrafficHistory

logger = logging.getLogger("sentinel.ws")

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"Dashboard client terhubung. Total klien: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"Dashboard client terputus. Sisa klien: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
        payload = json.dumps(message)
        dead_connections = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                dead_connections.add(connection)
        for dead in dead_connections:
            self.active_connections.discard(dead)

manager = ConnectionManager()
broadcast_task = None

def _persist_incident_and_history(stats: dict, analysis: dict):
    """Menyimpan anomali terdeteksi dan riwayat statistik ke database secara non-blocking"""
    db = SessionLocal()
    try:
        # Rekam history statistik
        history = TrafficHistory(
            packets_per_second=stats.get("pps", 0),
            bytes_per_second=stats.get("bps", 0),
            tcp_count=stats.get("tcp_count", 0),
            udp_count=stats.get("udp_count", 0),
            icmp_count=stats.get("icmp_count", 0),
            other_count=stats.get("other_count", 0),
            is_anomaly=analysis.get("is_anomaly", False)
        )
        db.add(history)

        # Rekam insiden jika anomali
        if analysis.get("is_anomaly", False):
            # Tentukan protokol dominan
            proto = "TCP"
            if stats.get("icmp_count", 0) > stats.get("tcp_count", 0):
                proto = "ICMP"
            elif stats.get("udp_count", 0) > stats.get("tcp_count", 0):
                proto = "UDP"

            incident = Incident(
                source_ip=stats.get("dominant_src_ip", "192.168.1.100"),
                destination_ip=stats.get("dominant_dst_ip", "10.10.20.1"),
                protocol=proto,
                threat_type=analysis.get("threat_type", "Zero-Day Traffic Anomaly"),
                severity=analysis.get("severity", "HIGH"),
                anomaly_score=analysis.get("anomaly_score", 0.75),
                packet_count=stats.get("pps", 1),
                details=analysis.get("details", "")
            )
            db.add(incident)

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error menyimpan riwayat insiden ke database: {e}")
    finally:
        db.close()

async def traffic_broadcast_loop():
    """Loop background yang mengambil statistik per detik, mengevaluasi AI, dan memancarkan ke WebSocket"""
    logger.info("Loop siaran metrik lalu lintas real-time dimulai.")
    while True:
        try:
            stats = sniffer.get_window_metrics()
            analysis = detector.evaluate_traffic_window(stats)
            sim_status = simulator.get_status()

            payload = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "pps": stats.get("pps", 0),
                "bps": stats.get("bps", 0),
                "bandwidth_kbps": round((stats.get("bps", 0) * 8) / 1024, 2),
                "protocols": {
                    "TCP": stats.get("tcp_count", 0),
                    "UDP": stats.get("udp_count", 0),
                    "ICMP": stats.get("icmp_count", 0),
                    "OTHER": stats.get("other_count", 0),
                },
                "traffic_source": stats.get("source", "MONITOR"),
                "dominant_src_ip": stats.get("dominant_src_ip", "192.168.1.1"),
                "dominant_dst_ip": stats.get("dominant_dst_ip", "10.10.20.1"),
                "unique_dst_ports": stats.get("unique_dst_ports", 1),
                "analysis": analysis,
                "simulation": sim_status
            }

            # Rekam ke database di background thread
            asyncio.get_event_loop().run_in_executor(None, _persist_incident_and_history, stats, analysis)

            # Siarkan ke semua dasbor aktif
            await manager.broadcast(payload)

        except Exception as e:
            logger.error(f"Error pada loop siaran trafik: {e}")

        await asyncio.sleep(1.0)

@router.websocket("/ws/traffic")
async def websocket_traffic_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Tetap jaga koneksi aktif & terima perintah jika klien mengirim pesan
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
                action = parsed.get("action")
                if action == "TRIGGER_ATTACK":
                    simulator.trigger_attack(
                        attack_type=parsed.get("attack_type", "PORT_SCAN"),
                        duration_seconds=int(parsed.get("duration", 15))
                    )
                elif action == "STOP_ATTACK":
                    simulator.stop_attack()
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client error: {e}")
        manager.disconnect(websocket)
