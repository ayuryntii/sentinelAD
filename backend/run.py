import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    print(f"==================================================")
    print(f"   SENTINEL-AD: CYBER DEFENSE EARLY WARNING SYSTEM")
    print(f"   Pussiberad TNI AD | Tim AyySec")
    print(f"==================================================")
    print(f" Memulai server pada http://{settings.HOST}:{settings.PORT}")
    print(f" Dokumentasi API Swagger: http://{settings.HOST}:{settings.PORT}/docs")
    print(f" WebSocket Endpoint: ws://{settings.HOST}:{settings.PORT}/api/v1/ws/traffic")
    print(f"==================================================")
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False,
        log_level="info"
    )
