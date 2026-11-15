# 🎖️ PANDUAN KELENGKAPAN SUBMISSION
## KARTIKA CYBER HACKATHON 2026
**Tim:** AyySec | **Karya:** SentinelAD | **Kategori:** Defensive Shield (Penangkalan)

Dokumen ini memuat panduan lengkap pemenuhan 5 syarat submission resmi sesuai rulebook Kartika Cyber Hackathon 2026.

---

### 1. LINK KARYA / PROJECT (Wajib)

Dewan Juri mewajibkan link publik yang memungkinkan mereka mencoba dan mengevaluasi karya secara langsung. Anda dapat mencantumkan format berikut:

*   **Link Live Web App (Demo Langsung):**  
    *(Pilih salah satu dari 2 opsi di bawah)*
    *   **Opsi A (Rekomendasi 24/7 Online via Render - Gratis):**  
        Deploy repositori ke [Render.com](https://render.com) (berkas `render.yaml` sudah kami siapkan di root folder). URL hasil deploy akan berbentuk:  
        `https://sentinel-ad.onrender.com`
    *   **Opsi B (Instan 1-Klik dari Laptop via Tunnel):**  
        Cukup klik 2x file `start_public_link.bat`. Jendela akan otomatis memunculkan link publik HTTPS (misal: `https://xxxx.a.pinggy.link`) yang langsung aktif dan bisa dibuka siapa saja.
*   **Link Repositori Publik (GitHub):**  
    `https://github.com/[username-anda]/sentinel-ad`  
    *(Lengkap dengan README profesional, arsitektur, docker-compose, dan panduan instalasi)*
*   **Link Cadangan (Google Drive / GitHub Release ZIP):**  
    Cantumkan link Google Drive berisi arsip ZIP proyek untuk opsi unduh mandiri oleh panitia.

---

### 2. THUMBNAIL KARYA (Ukuran 1200×630 px, Maks 500KB)

*   **Spesifikasi:** Resolusi **1200 x 630 px**, format **PNG / JPG**, rasio 1.91:1 (standar OpenGraph / Banner pameran).
*   **Komposisi Visual yang Disarankan:**
    *   **Latar Belakang:** Screenshot Dasbor Taktis SentinelAD dengan grafik aktif (hijau/merah glowing).
    *   **Logo & Teks:**
        *   Logo Kartika Cyber Hackathon 2026 / Pussiberad TNI AD (Kiri Atas).
        *   Teks Utama: **SENTINEL-AD** (Font tebal, aksen Emerald Green).
        *   Subteks: *Real-Time Network Anomaly Early Warning & Automated Incident Response System*.
        *   Badge Tim: **Team AyySec | Kategori: Defensive Shield**.
    *   *Tips: Anda dapat mendesainnya dengan mudah di Canva menggunakan template ukuran "Facebook Post / Open Graph Image" (1200x630).*

---

### 3. SCREENSHOT KARYA (Maksimal 5 Gambar Terbaik)

Gunakan 5 tangkapan layar resolusi tinggi berikut untuk menggambarkan alur sistem secara utuh:

1.  **Screenshot 1: Overview Dasbor Operasi Normal**  
    *Fokus:* Seluruh dasbor dalam status `DEFCON 4 (NORMAL)`, grafik telemetri hijau berjalan stabil, metrik throughput, dan 4 node aset pertahanan berstatus `Aman`.
2.  **Screenshot 2: Deteksi Anomali AI Real-Time & Warning Alarm**  
    *Fokus:* Saat simulasi serangan `Port Scanning (Nmap)` atau `SYN Flood` dipicu. Grafik melonjak merah, pop-up alarm merah menyala dengan skor deviasi AI 88-94%, dan sirene peringatan aktif.
3.  **Screenshot 3: Radar Geolokasi & Sektor Intelijen Siber**  
    *Fokus:* Panel radar dengan sapuan sweep dan blip merah `HOSTILE BLIP`, menampilkan identitas IP penyerang dan zona pertahanan yang ditargetkan.
4.  **Screenshot 4: Otomatisasi Respons Insiden & Isolasi IP Firewall**  
    *Fokus:* Tabel *Incident Log & Audit Forensik* yang memperlihatkan tombol `[Isolasi IP]` berubah menjadi lencana merah `[Terisolasi Otomatis]` via mitigasi firewall IPTables.
5.  **Screenshot 5: Status Aset & Infrastruktur Pertahanan (Core Infra)**  
    *Fokus:* Panel status aset kritis yang menunjukkan node Gateway Perimeter dan Server Web berstatus `Diserang / Waspada` saat serangan berlangsung.

---

### 4. VIDEO KARYA (Maksimal 10 Menit, Unggah ke YouTube)

*   **Judul Video YouTube yang Disarankan:**  
    `SentinelAD - Early Warning System & Automated Incident Response | Kartika Cyber Hackathon 2026 - Tim AyySec`
*   **Visibilitas:** Pilih **Public** atau **Unlisted** (jangan Private agar juri bisa memutar).
*   **Naskah Suara AI & Panduan Rekaman Layar:**  
    Gunakan naskah mengalir yang telah kita susun di panduan sebelumnya (cukup copy-paste ke generator suara AI seperti ElevenLabs/CapCut).

---

### 5. SLIDE PENJELASAN (Format Presentasi PDF/PPT)

*   Gunakan berkas proposal dan materi slide yang sudah dibuat di:  
    `D:\securityAD\PROPOSAL_KARTIKA_HACKATHON_2026.md`
*   Cakup 5 topik utama:
    1. Latar Belakang & Problem Statement (Keterbatasan sistem konvensional).
    2. Solusi SentinelAD & Arsitektur Teknologi (FastAPI, Scapy, Isolation Forest, WebSockets).
    3. Fitur Utama & Matriks Kesesuaian Kategori *Defensive Shield*.
    4. Alur Kerja Deteksi & Otomatisasi Mitigasi Isolasi IP.
    5. Nilai Strategis untuk Kedaulatan Ruang Siber Pussiberad TNI AD.
