@echo off
title SentinelAD - Backend Server (FastAPI + Scapy + ML)
echo ========================================================
echo    SENTINEL-AD: CYBER DEFENSE EARLY WARNING SYSTEM
echo    Pussiberad TNI AD | Tim AyySec
echo ========================================================
echo Memeriksa lingkungan Python...

cd /d "%~dp0\backend"

if exist ".venv\Scripts\python.exe" (
    echo Menggunakan Virtual Environment (.venv)...
    .venv\Scripts\python.exe run.py
) else (
    echo Menggunakan System Python...
    python run.py
)

pause
