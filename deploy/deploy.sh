#!/bin/bash
# ============================================================
# Deployment Script — UGM Anjem Chatbot (Ollama + Qwen3)
# Builds and starts all services on the VPS
#
# Usage (from project root):
#   cd deploy && ./deploy.sh
#
# Commands:
#   ./deploy.sh          → Full build + start + pull models
#   ./deploy.sh stop     → Stop all services
#   ./deploy.sh restart  → Restart without rebuild
#   ./deploy.sh logs     → View live logs
#   ./deploy.sh status   → Check service status
#   ./deploy.sh pull     → Pull/update Ollama models only
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
        warn "backend/.env not found, creating default..."
        cat > "$PROJECT_ROOT/backend/.env" << 'EOF'
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen3:8b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
EOF
        log "Created backend/.env with Ollama defaults"
    fi

    if [ ! -d "$PROJECT_ROOT/vectorstore/chroma_db" ]; then
        warn "vectorstore/chroma_db not found."
        warn "Run embed_knowledge.py after deployment to populate the knowledge base."
    fi
}

pull_models() {
    log "Pulling Ollama models (this may take a while on first run)..."

    info "Pulling qwen3:8b (~5 GB)..."
    docker exec anjem-ollama ollama pull qwen3:8b

    info "Pulling nomic-embed-text (~275 MB)..."
    docker exec anjem-ollama ollama pull nomic-embed-text

    log "All models pulled successfully!"
    docker exec anjem-ollama ollama list
}

case "${1:-start}" in
    start)
        log "Checking environment..."
        check_env

        log "Building Docker images..."
        docker compose build --no-cache

        log "Starting services..."
        docker compose up -d

        log "Waiting for Ollama to start..."
        sleep 10

        # Pull models into Ollama
        pull_models

        log "Waiting for backend to initialize with models..."
        sleep 5

        # Restart backend so it connects to now-ready Ollama
        docker compose restart backend
        sleep 10

        log "Checking health..."
        if curl -sf http://localhost/health > /dev/null 2>&1; then
            echo ""
            echo -e "${GREEN}============================================${NC}"
            echo -e "${GREEN} ✅ Deployment successful!${NC}"
            echo -e "${GREEN}============================================${NC}"
            echo -e "${GREEN} Frontend:   http://10.33.109.173${NC}"
            echo -e "${GREEN} API:        http://10.33.109.173/api/chat${NC}"
            echo -e "${GREEN} Health:     http://10.33.109.173/health${NC}"
            echo -e "${GREEN} Ollama:     http://10.33.109.173:11434${NC}"
            echo -e "${GREEN} Prometheus: http://10.33.109.173:9090${NC}"
            echo -e "${GREEN} Grafana:    http://10.33.109.173:3001${NC}"
            echo -e "${GREEN}   (admin / anjemugm123)${NC}"
            echo -e "${GREEN}============================================${NC}"
            echo -e "${CYAN} LLM Model:      qwen3:8b (self-hosted)${NC}"
            echo -e "${CYAN} Embedding:      nomic-embed-text${NC}"
            echo -e "${CYAN} No external API keys required!${NC}"
            echo -e "${GREEN}============================================${NC}"
        else
            warn "Health check failed. Checking logs..."
            docker compose logs --tail=30
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
        echo ""
        log "Ollama models:"
        docker exec anjem-ollama ollama list 2>/dev/null || echo "Ollama not responding"
        ;;

    rebuild)
        log "Rebuilding and restarting..."
        check_env
        docker compose down
        docker compose build --no-cache
        docker compose up -d
        sleep 10
        pull_models
        docker compose restart backend
        log "Done."
        ;;

    pull)
        log "Pulling/updating Ollama models..."
        pull_models
        log "Restarting backend to use updated models..."
        docker compose restart backend
        log "Done."
        ;;

    *)
        echo "Usage: $0 {start|stop|restart|logs|status|rebuild|pull}"
        exit 1
        ;;
esac
