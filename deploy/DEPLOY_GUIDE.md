# Panduan Deployment — UGM Anjem Chatbot

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
  └────┬────┘ └────────────┘
       │
  ┌────▼─────┐
  │ChromaDB  │
  │VectorDB  │
  └──────────┘
```

## Info VPS

- **IP**: 10.33.109.173
- **User**: ubuntu-anugrahdwiki
- **OS**: Ubuntu

## Prasyarat

- SSH access ke VPS (harus di jaringan kampus UGM)
- Git repository accessible dari VPS
- Google Gemini API Key

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

### Step 3 — Setup Environment

```bash
# Buat .env untuk backend
echo "GOOGLE_API_KEY=your-actual-api-key" > backend/.env
```

### Step 4 — Embed Knowledge (jika vectorstore belum ada)

```bash
pip3 install google-generativeai chromadb
export GOOGLE_API_KEY=your-actual-api-key
python3 knowledge/scripts/embed_knowledge.py
```

### Step 5 — Deploy

```bash
cd deploy
chmod +x deploy.sh
./deploy.sh
```

Chatbot akan aktif di: **http://10.33.109.173**

### Management Commands

```bash
cd deploy
./deploy.sh stop      # Stop semua
./deploy.sh restart   # Restart tanpa rebuild
./deploy.sh logs      # Lihat logs real-time
./deploy.sh status    # Cek status services
./deploy.sh rebuild   # Full rebuild + restart
```

---

## OPSI 2: Tanpa Docker (Systemd Services)

Jika VPS tidak support Docker atau resource terbatas.

### Step 1 — Install Dependencies

```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx

# Install Node.js 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
```

### Step 2 — Setup Backend

```bash
cd ~/chatbot-anjemugm/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Buat .env
echo "GOOGLE_API_KEY=your-key" > .env
```

### Step 3 — Setup Frontend

```bash
cd ~/chatbot-anjemugm
npm ci
NEXT_PUBLIC_API_URL="" npm run build
```

### Step 4 — Buat Systemd Service (Backend)

```bash
sudo tee /etc/systemd/system/anjem-backend.service << 'EOF'
[Unit]
Description=UGM Anjem Chatbot Backend
After=network.target

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

### Step 5 — Buat Systemd Service (Frontend)

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

### Step 6 — Setup Nginx

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

### Backend tidak start
```bash
# Cek logs
sudo journalctl -u anjem-backend -f    # systemd
docker compose logs backend             # docker

# Penyebab umum:
# - GOOGLE_API_KEY kosong/salah di .env
# - vectorstore/chroma_db belum ada (jalankan embed_knowledge.py)
```

### Frontend error
```bash
# Pastikan build berhasil
npm run build

# Cek apakah .next/standalone/server.js ada
ls .next/standalone/server.js
```

### Chatbot tidak menjawab
```bash
# Test backend langsung
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Apa itu UGM Anjem?"}'

# Cek health endpoint
curl http://localhost:8000/health
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
python3 knowledge/scripts/embed_knowledge.py

# 3. Restart backend
./deploy/deploy.sh restart    # docker
sudo systemctl restart anjem-backend  # systemd
```
