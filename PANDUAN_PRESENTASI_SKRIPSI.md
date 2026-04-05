# Panduan Lengkap Presentasi Tugas Akhir
**Sistem Chatbot RAG UGM Anjem & Pemantauan QoS (Quality of Service)**

Dokumen ini dirancang sebagai *pegangan wajib* (cheat sheet) untuk memahami, menjelaskan, dan mempertahankan sistem kamu di depan dosen penguji. Penjelasan dibuat terstruktur dari konsep dasar hingga teknis yang mendalam.

---

## 1. Memahami "Ruh" Judul Skripsi Kamu

Dosen mungkin bertanya: *"Skripsi kamu ini sebenarnya bikin Chatbot (porsi AI/Software) atau porsi Jaringan?"*

**Cara Menjawab yang Tepat:**
> "Fokus utama penelitian saya ada pada **Arsitektur Jaringan Terdistribusi (Microservices)** dan **Pemantauan Kualitas Layanan (*Quality of Service* / QoS)**. Chatbot (AI) di sini berfungsi sebagai **beban kerja (*workload*) utama** yang diuji. Saya ingin membuktikan bagaimana sebuah infrastruktur VPS berbasis kontainer (Docker) mampu menangani trafik AI secara *real-time*, mendeteksi hambatan jaringan (*bottleneck*), dan memastikan respons cepat di bawah standar latensi menggunakan metrik Prometheus dan Grafana."

---

## 2. Bagaimana Sistem Bekerja? (Jelaskan Layaknya Kurir)

Jika dosen meminta kamu menjelaskan alur sistem dari awal user mengetik pesan sampai pesan dibalas, gunakan alur **7 Langkah** ini:

1. **Titik Masuk (Entry Point):** Pengguna mengirim pesan "Berapa tarif ke UGM?" lewat browser/HP. Pesan ini masuk ke **Nginx** (Reverse Proxy). Nginx bertugas sebagai satpam yang mengarahkan pesan ini ke pintu **Backend (FastAPI)**.
2. **Penerjemahan (Embedding):** Backend mengirim teks tersebut ke API OpenAI untuk diubah menjadi *vektor* (deretan angka 1536 dimensi). Mengapa? Karena mesin tidak mengerti huruf, mesin mengerti angka spasial.
3. **Pencarian Dokumen Statis (Retrieval - ChromaDB):** Backend menggunakan vektor tadi untuk mencari dokumen FAQ/Panduan (yang sebelumnya sudah disimpan di VPS dalam **ChromaDB**). ChromaDB akan membalas dengan dokumen yang paling mirip (misal: "Dokumen SOP Layanan Anjem").
4. **Pencarian Data Dinamis (Live Context - Supabase):** Backend juga secara asinkron mengambil data tarif *real-time* langsung dari database PostgreSQL Supabase untuk memastikan tarif yang diberikan bukan tarif usang/lama.
5. **Perakitan Prompt (Prompt Engineering):** Backend merakit pesan User, Dokumen FAQ (ChromaDB), dan Tarif Asli (Supabase) menjadi satu paket pesan besar.
6. **Eksekusi AI (Generation - API OpenAI):** Paket tersebut dikirim ke "otak" pintar yaitu **gpt-4o-mini** via API internet. AI ini akan membaca dokumen tersebut dan merangkai kalimat jawaban luwes berbahasa Indonesia.
7. **Pengembalian (Response):** Jawaban dikirim balik ke Backend $\rightarrow$ Nginx $\rightarrow$ Komputer User.

**Analogi RAG untuk Dosen Awam:**
> "Arsitektur RAG (Retrieval-Augmented Generation) itu seperti ujian *Open Book*. Model AI (gpt-4o-mini) adalah **siswa ujian yang sangat pintar**. Tapi dia tidak hafal detail tarif UGM Anjem. Jadi, ChromaDB dan Supabase berfungsi sebagai **buku catatan** yang diberikan kepada siswa tersebut sesaat sebelum dia menjawab."

---

## 3. Komponen Jaringan & Monitoring (Inti Skripsi Anda)

Ini adalah bagian terpenting untuk anak Jaringan/TRI. Jelaskan peran *Observability Engine* kamu:

### A. Mengapa pakai Docker? (Containerization)
*   "Saya menggunakan Docker untuk mengisolasi setiap komponen (Frontend, Backend, Database) ke dalam wadah (kontainer) sendiri. Ini membuat manajemen sumber daya jaringan lebih aman, dan jika satu komponen mati, sistem lain tidak ikut hancur."

### B. Peran Prometheus & Grafana
*   **Prometheus:** Bertindak sebagai agen *scraper* (penyedot data). Setiap 15 detik, Prometheus mengetuk pintu Backend, Docker, dan Host Server untuk menanyakan: *"Berapa memori yang kamu pakai?", "Berapa detik waktu yang kamu butuhkan untuk jawab user terakhir?"*.
*   **Grafana:** Bertindak sebagai *Dashboard Visual*. Ia membaca data dari Prometheus dan mengubahnya menjadi grafik yang mudah dibaca oleh admin jaringan.

### C. Arti Metrik QoS yang Dipantau di Grafana (Wajib Paham!)
Saat presentasi unjuk dashboard Grafana, jelaskan isi panel-panel tersebut:
1.  **End-to-End Latency (p50 / p95 / p99):**
    *   Ini adalah waktu total pengguna menunggu.
    *   *P95 latency = 2 detik* artinya: 95% dari seluruh interaksi pengguna dijawab dalam waktu maksimal 2 detik. Ini membuktikan jaringan kita stabil.
2.  **Pipeline Breakdown:** Membedah dari 2 detik waktu tunggu, di mana letak paling lamanya? Apakah lama saat mencari dokumen (ChromaDB), lama di jaringan internet menuju OpenAI, atau lama di jaringan Supabase? Ini namanya proses lokalisasi masalah jaringan.
3.  **Error Rate & Availability:** Menunjukkan berapa persentase request yang gagal (HTTP 500, 502, 504) karena *timeout* jaringan atau antrean membludak.

---

## 4. Pelaksanaan Uji Beban (Load Testing)

Untuk bab Hasil & Pembahasan di skripsi, kamu **wajib** melakukan eksperimen pemberian beban. 

### Alat yang akan digunakan:
**k6** (dari Grafana Labs) — ini alat penguji beban (*stress test*) yang sangat modern.

### Cara Melakukan Pengujian:
Kamu akan menembakkan trafik (*Dummy Request*) ke URL Chatbot kamu (`http://10.33.109.173/api/chat`). Terdapat 3 skenario yang harus kamu jalankan di Bab IV:

1.  **Baseline Test (Uji Beban Ringan):**
    *   **Apa yang diuji:** 5 user bersamaan (*concurrent users*) selama 1 menit.
    *   **Tujuan:** Mendapatkan standar latensi normal saat server santai. (Misal: 1.5 detik per pesan).
2.  **Stress Test (Uji Beban Berat):**
    *   **Apa yang diuji:** 50 - 100 user membanjiri chat secara bersamaan selama 3 menit nonstop.
    *   **Tujuan:** Melihat di titik mana VPS mulai kewalahan. Apakah CPU menyentuh 100%? Apakah memori Grafana habis terjual? Apakah P95 latency melar dari 1.5 detik menjadi 5 detik?
3.  **Spike Test (Uji Kejut Besar):**
    *   **Apa yang diuji:** 0 user tiba-tiba meloncat jadi 200 user dalam hitungan 1 detik.
    *   **Tujuan:** Cek apakah Nginx (*Reverse Proxy*) sanggup menangani ledakan koneksi (*TCP Connection Burst*), atau akankah terjadi *Error 502 Bad Gateway/Connection Refused*.

**Indikator Keberhasilan (Sistem kamu dianggap Lulus / Berhasil jika):**
*   Saat dihajar beban, Error Rate di Grafana tidak melebihi **5%**.
*   Latensi p95 tetap bertahan **di bawah batas ambang 10 detik**.
*   Docker container tidak jebol/mati (*Crash/Restart*) akibat OOM (Out Of Memory).

---

## 5. Simulasi Tanya Jawab (QnA Defensif)

Pertanyaan jebakan yang sering diajukan dosen dan cara membela diri (*defense*):

### Q1: "Kenapa kamu menggunakan API OpenAI (gpt-4o-mini)? Katanya skripsi implementasi di VPS lokal, kenapa otaknya malah nyewa cloud luar?"
**Jawaban Defensif:**
> "Sebelumnya, saya telah mengimplementasikan *Large Language Model (LLM) Qwen3 8B* murni secara lokal di dalam VPS (melalui Ollama). Namun secara arsitektur, VPS tanpa GPU tidak mampu menangani inferensi komputasi AI dengan efisien. Berdasarkan hasil pengujian sistem *monitoring* Grafana saya, waktu tunggu (*End-to-End Latency*) dengan model lokal mencapai **50 detik** per pesan untuk satu orang, sehingga ketika di-*load test*, langsung terjadi *bottleneck*. Sebagai insinyur jaringan, membuat keputusan *Trade-Off* (menggeser komputasi berat ke *API Endpoint / Microservice Eksternal*) adalah keputusan valid untuk menyelamatkan kualitas layanan (*QoS*) dan pengalaman pengguna. Sekarang latensinya turun drastis menjadi **1-3 detik** saja."

### Q2: "Apa bedanya pakai sistem ini dibandingkan kita pakai ChatGPT biasa di platform OpenAI?"
**Jawaban Defensif:**
> "Sangat berbeda, Pak/Bu. ChatGPT biasa tidak tahu tarif spesifik antar jemput UGM, karena tarif Anjem UGM adalah informasi privat dan terus berubah secara *live*. Sistem kami mengintegrasikan teknologi RAG (Retrieval-Augmented Generation) di server kita sendiri, di mana kita secara dinamis menyuntikkan data operasional (ChromaDB) dan tarif *live* (Supabase). Ini membuat chatbot menghasilkan jawaban berbasis *knowledge base UGM Anjem*, bukan pengetahuan umum internet yang berhalusinasi."

### Q3: "Bagaimana cara membaca grafik 'Container CPU Usage (%)' di dashboard-mu?"
**Jawaban Defensif:**
> "Grafik tersebut mengukur konsumsi siklus prosesor oleh setiap *docker container* secara independen, difasilitasi oleh `docker-exporter`. Jika garis backend (misalnya berwarna biru) tiba-tiba naik menyentuh 100%, itu artinya program FastAPI sedang bekerja sangat keras merakit pesan / mengambil database ChromaDB. Jika CPU mentok terlalu lama, ini akan berdampak lurus pada grafik 'End-to-End Latency' yang berada di sebelahnya."

---

### Tips Terakhir Untuk Presentasi Besok:
1.  **Bawa Demo:** Langsung demokan tanya jawab cepat di web, lalu pindah layar (*switch*) buka Grafana. Tunjukkan kepada dosen bagaimana titik grafik latensi langsung "Nongol" sesaat setelah chatbot menjawab. Ini akan memberikan wow-factor!
2.  **Kuasai Istilah:** Jika ditanya, pahami bahwa **ChromaDB** itu *Vector Database*, **Supabase** itu *Relational Database*, dan **Prometheus** itu *Time-Series Database (TSDB)*. Sistem kamu menggunakan 3 jenis database sekaligus untuk keperluan yang berbeda.
