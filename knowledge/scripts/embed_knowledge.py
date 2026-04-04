"""
Embed knowledge chunks using OpenAI embedding API and store in ChromaDB.

Model: text-embedding-3-small (dimension: 1536)
Biaya estimasi: $0.02 per 1 juta token (~gratis untuk knowledge base kecil)

Usage:
    export OPENAI_API_KEY='your-api-key'
    python embed_knowledge.py
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

OPENAI_EMBED_URL = "https://api.openai.com/v1/embeddings"
EMBEDDING_MODEL = os.environ.get("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
COLLECTION_NAME = "ugm_anjem_knowledge"
BATCH_SIZE = 100   # OpenAI mendukung batch besar (hemat biaya)


def load_chunks():
    filepath = PROCESSED_DIR / "knowledge_chunks.jsonl"
    chunks = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                chunks.append(json.loads(line))
    return chunks


def get_embeddings(texts: list[str], client: httpx.Client, api_key: str) -> list[list[float]]:
    """Get embeddings from OpenAI /v1/embeddings endpoint."""
    response = client.post(
        OPENAI_EMBED_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": EMBEDDING_MODEL,
            "input": texts,
        },
    )
    response.raise_for_status()
    data = response.json()

    # Sort by index to preserve order
    sorted_data = sorted(data["data"], key=lambda x: x["index"])
    return [item["embedding"] for item in sorted_data]


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
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: Set OPENAI_API_KEY environment variable first.")
        print("  Linux:   export OPENAI_API_KEY='sk-...'")
        print("  Windows: set OPENAI_API_KEY=sk-...")
        return

    print(f"Embedding model: {EMBEDDING_MODEL}")
    print("Estimasi biaya: SANGAT MURAH (~$0.001 untuk knowledge base kecil)")

    client = httpx.Client(timeout=httpx.Timeout(connect=10.0, read=60.0, write=10.0, pool=10.0))

    # Verify API key
    try:
        resp = client.get(
            "https://api.openai.com/v1/models",
            headers={"Authorization": f"Bearer {api_key}"},
        )
        resp.raise_for_status()
        print("OpenAI API key valid ✓")
    except Exception as e:
        print(f"ERROR: Cannot connect to OpenAI API: {e}")
        print("Pastikan OPENAI_API_KEY benar dan VPS bisa akses internet.")
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
        metadata={"description": "UGM Anjem RAG Knowledge Base (OpenAI embedded)"},
    )

    total_batches = (len(chunks) - 1) // BATCH_SIZE + 1
    print(f"\nEmbedding {len(chunks)} chunks dengan {EMBEDDING_MODEL} ({total_batches} batch)...")

    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        texts = [c["content"] for c in batch]
        ids = [c["chunk_id"] for c in batch]
        metadatas = [flatten_metadata(c) for c in batch]

        embeddings = get_embeddings(texts, client, api_key)

        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
        )

        batch_num = i // BATCH_SIZE + 1
        items_done = i + len(batch)
        print(f"  Batch {batch_num}/{total_batches} ({len(batch)} chunks, total {items_done}/{len(chunks)})")

        # Kecil saja, OpenAI tidak ada rate limit yang ketat untuk embedding
        if i + BATCH_SIZE < len(chunks):
            time.sleep(0.2)

    client.close()

    print(f"\n✅ Done! {collection.count()} chunks tersimpan di ChromaDB")
    print(f"   Vector store: {VECTORSTORE_DIR}")
    print(f"   Embedding model: {EMBEDDING_MODEL} (dimension: 1536)")


if __name__ == "__main__":
    main()
