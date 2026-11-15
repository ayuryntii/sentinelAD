-- Skema Database SentinelAD (TNI AD - Cyber Defense Early Warning System)

CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_ip VARCHAR(45) NOT NULL,
    destination_ip VARCHAR(45) NOT NULL,
    protocol VARCHAR(10) NOT NULL,
    threat_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    anomaly_score FLOAT NOT NULL,
    packet_count INTEGER NOT NULL DEFAULT 1,
    details TEXT,
    resolved BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON incidents(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_threat_type ON incidents(threat_type);

CREATE TABLE IF NOT EXISTS traffic_history (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    packets_per_second INTEGER NOT NULL,
    bytes_per_second BIGINT NOT NULL,
    tcp_count INTEGER DEFAULT 0,
    udp_count INTEGER DEFAULT 0,
    icmp_count INTEGER DEFAULT 0,
    other_count INTEGER DEFAULT 0,
    is_anomaly BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_traffic_timestamp ON traffic_history(timestamp DESC);

-- Contoh data awal simulasi jika dibutuhkan audit
INSERT INTO incidents (timestamp, source_ip, destination_ip, protocol, threat_type, severity, anomaly_score, packet_count, details)
VALUES 
    (NOW() - INTERVAL '10 minutes', '192.168.1.105', '10.0.0.1', 'TCP', 'SYN Flood Attack', 'CRITICAL', 0.94, 15200, 'Lonjakan volume paket TCP SYN mencurigakan terdeteksi ke gateway pertahanan'),
    (NOW() - INTERVAL '5 minutes', '192.168.1.188', '10.0.0.5', 'TCP', 'Port Scanning (Nmap)', 'HIGH', 0.86, 1240, 'Pemindaian masif terdeteksi pada rentang port 20-1024 dalam 2 detik'),
    (NOW() - INTERVAL '2 minutes', '185.220.101.5', '10.0.0.2', 'TCP', 'Brute Force SSH', 'HIGH', 0.81, 480, 'Upaya autentikasi berulang pada port 22 melampaui batas ambang normal');
