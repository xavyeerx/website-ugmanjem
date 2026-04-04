"""
Embed knowledge chunks using Ollama embedding model and store in ChromaDB.

This script replaces the previous Gemini-based embedding with Ollama's
nomic-embed-text model for fully self-hosted operation.

Usage:
    # Make sure Ollama is running with the embedding model pulled:
    #   ollama pull nomic-embed-text
    #
    # Then run:
    python embed_knowledge.py

    # Or specify a custom Ollama URL:
    OLLAMA_BASE_URL=http://10.33.109.173:11434 python embed_knowledge.py
"""

import json
import os
import time
from pathlib import Path

try:
    import httpx
    import chromadb
except ImportError:
    print("Required packages not installed. Run:")
    print("  pip install httpx chromadb")
    raise SystemExit(1)

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "processed"
VECTORSTORE_DIR = Path(__file__).resolve().parent.parent.parent / "vectorstore" / "chroma_db"

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
EMBEDDING_MODEL = os.environ.get("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
COLLECTION_NAME = "ugm_anjem_knowledge"
BATCH_SIZE = 20


def load_chunks():
    filepath = PROCESSED_DIR / "knowledge_chunks.jsonl"
    chunks = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                chunks.append(json.loads(line))
    return chunks


def get_embeddings(texts: list[str], client: httpx.Client) -> list[list[float]]:
    """Get embeddings from Ollama /api/embed endpoint."""
    response = client.post(
        f"{OLLAMA_BASE_URL}/api/embed",
        json={
            "model": EMBEDDING_MODEL,
            "input": texts,
        },
    )
    response.raise_for_status()
    data = response.json()
    return data.get("embeddings", [])


def flatten_metadata(chunk):
    """ChromaDB only accepts str/int/float/bool metadata values."""
    meta = {}
    for k, v in chunk.items():
        if k == "content":
            continue
        if isinstance(v, (str, int, float, bool)):
            meta[k] = v
        elif isinstance(v, list):
            meta[k] = ",".join(str(x) for x in v)
    return meta


def main():
    print(f"Ollama URL: {OLLAMA_BASE_URL}")
    print(f"Embedding model: {EMBEDDING_MODEL}")

    # Verify Ollama is reachable
    client = httpx.Client(timeout=httpx.Timeout(connect=10.0, read=120.0, write=10.0, pool=10.0))

    try:
        resp = client.get(f"{OLLAMA_BASE_URL}/api/tags")
        resp.raise_for_status()
        models = [m["name"] for m in resp.json().get("models", [])]
        print(f"Available models: {models}")
        if not any(EMBEDDING_MODEL in m for m in models):
            print(f"\nERROR: Model '{EMBEDDING_MODEL}' not found in Ollama.")
            print(f"  Run: ollama pull {EMBEDDING_MODEL}")
            return
    except Exception as e:
        print(f"\nERROR: Cannot connect to Ollama at {OLLAMA_BASE_URL}")
        print(f"  Make sure Ollama is running: ollama serve")
        print(f"  Error: {e}")
        return

    print("\nLoading knowledge chunks...")
    chunks = load_chunks()
    print(f"Loaded {len(chunks)} chunks")

    VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)
    db_client = chromadb.PersistentClient(path=str(VECTORSTORE_DIR))

    existing_names = [c.name for c in db_client.list_collections()]
    if COLLECTION_NAME in existing_names:
        db_client.delete_collection(COLLECTION_NAME)
        print(f"Deleted existing collection '{COLLECTION_NAME}'")

    collection = db_client.create_collection(
        name=COLLECTION_NAME,
        metadata={"description": "UGM Anjem RAG Knowledge Base (Ollama embedded)"},
    )

    total_batches = (len(chunks) - 1) // BATCH_SIZE + 1
    print(f"\nEmbedding {len(chunks)} chunks with {EMBEDDING_MODEL} ({total_batches} batches)...")

    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        texts = [c["content"] for c in batch]
        ids = [c["chunk_id"] for c in batch]
        metadatas = [flatten_metadata(c) for c in batch]

        embeddings = get_embeddings(texts, client)

        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
        )

        batch_num = i // BATCH_SIZE + 1
        items_done = i + len(batch)
        print(f"  Batch {batch_num}/{total_batches} ({len(batch)} chunks, total {items_done}/{len(chunks)})")

        # Small delay between batches to avoid overwhelming Ollama
        if i + BATCH_SIZE < len(chunks):
            time.sleep(0.5)

    client.close()

    print(f"\n✅ Done! {collection.count()} chunks stored in ChromaDB")
    print(f"   Vector store: {VECTORSTORE_DIR}")
    print(f"   Embedding model: {EMBEDDING_MODEL}")


if __name__ == "__main__":
    main()
