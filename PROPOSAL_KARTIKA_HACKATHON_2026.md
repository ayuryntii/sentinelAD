# 📋 PROPOSAL & DOKUMEN PRESENTASI PROYEK
## KARTIKA CYBER HACKATHON 2026
**Penyelenggara:** Pusat Siber TNI AD (Pussiberad) x Codepolitan x Seventh Avenue Production  

---

### 1. IDENTITAS PROYEK & TIM
*   **Nama Proyek:** SentinelAD
*   **Tagline:** *Real-Time Network Anomaly Early Warning & Automated Incident Response System*
*   **Nama Tim:** AyySec
*   **Kategori Kompetisi:** **Defensive Shield (Penangkalan)**
*   **Kategori Pendukung:** **Core Infra (Infrastruktur Siber)**
*   **Target Implementasi:** Satuan Operasi & Monitoring Pusat Siber TNI AD (Pussiberad) dan Jaringan Komunikasi Terpadu Kodam/Kostrad.

---

### 2. LATAR BELAKANG & PROBLEM STATEMENT
Infrastruktur teknologi informasi dan komunikasi militer TNI AD menghadapi lonjakan ancaman siber yang kian asimetris dan bervariasi:
1.  **Keterlambatan Deteksi (Reaktif vs Proaktif):** Sistem keamanan perimeter tradisional umumnya bekerja secara reaktif berdasarkan *signature* statis yang lambat merespons ancaman *Zero-Day* atau taktik pengintaian (*reconnaissance*) seperti pemindaian port siluman (*stealth port scanning*).
2.  **Ketiadaan Visibilitas Telemetri Real-Time:** Operator siber sering kali harus membedah berkas *log* raksasa secara manual pasca serangan terjadi, sehingga kehilangan *golden time* untuk menahan eksfiltrasi data.
3.  **Kesenjangan Otomatisasi Respons Insiden:** Ketika anomali terdeteksi, isolasi terhadap alamat IP penyerang kerap membutuhkan persetujuan berbelit yang memakan waktu krusial, memungkinkan serangan berkembang menjadi *full-scale volumetric DDoS* atau *ransomware*.

---

### 3. SOLUSI YANG DIUSULKAN: SENTINELAD
**SentinelAD** adalah platform dasbor terpadu berbasis web yang dirancang khusus untuk memenuhi standar operasi pertahanan siber militer:
1.  **Packet Sniffing Tanpa Henti (Scapy Engine):** Menangkap dan mengagregasi lalu lintas paket data jaringan lokal secara kontinu per 1 detik (*PPS, Throughput, Protocol Distribution*).
2.  **Kecerdasan Buatan (Machine Learning Isolation Forest):** Menggunakan model AI tanpa *hardcoded signature* yang dilatih dengan 120 *decision trees* untuk mendeteksi deviasi pola jaringan (rasio TCP SYN, sebaran port tujuan, anomali ICMP/UDP, dan entropi payload).
3.  **Sistem Peringatan Dini & Alarm Taktis (Early Warning System):** Notifikasi pop-up merah instan, visualisasi radar sektor, serta sirene audio taktis sintetis (Web Audio API) yang langsung menarik perhatian komandan/petugas jaga siber saat serangan terpicu.
4.  **Otomatisasi Respons Insiden (Defensive Shield Alignment):** Fitur isolasi IP otomatis dan manual 1-klik (*firewall rule injection*) untuk memutus akses host mencurigakan ke node-node kritis pertahanan (Web Portal, Database Personel, VPN Taktis).
5.  **Audit Forensik & Ekspor Laporan:** Pencatatan otomatis setiap insiden ke basis data relasional lengkap dengan skor kepastian AI dan fitur ekspor berkas audit resmi (CSV).

---

### 4. MATRIKS KESESUAIAN DENGAN REKOMENDASI PANITIA

| Panduan Resmi Panitia (Slide Defensive Shield) | Fitur Implementasi SentinelAD | Keunggulan Kompetitif AyySec |
| :--- | :--- | :--- |
| **Grafik Pemantauan Lalu Lintas (Lonjakan tidak wajar)** | Live Network Traffic Telemetry (Recharts AreaChart) | Streaming asinkron via WebSocket non-reload per detik |
| **Deteksi Port Scanning (103.xx.xx.21)** | Deteksi multi-port probe (Nmap reconnaissance) | Estimasi AI Score deviasi + IP Intelligence |
| **Percobaan Login Berulang / Brute Force** | Skenario deteksi SSH / RDP credential flooding | Analisis frekuensi koneksi port 22 & entropi |
| **Perangkat Terinfeksi Diisolasi Otomatis** | Fitur *Active IP Isolation* & Status *Mitigated* | Integrasi iptables simulation & 1-klik Unblock |
| **Pemantauan Status Aset Kritis (Core Infra)** | Panel Status Aset Militer (Gateway, DB, VPN) | Status reaktif dinamis saat diserang |

---

### 5. ARSITEKTUR TEKNOLOGI & STACK
*   **Backend & AI Engine:**
    *   **Python 3.11 + FastAPI:** Framework REST API & WebSocket berperforma tinggi dan berlatensi ultra-rendah.
    *   **Scapy:** Library penangkap paket data mentah (*raw socket sniffing*).
    *   **Scikit-Learn (Isolation Forest):** Algoritma *unsupervised learning* untuk deteksi anomali.
    *   **SQLAlchemy + PostgreSQL / SQLite:** Penyimpanan terstruktur relasional riwayat insiden dan histori trafik.
*   **Frontend & User Interface:**
    *   **React 18 + Vite + TypeScript:** Fondasi UI cepat, modular, dan bebas *type error*.
    *   **Tailwind CSS:** Desain modern bertema *Cyber Command Dark Slate & Tactical Radar Emerald*.
    *   **Recharts:** Visualisasi grafik telemetri dinamis.
    *   **Lucide Icons & Web Audio API:** Ikonografi taktis dan sintesis audio peringatan darurat.
*   **Infrastruktur & Orkestrasi:**
    *   **Docker & Docker Compose:** Siap dipasang di server Linux Pussiberad dengan satu perintah (`docker-compose up`).
    *   **Hybrid Engine:** Failover otomatis ke simulator jika driver penangkap paket tidak tersedia, menjamin demo pitching 100% andal di segala situasi.

---

### 6. SKENARIO DEMO PITCHING (3 MENIT)
1.  **Menit 1 (Kondisi Normal):** Menunjukkan dasbor dengan indikator `DEFCON 4 (NORMAL)`, grafik telemetri hijau stabil (30-50 PPS), dan seluruh aset berstatus `Aman`.
2.  **Menit 2 (Serangan Berlangsung):** Menekan tombol simulasi serangan `Port Scanning (Nmap)`. Menunjukkan grafik melonjak merah, sirene alarm berbunyi, pop-up peringatan muncul dengan akurasi AI 88%, dan blip musuh terdeteksi di radar sektor.
3.  **Menit 3 (Respons Insiden & Audit):** Menekan tombol `Isolasi IP`, memperlihatkan status perangkat berubah menjadi `Terisolasi Otomatis`, memeriksa log forensik siber, lalu mengunduh berkas laporan investigasi resmi `sentinel_incident_audit.csv`.

---

### 7. KESIMPULAN
**SentinelAD** bukan sekadar rancangan purwarupa, melainkan sistem pertahanan siber fungsional yang siap pakai. Dengan memadukan pemantauan telemetri real-time, kecerdasan buatan, dan respons insiden terotomatisasi, SentinelAD menjadi instrumen penangkalan andal bagi Pusat Siber TNI AD untuk mengawal kedaulatan ruang digital Negara Kesatuan Republik Indonesia.
