FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/app/ app/

# Copy vectorstore (ChromaDB knowledge base)
COPY vectorstore/ /data/vectorstore/

ENV VECTORSTORE_PATH=/data/vectorstore/chroma_db
ENV COLLECTION_NAME=ugm_anjem_knowledge

EXPOSE 8000

# Railway provides PORT env var automatically; fallback to 8000 for local
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
