# 🛡️ SentinelAD: Cyber Defense & Early Warning System

[![Kartika Cyber Hackathon 2026](https://img.shields.io/badge/Kartika%20Cyber%20Hackathon-2026-red?style=for-the-badge&logo=shield)](https://github.com)
[![Pussiberad TNI AD](https://img.shields.io/badge/Pusat%20Siber-TNI%20AD-darkgreen?style=for-the-badge)](https://github.com)
[![Category: Defensive Shield](https://img.shields.io/badge/Category-Defensive%20Shield-blue?style=for-the-badge)](https://github.com)
[![Team: AyySec](https://img.shields.io/badge/Team-AyySec-amber?style=for-the-badge)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)](https://python.org)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Isolation%20Forest-F7931E?style=flat-square&logo=scikit-learn)](https://scikit-learn.org)
[![React 18](https://img.shields.io/badge/React-18-20232A?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com)

**Platform Dasbor Pemantauan Pertahanan Siber Real-Time & Otomatisasi Respons Insiden Berbasis Machine Learning.**  
*Dibuat oleh Tim **AyySec** untuk ajang **Kartika Cyber Hackathon 2026** (Pusat Siber TNI AD x Codepolitan x Seventh Avenue Production).*

---

## 📋 Deskripsi Proyek
**SentinelAD** adalah platform pemantauan keamanan jaringan (*Tactical Cybersecurity Operations Dashboard*) real-time yang dirancang untuk mendeteksi anomali lalu lintas data, serangan siber (DDoS, Port Scanning, SYN Flood, Brute Force), dan ancaman *Zero-Day* sebelum melumpuhkan infrastruktur pertahanan siber TNI AD.

Sistem ini mengintegrasikan penangkapan paket data (*Packet Sniffing*) berbasis **Scapy**, model Machine Learning **Isolation Forest (Scikit-Learn)** untuk deteksi anomali tanpa *hardcoded signatures*, saluran telemetri per detik melalui **WebSockets**, serta dasbor taktis **React 18 + Tailwind CSS** bergaya militer (*Cyber Command Dark Interface*) yang dilengkapi sistem alarm visual dan sirene sintetis (*Web Audio API*).

---

## ✨ Fitur Unggulan

1. **Real-time Network Traffic Monitoring:** Visualisasi grafik telemetri interaktif per detik (PPS, Throughput KB/s, Breakdown TCP/UDP/ICMP) secara langsung tanpa perlu me-refresh halaman web (via WebSocket).
2. **AI-Based Anomaly Detection:** Deteksi anomali berbasis Machine Learning (*Isolation Forest* dengan 120 estimator) yang memantau deviasi rasio SYN, pola port tujuan, dan rasio lonjakan paket.
3. **Instant Threat Alert & Tactical Siren:** Peringatan pop-up merah instan saat terjadi anomali disertai sirene peringatan audio sintetis untuk menarik perhatian petugas jaga siber.
4. **Interactive Attack Simulator (Pitching Demo Mode):** Panel komando satu klik untuk memicu skenario serangan siber (Port Scanning Nmap, ICMP Ping Flood, TCP SYN Flood, SSH Brute Force) guna mendemonstrasikan kemampuan AI dan responsivitas dasbor di hadapan juri.
5. **Incident Logging & Forensic Audit:** Pencatatan otomatis setiap anomali ke database, filter keparahan (CRITICAL, HIGH, MEDIUM, LOW), penandaan status selesai (*Resolve*), serta fitur unduh laporan audit **Ekspor CSV**.
6. **Geolocation & Radar Intel:** Visualisasi radar taktis pemindai sektor dan identifikasi IP sumber penyerang (LAN Militer vs Relai Publik Asing).
7. **Hybrid Engine:** Mendukung *Live Packet Sniffing* aktual via Scapy serta *failover* otomatis ke simulasi telemetri tanpa risiko *crash* jika host tidak memiliki driver Npcap atau hak akses administrator.

---

## 🏗️ Arsitektur & Tech Stack

```text
/securityAD
│
├── /backend                 # Python FastAPI Backend
│   ├── /app
│   │   ├── /api             # REST API & WebSocket Telemetry
│   │   ├── /core            # Konfigurasi & SQLite/PostgreSQL Database
│   │   ├── /ml_models       # Isolation Forest Anomaly Detection (Scikit-Learn)
│   │   ├── /models          # SQLAlchemy Schema (Incidents & Traffic History)
│   │   ├── /network         # Scapy Sniffer & Attack Simulator Engine
│   │   └── main.py          # Entry point FastAPI
│   ├── requirements.txt
│   ├── run.py
│   └── Dockerfile
│
├── /frontend                # React.js (Vite) + TypeScript
│   ├── /src
│   │   ├── /components      # Header, StatCards, TrafficChart, Alerts, Radar
│   │   ├── /services        # Axios API & Reconnecting WebSocket Client
│   │   ├── /types           # TypeScript Type Definitions
│   │   ├── App.tsx          # Tactical Command Dashboard
│   │   └── main.tsx
│   ├── tailwind.config.js   # Palet Warna Tactical Military (Dark Slate & Emerald)
│   ├── package.json
│   └── Dockerfile
│
├── /database
│   └── init.sql             # Skema Tabel PostgreSQL
│
├── docker-compose.yml       # Orkestrasi Multi-Container
├── start_backend.bat        # Windows One-Click Backend Launcher
└── start_frontend.bat       # Windows One-Click Frontend Launcher
```

---

## 🚀 Panduan Menjalankan Sistem

### Opsi 1: Menjalankan dengan Docker Compose (Rekomendasi Server Produksi)
Jalankan satu perintah dari direktori utama:
```bash
docker-compose up --build
```
Aplikasi akan aktif pada:
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Database PostgreSQL:** Port 5432

---

### Opsi 2: Menjalankan Langsung di Windows (Zero-Config Development)

#### 1. Jalankan Backend (FastAPI):
Klik dua kali file `start_backend.bat`, atau via terminal:
```powershell
cd backend
python -m pip install -r requirements.txt
python run.py
```
*(Backend otomatis menginisialisasi SQLite lokal `sentinel_local.db` tanpa memerlukan instalasi PostgreSQL terpisah).*

#### 2. Jalankan Frontend (React + Vite):
Klik dua kali file `start_frontend.bat`, atau via terminal:
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🎯 Panduan Skenario Demo Hackathon (Pitching Walkthrough)

Untuk mendemonstrasikan SentinelAD di hadapan juri:
1. Buka dasbor pada [http://localhost:3000](http://localhost:3000).
2. Perhatikan indikator:
   - **Status Telemetri:** `ONLINE` (Hijau berkedip).
   - **DEFCON Level:** `DEFCON 4 (NORMAL)`.
   - **Grafik Telemetri:** Bergerak real-time menunjukkan lalu lintas operasional normal (30-50 PPS).
3. Pada panel **"PANEL KONTROL SIMULASI SERANGAN"**:
   - Klik tombol **"Port Scanning (Nmap)"**.
   - Seketika grafik telemetri melonjak dan berubah warna menjadi merah.
   - Algoritma Machine Learning mendeteksi pemindaian multi-port: Muncul notifikasi pop-up merah **"WARNING: Port Scanning (Reconnaissance)"** dengan akurasi AI ~88%.
   - Suara sirene peringatan berbunyi otomatis.
   - Status DEFCON meningkat menjadi siaga.
   - Blip merah musuh muncul pada radar pemindai sektor.
4. Klik tombol **"Tandai Selesai"** pada tabel Incident Log atau klik **"Ekspor CSV"** untuk memperlihatkan berkas laporan audit forensik siber.
5. Klik **"Hentikan Serangan"** untuk mengembalikan sistem ke kondisi normal.
