@echo off
title SentinelAD - Public Demo Link Launcher (Cloudflare)
echo ========================================================
echo    SENTINEL-AD: CLOUDFLARE PUBLIC DEMO LAUNCHER
echo    Pussiberad TNI AD ^| Tim AyySec
echo ========================================================
echo.
echo [1/2] Memastikan Server SentinelAD aktif di port 8000...
start /min "SentinelAD Server" cmd /k "cd /d "%~dp0\backend" && .venv\Scripts\python.exe run.py"

echo Menunggu server siap...
timeout /t 3 /nobreak >nul

echo.
echo [2/2] Membuka Cloudflare Secure HTTPS Tunnel...
echo Cari baris: "https://...trycloudflare.com" di bawah ini.
echo Salin link tersebut dan berikan kepada Dewan Juri!
echo (Biarkan jendela ini tetap terbuka selama link diakses)
echo.
echo ========================================================
echo.

"%~dp0\cloudflared.exe" tunnel --url http://127.0.0.1:8000
pause
