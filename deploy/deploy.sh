#!/bin/bash
# ============================================================
# Deployment Script — UGM Anjem Chatbot
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
NC='\033[0m'

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; }

check_env() {
    if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
        err "backend/.env not found!"
        echo "Create it with: echo 'GOOGLE_API_KEY=your-key' > $PROJECT_ROOT/backend/.env"
        exit 1
    fi

    if [ ! -d "$PROJECT_ROOT/vectorstore/chroma_db" ]; then
        warn "vectorstore/chroma_db not found."
        warn "Run embed_knowledge.py first, or the chatbot won't have knowledge."
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

        log "Waiting for services to start..."
        sleep 5

        log "Checking health..."
        if curl -sf http://localhost/health > /dev/null 2>&1; then
            echo ""
            echo -e "${GREEN}============================================${NC}"
            echo -e "${GREEN} Deployment successful!${NC}"
            echo -e "${GREEN} Frontend:  http://10.33.109.173${NC}"
            echo -e "${GREEN} API:       http://10.33.109.173/api/chat${NC}"
            echo -e "${GREEN} Health:    http://10.33.109.173/health${NC}"
            echo -e "${GREEN}============================================${NC}"
        else
            warn "Health check failed. Checking logs..."
            docker compose logs --tail=20
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
        curl -sf http://localhost:8000/health 2>/dev/null || echo "Backend not responding"
        ;;

    rebuild)
        log "Rebuilding and restarting..."
        check_env
        docker compose down
        docker compose build --no-cache
        docker compose up -d
        log "Done."
        ;;

    *)
        echo "Usage: $0 {start|stop|restart|logs|status|rebuild}"
        exit 1
        ;;
esac
