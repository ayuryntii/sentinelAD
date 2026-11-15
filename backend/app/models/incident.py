from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, BigInteger
from app.core.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    source_ip = Column(String(45), nullable=False, index=True)
    destination_ip = Column(String(45), nullable=False)
    protocol = Column(String(10), nullable=False)
    threat_type = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)  # CRITICAL, HIGH, MEDIUM, LOW
    anomaly_score = Column(Float, nullable=False)
    packet_count = Column(Integer, default=1)
    details = Column(Text, nullable=True)
    resolved = Column(Boolean, default=False)
    is_isolated = Column(Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "source_ip": self.source_ip,
            "destination_ip": self.destination_ip,
            "protocol": self.protocol,
            "threat_type": self.threat_type,
            "severity": self.severity,
            "anomaly_score": round(self.anomaly_score, 2),
            "packet_count": self.packet_count,
            "details": self.details,
            "resolved": self.resolved,
            "is_isolated": getattr(self, "is_isolated", False)
        }

class TrafficHistory(Base):
    __tablename__ = "traffic_history"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    packets_per_second = Column(Integer, nullable=False)
    bytes_per_second = Column(BigInteger, nullable=False)
    tcp_count = Column(Integer, default=0)
    udp_count = Column(Integer, default=0)
    icmp_count = Column(Integer, default=0)
    other_count = Column(Integer, default=0)
    is_anomaly = Column(Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "packets_per_second": self.packets_per_second,
            "bytes_per_second": self.bytes_per_second,
            "tcp_count": self.tcp_count,
            "udp_count": self.udp_count,
            "icmp_count": self.icmp_count,
            "other_count": self.other_count,
            "is_anomaly": self.is_anomaly
        }
