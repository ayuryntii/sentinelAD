import logging
import numpy as np
from sklearn.ensemble import IsolationForest

logger = logging.getLogger("sentinel.ml")

class NetworkAnomalyDetector:
    """
    Deteksi Anomali Jaringan berbasis Machine Learning (Isolation Forest)
    untuk Komando Pertahanan Siber (SentinelAD).
    """
    def __init__(self, contamination: float = 0.05):
        self.contamination = contamination
        self.model = IsolationForest(
            n_estimators=120,
            max_samples='auto',
            contamination=self.contamination,
            random_state=42
        )
        self.is_fitted = False
        self._train_baseline()

    def _generate_normal_baseline_data(self, n_samples: int = 1500) -> np.ndarray:
        """
        Menghasilkan distribusi profil lalu lintas normal jaringan militer/kantor:
        Fitur:
        0: packets_per_second (PPS) ~ N(35, 12)
        1: bytes_per_second (BPS) ~ N(25000, 8000)
        2: syn_ratio ~ Uniform(0.01, 0.12)
        3: unique_dst_ports ~ Uniform(1, 6)
        4: icmp_ratio ~ Uniform(0.00, 0.05)
        5: payload_entropy ~ Uniform(2.5, 4.8)
        """
        np.random.seed(42)
        pps = np.clip(np.random.normal(35, 12, n_samples), 5, 120)
        bps = np.clip(np.random.normal(25000, 8000, n_samples), 2000, 100000)
        syn_ratio = np.clip(np.random.uniform(0.01, 0.10, n_samples), 0.0, 0.20)
        unique_dst_ports = np.clip(np.random.poisson(2.5, n_samples), 1, 8)
        icmp_ratio = np.clip(np.random.uniform(0.00, 0.04, n_samples), 0.0, 0.08)
        entropy = np.random.uniform(2.5, 4.8, n_samples)

        return np.column_stack([pps, bps, syn_ratio, unique_dst_ports, icmp_ratio, entropy])

    def _train_baseline(self):
        """Melatih model Isolation Forest dengan profil lalu lintas normal."""
        try:
            logger.info("Melatih model Isolation Forest baseline untuk deteksi anomali jaringan...")
            X_train = self._generate_normal_baseline_data()
            self.model.fit(X_train)
            self.is_fitted = True
            logger.info("Model Isolation Forest berhasil dilatih & siap mendeteksi anomali.")
        except Exception as e:
            logger.error(f"Gagal melatih model ML baseline: {e}")

    def evaluate_traffic_window(self, window_stats: dict) -> dict:
        """
        Mengevaluasi jendela lalu lintas 1 detik dan mengembalikan analisis anomali.
        Input dictionary:
        {
            "pps": int,
            "bps": int,
            "syn_count": int,
            "tcp_count": int,
            "udp_count": int,
            "icmp_count": int,
            "unique_dst_ports": int,
            "payload_entropy": float,
            "dominant_src_ip": str,
            "dominant_dst_ip": str
        }
        """
        pps = window_stats.get("pps", 0)
        bps = window_stats.get("bps", 0)
        tcp_count = window_stats.get("tcp_count", 0)
        syn_count = window_stats.get("syn_count", 0)
        icmp_count = window_stats.get("icmp_count", 0)
        unique_ports = window_stats.get("unique_dst_ports", 1)
        entropy = window_stats.get("payload_entropy", 3.5)

        total_pkts = max(1, pps)
        syn_ratio = syn_count / total_pkts if total_pkts > 0 else 0.0
        icmp_ratio = icmp_count / total_pkts if total_pkts > 0 else 0.0

        features = np.array([[pps, bps, syn_ratio, unique_ports, icmp_ratio, entropy]])

        # Hitung skor anomali dari Isolation Forest
        if self.is_fitted:
            raw_score = self.model.decision_function(features)[0]
            # Normalisasi raw_score (nilai negatif mengindikasikan anomali kuat)
            # Nilai tipikal berkisar antara -0.3 s/d +0.2 -> petakan ke skala 0 s/d 1
            anomaly_score = float(np.clip(0.5 - (raw_score * 2.2), 0.05, 0.99))
            ml_prediction = self.model.predict(features)[0]  # -1 = anomali, 1 = normal
        else:
            anomaly_score = 0.10
            ml_prediction = 1

        # Heuristik Klasifikasi Tipe Ancaman Spesifik Siber
        threat_type = "NORMAL"
        severity = "LOW"
        details = "Lalu lintas jaringan dalam batas operasi normal"
        is_threat = False

        if unique_ports >= 15:
            is_threat = True
            threat_type = "Port Scanning (Reconnaissance)"
            severity = "HIGH"
            anomaly_score = max(anomaly_score, 0.88)
            details = f"Aktivitas pemindaian masif terdeteksi pada {unique_ports} port target berbeda secara simultan."

        elif icmp_ratio > 0.50 and pps >= 150:
            is_threat = True
            threat_type = "ICMP / Ping Flood (DDoS)"
            severity = "CRITICAL"
            anomaly_score = max(anomaly_score, 0.94)
            details = f"Lonjakan paket ICMP ekstrem ({icmp_count} pkts/detik, rasio {int(icmp_ratio*100)}%) membanjiri antarmuka."

        elif syn_ratio > 0.60 and pps >= 200:
            is_threat = True
            threat_type = "TCP SYN Flood Attack"
            severity = "CRITICAL"
            anomaly_score = max(anomaly_score, 0.96)
            details = f"Anomali SYN Flood terdeteksi dengan {syn_count} paket SYN tak bertuan berpotensi melumpuhkan koneksi."

        elif pps > 600 or bps > 12000000:  # > 12 MB/s
            is_threat = True
            threat_type = "Volumetric DDoS Spike"
            severity = "CRITICAL"
            anomaly_score = max(anomaly_score, 0.92)
            details = f"Lonjakan volume paket abnormal: {pps} pps ({round(bps/1024/1024, 2)} MB/s)."

        elif ml_prediction == -1 and anomaly_score > 0.65:
            is_threat = True
            threat_type = "Zero-Day Traffic Anomaly"
            severity = "MEDIUM" if anomaly_score < 0.80 else "HIGH"
            details = f"Pola distribusi paket menyimpang secara signifikan dari baseline Machine Learning (Skor: {round(anomaly_score, 2)})."

        return {
            "is_anomaly": is_threat,
            "threat_type": threat_type,
            "severity": severity,
            "anomaly_score": round(anomaly_score, 2),
            "details": details,
            "features_analyzed": {
                "pps": pps,
                "bps": bps,
                "syn_ratio": round(syn_ratio, 2),
                "unique_dst_ports": unique_ports,
                "icmp_ratio": round(icmp_ratio, 2),
                "entropy": round(entropy, 2)
            }
        }

# Global singleton
detector = NetworkAnomalyDetector()
