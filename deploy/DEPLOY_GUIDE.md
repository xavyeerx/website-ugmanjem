# Panduan Deployment — UGM Anjem Chatbot v2.0 (Ollama + Qwen3)

## Arsitektur

```
Internet (Jaringan Kampus UGM)
           │
     ┌─────▼──────┐
     │   Nginx     │  :80
     │  (reverse   │
     │   proxy)    │
     └──┬─────┬───┘
        │     │
  /api/*│     │ /*
        │     │
  ┌─────▼──┐ ┌▼──────────┐
  │FastAPI  │ │  Next.js   │
  │Backend  │ │  Frontend  │
  │ :8000   │ │  :3000     │
  └──┬──┬───┘ └────────────┘
     │  │
┌────▼──┘    ┌───────────┐
│ChromaDB│   │  Ollama    │
│VectorDB│   │ qwen3:8b   │
└────────┘   │ :11434     │
             └────────────┘

Monitoring:
  Prometheus :9090 ──→ Grafana :3001
  Node Exporter :9100
  Docker Exporter :9200
```

## Info VPS

- **IP**: 10.33.109.173
- **User**: ubuntu-anugrahdwiki
- **Password**: ubuntu123
- **OS**: Ubuntu

## Model AI (Self-Hosted)

| Komponen | Model | Ukuran | Fungsi |
|----------|-------|--------|--------|
| **LLM** | Qwen3 8B | ~5 GB | Generate jawaban chatbot |
| **Embedding** | nomic-embed-text | ~275 MB | Embedding query untuk retrieval |

> **Tidak memerlukan API key eksternal**. Semua inference berjalan di VPS.

## Prasyarat

- SSH access ke VPS (harus di jaringan kampus UGM)
- Git repository accessible dari VPS
- ~~Google Gemini API Key~~ (tidak diperlukan lagi)

---

## OPSI 1: Docker Compose (Recommended)

### Step 1 — Setup VPS (sekali saja)

```bash
ssh ubuntu-anugrahdwiki@10.33.109.173
# password: ubuntu123

# Upload dan jalankan setup script
sudo bash setup-vps.sh

# Logout lalu login lagi (agar docker group aktif)
exit
ssh ubuntu-anugrahdwiki@10.33.109.173
```

### Step 2 — Clone Repository

```bash
cd ~
git clone <REPO_URL> chatbot-anjemugm
cd chatbot-anjemugm
```

### Step 3 — Deploy (Otomatis)

```bash
cd deploy
chmod +x deploy.sh
./deploy.sh
```

Script ini akan otomatis:
1. Build semua Docker images
2. Start Ollama container
3. Download model Qwen3 8B (~5 GB) dan nomic-embed-text (~275 MB)
4. Start backend, frontend, nginx, dan monitoring

### Step 4 — Re-embed Knowledge Base

Karena embedding model berubah dari Gemini ke nomic-embed-text, knowledge base **harus di-embed ulang**:

```bash
# Masuk ke container backend atau jalankan langsung di VPS
pip3 install httpx chromadb

# Pastikan Ollama accessible
export OLLAMA_BASE_URL=http://localhost:11434

# Re-embed
cd ~/chatbot-anjemugm
python3 knowledge/scripts/embed_knowledge.py

# Restart backend untuk load vectorstore baru
cd deploy
./deploy.sh restart
```

Chatbot akan aktif di: **http://10.33.109.173**

### Management Commands

```bash
cd deploy
./deploy.sh stop      # Stop semua
./deploy.sh restart   # Restart tanpa rebuild
./deploy.sh logs      # Lihat logs real-time
./deploy.sh status    # Cek status services + Ollama models
./deploy.sh rebuild   # Full rebuild + restart
./deploy.sh pull      # Update/re-pull Ollama models
```

---

## OPSI 2: Tanpa Docker (Systemd Services)

Jika VPS tidak support Docker atau resource terbatas.

### Step 1 — Install Dependencies

```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx curl

# Install Node.js 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 2 — Pull Ollama Models

```bash
# Pull LLM model
ollama pull qwen3:8b

# Pull embedding model
ollama pull nomic-embed-text

# Verify
ollama list
```

### Step 3 — Setup Backend

```bash
cd ~/chatbot-anjemugm/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Buat .env (tidak perlu API key!)
cat > .env << 'EOF'
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
EOF
```

### Step 4 — Setup Frontend

```bash
cd ~/chatbot-anjemugm
npm ci
NEXT_PUBLIC_API_URL="" npm run build
```

### Step 5 — Buat Systemd Service (Ollama)

Ollama sudah otomatis berjalan sebagai systemd service setelah install. Verifikasi:

```bash
sudo systemctl enable ollama
sudo systemctl start ollama
sudo systemctl status ollama
```

### Step 6 — Buat Systemd Service (Backend)

```bash
sudo tee /etc/systemd/system/anjem-backend.service << 'EOF'
[Unit]
Description=UGM Anjem Chatbot Backend
After=network.target ollama.service
Requires=ollama.service

[Service]
Type=simple
User=ubuntu-anugrahdwiki
WorkingDirectory=/home/ubuntu-anugrahdwiki/chatbot-anjemugm/backend
Environment=PATH=/home/ubuntu-anugrahdwiki/chatbot-anjemugm/backend/.venv/bin:/usr/bin
ExecStart=/home/ubuntu-anugrahdwiki/chatbot-anjemugm/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable anjem-backend
sudo systemctl start anjem-backend
```

### Step 7 — Buat Systemd Service (Frontend)

```bash
sudo tee /etc/systemd/system/anjem-frontend.service << 'EOF'
[Unit]
Description=UGM Anjem Chatbot Frontend
After=network.target

[Service]
Type=simple
User=ubuntu-anugrahdwiki
WorkingDirectory=/home/ubuntu-anugrahdwiki/chatbot-anjemugm
ExecStart=/home/ubuntu-anugrahdwiki/.nvm/versions/node/v20/bin/node .next/standalone/server.js
Environment=PORT=3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable anjem-frontend
sudo systemctl start anjem-frontend
```

### Step 8 — Setup Nginx

```bash
sudo tee /etc/nginx/sites-available/anjem << 'EOF'
server {
    listen 80;
    server_name 10.33.109.173;

    client_max_body_size 10M;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/anjem /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## Troubleshooting

### Ollama tidak start / model lambat
```bash
# Cek Ollama status
sudo systemctl status ollama
ollama list

# Cek resource usage
htop
free -h

# Jika model belum ter-pull
ollama pull qwen3:8b
ollama pull nomic-embed-text

# Test model langsung
ollama run qwen3:8b "Hai, siapa kamu?"
```

### Backend tidak start
```bash
# Cek logs
sudo journalctl -u anjem-backend -f    # systemd
docker compose logs backend             # docker

# Penyebab umum:
# - Ollama belum running
# - Model belum di-pull
# - vectorstore/chroma_db belum ada (jalankan embed_knowledge.py)
```

### Chatbot tidak menjawab / timeout
```bash
# Test backend langsung
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Apa itu UGM Anjem?"}'

# Cek health endpoint
curl http://localhost:8000/health

# Cek Ollama response time
time ollama run qwen3:8b "Test response time" --verbose
```

### Response terlalu lambat
```bash
# CPU inference ~8-12 tokens/detik, response 5-15 detik normal
# Jika > 30 detik, cek:

# 1. Apakah model loaded in memory?
ollama ps

# 2. Apakah ada proses lain yang berat?
htop

# 3. Coba model lebih ringan jika perlu
ollama pull qwen2.5:7b
# Update OLLAMA_MODEL di backend/.env
```

---

## Update Knowledge Base

Jika ada perubahan data/FAQ:

```bash
# 1. Update source files (CSV, scripts, etc.)
# 2. Rebuild knowledge chunks
cd ~/chatbot-anjemugm
python3 knowledge/scripts/normalize_faq.py
python3 knowledge/scripts/build_master.py

# 3. Re-embed with Ollama
export OLLAMA_BASE_URL=http://localhost:11434
python3 knowledge/scripts/embed_knowledge.py

# 4. Restart backend
./deploy/deploy.sh restart    # docker
sudo systemctl restart anjem-backend  # systemd
```

---

## Dashboard Monitoring

| Service | URL | Login |
|---------|-----|-------|
| **Grafana** | http://10.33.109.173:3001 | admin / anjemugm123 |
| **Prometheus** | http://10.33.109.173:9090 | - |

Metrics yang dimonitor:
- LLM inference latency (chatbot_generation_duration_seconds)
- Embedding latency (chatbot_retrieval_duration_seconds)
- End-to-end chat latency (chatbot_chat_e2e_duration_seconds)
- Request count & error rates
- CPU, Memory, Network, Disk usage (via node-exporter)
- Docker container metrics (via docker-exporter)
