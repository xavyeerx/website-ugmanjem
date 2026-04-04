#!/bin/bash
# ============================================================
# Deployment Script — UGM Anjem Chatbot (OpenAI API)
# Builds and starts all services on the VPS
#
# Usage (from project root):
#   cd deploy && ./deploy.sh
#
# Commands:
#   ./deploy.sh          → Full build + start
#   ./deploy.sh stop     → Stop all services
#   ./deploy.sh restart  → Restart without rebuild
#   ./deploy.sh logs     → View live logs
#   ./deploy.sh status   → Check service status
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "${CYAN}[INFO]${NC} $1"; }

check_env() {
    if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
        err "backend/.env not found!"
        echo "Buat file backend/.env dengan isi:"
        echo "  OPENAI_API_KEY=sk-proj-..."
        echo "  OPENAI_MODEL=gpt-5-mini"
        echo "  OPENAI_EMBEDDING_MODEL=text-embedding-3-small"
        exit 1
    fi

    # Cek API key tidak kosong
    if grep -q "OPENAI_API_KEY=GANTI" "$PROJECT_ROOT/backend/.env" || \
       grep -q "OPENAI_API_KEY=your-" "$PROJECT_ROOT/backend/.env" || \
       ! grep -q "OPENAI_API_KEY=sk-" "$PROJECT_ROOT/backend/.env"; then
        warn "OPENAI_API_KEY sepertinya belum diisi di backend/.env!"
        warn "Edit file tersebut dan isi dengan API key OpenAI kamu."
    fi

    if [ ! -d "$PROJECT_ROOT/vectorstore/chroma_db" ]; then
        warn "vectorstore/chroma_db tidak ditemukan."
        warn "Jalankan: python3 knowledge/scripts/embed_knowledge.py"
        warn "Chatbot tidak akan bisa menjawab tanpa knowledge base!"
    fi
}

case "${1:-start}" in
    start)
        log "Checking environment..."
        check_env

        log "Building Docker images..."
        docker compose build --no-cache

        log "Starting services..."
        docker compose up -d

        log "Waiting for backend to be healthy..."
        sleep 15

        log "Checking health..."
        if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
            HEALTH=$(curl -s http://localhost:8000/health)
            echo ""
            echo -e "${GREEN}============================================${NC}"
            echo -e "${GREEN} ✅ Deployment successful!${NC}"
            echo -e "${GREEN}============================================${NC}"
            echo -e "${GREEN} Frontend:   http://10.33.109.173${NC}"
            echo -e "${GREEN} API:        http://10.33.109.173/api/chat${NC}"
            echo -e "${GREEN} Health:     http://10.33.109.173/health${NC}"
            echo -e "${GREEN} Prometheus: http://10.33.109.173:9090${NC}"
            echo -e "${GREEN} Grafana:    http://10.33.109.173:3001${NC}"
            echo -e "${GREEN}   (admin / anjemugm123)${NC}"
            echo -e "${GREEN}============================================${NC}"
            echo -e "${CYAN} Provider: OpenAI API${NC}"
            echo -e "${CYAN} $HEALTH${NC}"
            echo -e "${GREEN}============================================${NC}"
        else
            warn "Health check failed. Checking logs..."
            docker compose logs backend --tail=30
        fi
        ;;

    stop)
        log "Stopping all services..."
        docker compose down
        log "Stopped."
        ;;

    restart)
        log "Restarting services..."
        docker compose restart
        log "Restarted."
        ;;

    logs)
        docker compose logs -f --tail=50
        ;;

    status)
        docker compose ps
        echo ""
        log "Backend health:"
        curl -sf http://localhost:8000/health 2>/dev/null | python3 -m json.tool || echo "Backend not responding"
        ;;

    rebuild)
        log "Rebuilding and restarting..."
        check_env
        docker compose down
        docker compose build --no-cache
        docker compose up -d
        sleep 15
        log "Checking health..."
        curl -sf http://localhost:8000/health 2>/dev/null | python3 -m json.tool || \
            (warn "Backend belum ready, cek logs:" && docker compose logs backend --tail=20)
        log "Done. Jalankan './deploy.sh status' untuk cek status."
        ;;

    *)
        echo "Usage: $0 {start|stop|restart|logs|status|rebuild}"
        exit 1
        ;;
esac
