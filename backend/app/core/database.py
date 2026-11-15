import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("sentinel.database")

db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(db_url, connect_args=connect_args)
except Exception as e:
    logger.warning(f"Failed to connect to primary DB {db_url}: {e}. Falling back to SQLite.")
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.models.incident import Incident  # ensure models are registered
    Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE incidents ADD COLUMN is_isolated BOOLEAN DEFAULT 0"))
            conn.commit()
    except Exception:
        pass

    # Ensure initial seed data exists if table is ever empty
    try:
        db = SessionLocal()
        if db.query(Incident).count() == 0:
            now = datetime.now(timezone.utc)
            seeds = [
                Incident(
                    timestamp=now - timedelta(minutes=10),
                    source_ip="192.168.1.105",
                    destination_ip="10.0.0.1",
                    protocol="TCP",
                    threat_type="SYN Flood Attack",
                    severity="CRITICAL",
                    anomaly_score=0.94,
                    packet_count=15200,
                    details="Lonjakan volume paket TCP SYN mencurigakan terdeteksi ke gateway pertahanan",
                    resolved=False,
                    is_isolated=True
                ),
                Incident(
                    timestamp=now - timedelta(minutes=5),
                    source_ip="192.168.1.188",
                    destination_ip="10.0.0.5",
                    protocol="TCP",
                    threat_type="Port Scanning (Nmap)",
                    severity="HIGH",
                    anomaly_score=0.86,
                    packet_count=1240,
                    details="Pemindaian masif terdeteksi pada rentang port 20-1024 dalam 2 detik",
                    resolved=False,
                    is_isolated=True
                ),
                Incident(
                    timestamp=now - timedelta(minutes=2),
                    source_ip="185.220.101.5",
                    destination_ip="10.0.0.2",
                    protocol="TCP",
                    threat_type="Brute Force SSH",
                    severity="HIGH",
                    anomaly_score=0.81,
                    packet_count=480,
                    details="Upaya autentikasi berulang pada port 22 melampaui batas ambang normal",
                    resolved=False,
                    is_isolated=False
                )
            ]
            db.add_all(seeds)
            db.commit()
            logger.info("Data awal (seed incidents) berhasil diinisialisasi ke database.")
        db.close()
    except Exception as e:
        logger.warning(f"Error checking/seeding initial incidents: {e}")

    logger.info(f"Database initialized successfully at: {db_url}")
