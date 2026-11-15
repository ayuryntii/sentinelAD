import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.network.sniffer import sniffer
from app.api.websocket import router as ws_router, traffic_broadcast_loop
from app.api.routes_incidents import router as incidents_router
from app.api.routes_stats import router as stats_router

# Konfigurasi logging terstruktur
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("sentinel.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inisialisasi Database
    logger.info("Menginisialisasi skema database SentinelAD...")
    init_db()

    # Memulai packet sniffer background
    logger.info("Memulai Network Sniffer Engine...")
    sniffer.start()

    # Memulai loop siaran WebSocket metrik real-time
    logger.info("Memulai Background Telemetry Broadcast Loop...")
    broadcast_task = asyncio.create_task(traffic_broadcast_loop())

    yield

    # Shutdown
    logger.info("Mematikan Network Sniffer & Telemetry Tasks...")
    sniffer.stop()
    broadcast_task.cancel()
    try:
        await broadcast_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="SentinelAD - Platform Dasbor Pemantauan Pertahanan Siber & Deteksi Anomali Jaringan (Pussiberad TNI AD)",
    lifespan=lifespan
)

# CORS Middleware agar Frontend React dapat mengakses API & WebSocket
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrasi Router
app.include_router(stats_router, prefix=settings.API_V1_STR, tags=["Stats & Simulation"])
app.include_router(incidents_router, prefix=settings.API_V1_STR, tags=["Incident Logs"])
app.include_router(ws_router, prefix=settings.API_V1_STR, tags=["WebSocket Telemetry"])

# Mount Frontend Build jika tersedia (Single-Port Production & Public Link Mode)
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if not FRONTEND_DIST.exists():
    FRONTEND_DIST = Path(__file__).resolve().parent.parent / "dist"

if FRONTEND_DIST.exists():
    logger.info(f"Frontend dist terdeteksi di {FRONTEND_DIST}, mengaktifkan Single-Port Web Dashboard.")
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json"]:
            return None
        candidate = FRONTEND_DIST / full_path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "service": "SentinelAD API",
            "team": "AyySec",
            "category": "Penangkalan (Early Warning System)",
            "organization": "Pussiberad TNI AD",
            "docs": "/docs",
            "status": "OPERATIONAL"
        }
