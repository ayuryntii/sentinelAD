@echo off
title SentinelAD - Frontend Tactical Dashboard (React + Vite)
echo ========================================================
echo    SENTINEL-AD: TACTICAL DEFENSE DASHBOARD
echo    Pussiberad TNI AD | Tim AyySec
echo ========================================================
echo Memulai frontend Vite pada port 3000...
echo.

cd /d "%~dp0\frontend"
npm.cmd run dev
pause
