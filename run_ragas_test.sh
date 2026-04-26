#!/usr/bin/env bash
# Jalankan backend lokal + RAGAS accuracy test
# Dari root project: bash run_ragas_test.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== [1/3] Cek dependensi ==="
pip install -q ragas langchain-openai requests chromadb==1.3.0

echo ""
echo "=== [2/3] Jalankan backend lokal di port 8000 ==="
cd "$ROOT/backend"
VECTORSTORE_PATH="$ROOT/vectorstore/chroma_db" \
COLLECTION_NAME=ugm_anjem_knowledge \
uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Tunggu sampai backend siap
echo "  Menunggu backend siap..."
for i in $(seq 1 20); do
    STATUS=$(curl -s http://localhost:8000/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('rag_ready','false'))" 2>/dev/null)
    if [ "$STATUS" = "True" ]; then
        echo "  Backend siap (rag_ready=True)"
        break
    fi
    sleep 2
done

echo ""
echo "=== [3/3] Jalankan RAGAS test ==="
cd "$ROOT"
CHATBOT_URL=http://localhost:8000 python tests/accuracy_test.py

echo ""
echo "=== Selesai. Matikan backend lokal ==="
kill $BACKEND_PID 2>/dev/null
