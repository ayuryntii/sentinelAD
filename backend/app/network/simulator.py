import time
import random
import threading
import logging

logger = logging.getLogger("sentinel.simulator")

class AttackSimulator:
    """
    Simulator Serangan Jaringan & Generator Trafik untuk demonstrasi SentinelAD.
    Mendukung skenario: NORMAL, PORT_SCAN, PING_FLOOD, SYN_FLOOD, SSH_BRUTE_FORCE.
    """
    def __init__(self):
        self.current_attack = None
        self.attack_end_time = 0
        self.lock = threading.Lock()

    def trigger_attack(self, attack_type: str, duration_seconds: int = 15):
        with self.lock:
            self.current_attack = attack_type.upper()
            self.attack_end_time = time.time() + duration_seconds
            logger.warning(f"SIMULASI SERANGAN AKTIF: {self.current_attack} selama {duration_seconds} detik")

    def stop_attack(self):
        with self.lock:
            self.current_attack = None
            self.attack_end_time = 0
            logger.info("SIMULASI SERANGAN DIHENTIKAN")

    def get_status(self) -> dict:
        with self.lock:
            is_active = self.current_attack is not None and time.time() < self.attack_end_time
            remaining = max(0, int(self.attack_end_time - time.time())) if is_active else 0
            return {
                "active": is_active,
                "current_attack": self.current_attack if is_active else "NONE",
                "remaining_seconds": remaining
            }

    def generate_window_stats(self) -> dict:
        """
        Menghasilkan statistik trafik 1 detik berdasarkan mode aktif (normal vs serangan).
        """
        status = self.get_status()
        active_mode = status["current_attack"] if status["active"] else "NORMAL"

        if active_mode == "PORT_SCAN":
            # Pemindaian banyak port tujuan berbeda dari satu IP penyerang
            target_ports = random.randint(25, 60)
            pps = random.randint(180, 320)
            bps = pps * random.randint(64, 84)
            tcp = int(pps * 0.95)
            syn = int(tcp * 0.90)
            return {
                "pps": pps,
                "bps": bps,
                "tcp_count": tcp,
                "udp_count": int(pps * 0.04),
                "icmp_count": int(pps * 0.01),
                "other_count": 0,
                "syn_count": syn,
                "unique_dst_ports": target_ports,
                "payload_entropy": round(random.uniform(2.1, 3.2), 2),
                "dominant_src_ip": "192.168.1.188",
                "dominant_dst_ip": "10.10.20.1",
                "threat_hint": "PORT_SCAN"
            }

        elif active_mode == "PING_FLOOD":
            # Banjir paket ICMP echo request masif
            pps = random.randint(550, 950)
            bps = pps * random.randint(128, 512)
            icmp = int(pps * 0.92)
            return {
                "pps": pps,
                "bps": bps,
                "tcp_count": int(pps * 0.05),
                "udp_count": int(pps * 0.03),
                "icmp_count": icmp,
                "other_count": 0,
                "syn_count": 0,
                "unique_dst_ports": 1,
                "payload_entropy": round(random.uniform(1.2, 2.0), 2),
                "dominant_src_ip": "103.145.22.4",
                "dominant_dst_ip": "10.10.20.254",
                "threat_hint": "PING_FLOOD"
            }

        elif active_mode == "SYN_FLOOD":
            # Banjir paket TCP SYN dengan spoofed / agresif
            pps = random.randint(700, 1200)
            bps = pps * random.randint(54, 74)
            tcp = int(pps * 0.98)
            syn = int(tcp * 0.95)
            return {
                "pps": pps,
                "bps": bps,
                "tcp_count": tcp,
                "udp_count": int(pps * 0.02),
                "icmp_count": 0,
                "other_count": 0,
                "syn_count": syn,
                "unique_dst_ports": random.randint(1, 3),
                "payload_entropy": round(random.uniform(2.0, 2.8), 2),
                "dominant_src_ip": "45.142.195.88",
                "dominant_dst_ip": "10.10.20.80",
                "threat_hint": "SYN_FLOOD"
            }

        elif active_mode == "SSH_BRUTE_FORCE":
            # Banyak koneksi berulang ke port 22
            pps = random.randint(120, 220)
            bps = pps * random.randint(90, 150)
            tcp = int(pps * 0.96)
            return {
                "pps": pps,
                "bps": bps,
                "tcp_count": tcp,
                "udp_count": int(pps * 0.04),
                "icmp_count": 0,
                "other_count": 0,
                "syn_count": int(tcp * 0.35),
                "unique_dst_ports": 1,
                "payload_entropy": round(random.uniform(4.5, 5.2), 2),
                "dominant_src_ip": "185.220.101.5",
                "dominant_dst_ip": "10.10.20.22",
                "threat_hint": "SSH_BRUTE_FORCE"
            }

        else:
            # Pola lalu lintas normal operasional
            pps = random.randint(20, 55)
            bps = pps * random.randint(400, 1400)
            tcp = int(pps * random.uniform(0.65, 0.85))
            udp = int(pps * random.uniform(0.10, 0.25))
            icmp = max(0, pps - tcp - udp)
            syn = int(tcp * random.uniform(0.02, 0.08))
            return {
                "pps": pps,
                "bps": bps,
                "tcp_count": tcp,
                "udp_count": udp,
                "icmp_count": icmp,
                "other_count": 0,
                "syn_count": syn,
                "unique_dst_ports": random.randint(1, 5),
                "payload_entropy": round(random.uniform(3.0, 4.5), 2),
                "dominant_src_ip": f"192.168.1.{random.randint(10, 80)}",
                "dominant_dst_ip": f"10.10.20.{random.randint(1, 20)}",
                "threat_hint": "NORMAL"
            }

simulator = AttackSimulator()
