import os
from pathlib import Path
from pydantic_settings import BaseSettings

CORE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CORE_DIR.parent.parent
ROOT_DIR = BACKEND_DIR.parent

def _resolve_default_db_url() -> str:
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        return env_url
    
    # Priority check existing database file with data
    candidates = [
        ROOT_DIR / "sentinel_local.db",
        BACKEND_DIR / "sentinel_local.db",
        ROOT_DIR / "database" / "sentinel_local.db"
    ]
    for c in candidates:
        if c.exists() and c.stat().st_size > 0:
            return f"sqlite:///{c.as_posix()}"
            
    return f"sqlite:///{(ROOT_DIR / 'sentinel_local.db').as_posix()}"

class Settings(BaseSettings):
    PROJECT_NAME: str = "SentinelAD"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Host
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Database URL: uses PostgreSQL if provided, otherwise SQLite for zero-config local run
    DATABASE_URL: str = _resolve_default_db_url()
    
    # Network Sniffing Settings
    SNIFFER_ENABLED: bool = os.getenv("SNIFFER_ENABLED", "true").lower() == "true"
    DEFAULT_NETWORK_INTERFACE: str = os.getenv("NETWORK_INTERFACE", "")
    ENABLE_SIMULATOR_FALLBACK: bool = True
    
    # ML Anomaly Detection Settings
    ML_CONTAMINATION: float = 0.05
    ANOMALY_THRESHOLD: float = 0.60
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]

    class Config:
        case_sensitive = True

settings = Settings()
