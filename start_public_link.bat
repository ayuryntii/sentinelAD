@echo off
title SentinelAD - Public Demo Link Launcher
echo ========================================================
echo    SENTINEL-AD: PUBLIC DEMO LINK LAUNCHER
echo    Pussiberad TNI AD ^| Tim AyySec
echo ========================================================
echo.
echo [1/2] Menjalankan SentinelAD Server (Backend + Frontend)...
start "SentinelAD Server" cmd /k "cd /d "%~dp0\backend" && .venv\Scripts\python.exe run.py"

echo Menunggu server siap...
timeout /t 4 /nobreak >nul

echo.
echo [2/2] Membuka Public HTTPS Tunnel...
echo Link publik HTTPS Anda akan muncul di bawah ini.
echo Salin link tersebut dan berikan kepada Dewan Juri.
echo (Biarkan jendela ini tetap terbuka selama pengujian link)
echo.
echo ========================================================
echo.

ssh -o StrictHostKeyChecking=no -p 443 -R0:localhost:8000 a.pinggy.io
pause
