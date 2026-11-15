import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import init_db, SessionLocal
from app.models.incident import Incident
from app.ml_models.anomaly_detector import detector
from app.network.simulator import simulator

def run_tests():
    print("========================================")
    print("  SENTINEL-AD BACKEND PIPELINE VERIFIER")
    print("========================================")

    # 1. Test Database
    print("\n[1/4] Testing Database Initialization...")
    init_db()
    db = SessionLocal()
    test_incident = Incident(
        source_ip="192.168.1.99",
        destination_ip="10.0.0.1",
        protocol="TCP",
        threat_type="Test Port Scan",
        severity="HIGH",
        anomaly_score=0.88,
        packet_count=500,
        details="Unit test entry"
    )
    db.add(test_incident)
    db.commit()
    count = db.query(Incident).count()
    assert count >= 1, "Failed to insert test incident"
    db.delete(test_incident)
    db.commit()
    db.close()
    print(" -> Database test PASSED! (SQLite / SQLAlchemy functioning)")

    # 2. Test Anomaly Detector with Normal Traffic
    print("\n[2/4] Testing Anomaly Detector with Normal Traffic...")
    normal_traffic = {
        "pps": 35,
        "bps": 24000,
        "tcp_count": 28,
        "udp_count": 5,
        "icmp_count": 2,
        "syn_count": 1,
        "unique_dst_ports": 3,
        "payload_entropy": 3.4
    }
    normal_res = detector.evaluate_traffic_window(normal_traffic)
    print(f" -> Result: {normal_res['threat_type']}, Score: {normal_res['anomaly_score']}, Anomaly: {normal_res['is_anomaly']}")
    assert not normal_res["is_anomaly"], f"Expected normal traffic to NOT trigger anomaly, got {normal_res}"
    print(" -> Normal traffic test PASSED!")

    # 3. Test Anomaly Detector with Port Scan Attack
    print("\n[3/4] Testing Anomaly Detector with Port Scanning Attack...")
    simulator.trigger_attack("PORT_SCAN", 10)
    port_scan_traffic = simulator.generate_window_stats()
    scan_res = detector.evaluate_traffic_window(port_scan_traffic)
    print(f" -> Result: {scan_res['threat_type']}, Score: {scan_res['anomaly_score']}, Severity: {scan_res['severity']}")
    assert scan_res["is_anomaly"], "Expected Port Scan to trigger anomaly!"
    assert "Port Scanning" in scan_res["threat_type"], f"Expected Port Scanning threat type, got {scan_res['threat_type']}"
    print(" -> Port scan detection test PASSED!")

    # 4. Test Anomaly Detector with Ping Flood
    print("\n[4/4] Testing Anomaly Detector with ICMP / Ping Flood...")
    simulator.trigger_attack("PING_FLOOD", 10)
    ping_traffic = simulator.generate_window_stats()
    ping_res = detector.evaluate_traffic_window(ping_traffic)
    print(f" -> Result: {ping_res['threat_type']}, Score: {ping_res['anomaly_score']}, Severity: {ping_res['severity']}")
    assert ping_res["is_anomaly"], "Expected Ping Flood to trigger anomaly!"
    simulator.stop_attack()
    print(" -> Ping flood detection test PASSED!")

    print("\n========================================")
    print(" ALL BACKEND PIPELINE TESTS PASSED 100%!")
    print("========================================")

if __name__ == "__main__":
    run_tests()
