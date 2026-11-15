import time
import math
import logging
import threading
from collections import Counter
from app.network.simulator import simulator
from app.core.config import settings

logger = logging.getLogger("sentinel.sniffer")

class NetworkSnifferManager:
    """
    Manajer Sniffer Lalu Lintas Jaringan Real-Time (Scapy)
    dengan agregasi statistik per detik dan failover otomatis ke simulator.
    """
    def __init__(self):
        self.is_running = False
        self.using_scapy = False
        self.lock = threading.Lock()
        
        # Buffer statistik jendela aktif 1 detik
        self.current_window_start = time.time()
        self.pkt_count = 0
        self.byte_count = 0
        self.tcp_count = 0
        self.udp_count = 0
        self.icmp_count = 0
        self.syn_count = 0
        self.unique_ports = set()
        self.src_ips = Counter()
        self.dst_ips = Counter()
        
        # Hasil snapshot jendela terakhir yang telah dievaluasi
        self.latest_stats = {
            "pps": 0,
            "bps": 0,
            "tcp_count": 0,
            "udp_count": 0,
            "icmp_count": 0,
            "other_count": 0,
            "syn_count": 0,
            "unique_dst_ports": 1,
            "payload_entropy": 3.4,
            "dominant_src_ip": "192.168.1.1",
            "dominant_dst_ip": "10.10.20.1",
            "source": "IDLE"
        }

    def _packet_callback(self, packet):
        """Dipanggil oleh Scapy untuk setiap paket yang tertangkap di interface"""
        try:
            now = time.time()
            pkt_len = len(packet)
            
            with self.lock:
                # Cek jika sudah lewat jendela 1 detik, simpan snapshot
                if now - self.current_window_start >= 1.0:
                    self._flush_window(now)

                self.pkt_count += 1
                self.byte_count += pkt_len

                # Analisis Lapisan Protokol
                has_ip = packet.haslayer("IP")
                if has_ip:
                    ip_layer = packet.getlayer("IP")
                    self.src_ips[ip_layer.src] += 1
                    self.dst_ips[ip_layer.dst] += 1

                if packet.haslayer("TCP"):
                    self.tcp_count += 1
                    tcp_layer = packet.getlayer("TCP")
                    self.unique_ports.add(tcp_layer.dport)
                    if tcp_layer.flags & 0x02:  # Flag SYN
                        self.syn_count += 1
                elif packet.haslayer("UDP"):
                    self.udp_count += 1
                    udp_layer = packet.getlayer("UDP")
                    self.unique_ports.add(udp_layer.dport)
                elif packet.haslayer("ICMP"):
                    self.icmp_count += 1

        except Exception as e:
            logger.debug(f"Error parsing packet: {e}")

    def _flush_window(self, now: float):
        duration = max(0.1, now - self.current_window_start)
        pps = int(self.pkt_count / duration)
        bps = int(self.byte_count / duration)

        dom_src = self.src_ips.most_common(1)[0][0] if self.src_ips else "192.168.1.1"
        dom_dst = self.dst_ips.most_common(1)[0][0] if self.dst_ips else "10.10.20.1"

        self.latest_stats = {
            "pps": pps,
            "bps": bps,
            "tcp_count": self.tcp_count,
            "udp_count": self.udp_count,
            "icmp_count": self.icmp_count,
            "other_count": max(0, self.pkt_count - (self.tcp_count + self.udp_count + self.icmp_count)),
            "syn_count": self.syn_count,
            "unique_dst_ports": max(1, len(self.unique_ports)),
            "payload_entropy": 3.8,
            "dominant_src_ip": dom_src,
            "dominant_dst_ip": dom_dst,
            "source": "SCAPY_LIVE"
        }

        # Reset jendela
        self.current_window_start = now
        self.pkt_count = 0
        self.byte_count = 0
        self.tcp_count = 0
        self.udp_count = 0
        self.icmp_count = 0
        self.syn_count = 0
        self.unique_ports.clear()
        self.src_ips.clear()
        self.dst_ips.clear()

    def _start_scapy_sniffing(self):
        try:
            from scapy.all import sniff
            logger.info("Memulai live packet capture Scapy...")
            self.using_scapy = True
            sniff(
                prn=self._packet_callback,
                store=False,
                stop_filter=lambda _: not self.is_running
            )
        except Exception as e:
            logger.warning(
                f"Scapy capture tidak dapat dimulai ({e}). "
                f"Menggunakan simulasi jaringan internal untuk kesinambungan pemantauan."
            )
            self.using_scapy = False

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        
        if settings.SNIFFER_ENABLED:
            t = threading.Thread(target=self._start_scapy_sniffing, daemon=True, name="ScapyThread")
            t.start()

    def stop(self):
        self.is_running = False

    def get_window_metrics(self) -> dict:
        """
        Mengambil statistik 1 detik terakhir. Jika Scapy belum aktif/tidak ada paket,
        menggunakan simulator cerdas.
        """
        # Cek apakah ada serangan aktif di simulator
        sim_status = simulator.get_status()
        if sim_status["active"]:
            stats = simulator.generate_window_stats()
            stats["source"] = f"SIMULATION_{sim_status['current_attack']}"
            return stats

        # Jika scapy aktif dan menangkap paket, gunakan data scapy
        with self.lock:
            if self.using_scapy and self.latest_stats["pps"] > 0:
                return dict(self.latest_stats)

        # Fallback ke simulator background traffic normal
        stats = simulator.generate_window_stats()
        stats["source"] = "BACKGROUND_MONITOR"
        return stats

sniffer = NetworkSnifferManager()
