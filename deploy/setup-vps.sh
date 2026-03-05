#!/bin/bash
# ============================================================
# VPS Initial Setup Script — UGM Anjem Chatbot
# Run this ONCE on the VPS to install Docker + Docker Compose
#
# Usage:
#   ssh ubuntu-anugrahdwiki@10.33.109.173
#   chmod +x setup-vps.sh && sudo ./setup-vps.sh
# ============================================================

set -e

echo "=== [1/5] Updating system packages ==="
apt-get update && apt-get upgrade -y

echo "=== [2/5] Installing prerequisites ==="
apt-get install -y \
    ca-certificates curl gnupg lsb-release \
    git unzip htop

echo "=== [3/5] Installing Docker ==="
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu-anugrahdwiki
    echo "Docker installed. User added to docker group."
else
    echo "Docker already installed."
fi

echo "=== [4/5] Installing Docker Compose plugin ==="
if ! docker compose version &> /dev/null; then
    apt-get install -y docker-compose-plugin
    echo "Docker Compose plugin installed."
else
    echo "Docker Compose already available."
fi

echo "=== [5/5] Creating project directory ==="
PROJECT_DIR="/home/ubuntu-anugrahdwiki/chatbot-anjemugm"
mkdir -p "$PROJECT_DIR"
chown ubuntu-anugrahdwiki:ubuntu-anugrahdwiki "$PROJECT_DIR"

echo ""
echo "============================================"
echo " VPS setup complete!"
echo " Next steps:"
echo "   1. Log out and log in again (for docker group)"
echo "   2. Clone repo:  cd $PROJECT_DIR && git clone <repo-url> ."
echo "   3. Deploy:      cd deploy && ./deploy.sh"
echo "============================================"
