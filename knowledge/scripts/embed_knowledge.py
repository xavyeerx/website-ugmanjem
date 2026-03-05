"""
Embed knowledge chunks using Google Gemini API and store in ChromaDB.

Usage:
    export GOOGLE_API_KEY='your-api-key'
    python embed_knowledge.py
"""

import json
import os
import time
from pathlib import Path

try:
    import google.generativeai as genai
    import chromadb
except ImportError:
    print("Required packages not installed. Run:")
    print("  pip install google-generativeai chromadb")
    raise SystemExit(1)

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "processed"
VECTORSTORE_DIR = Path(__file__).resolve().parent.parent.parent / "vectorstore" / "chroma_db"

EMBEDDING_MODEL = "models/gemini-embedding-001"
COLLECTION_NAME = "ugm_anjem_knowledge"
BATCH_SIZE = 20
RATE_LIMIT_PER_MIN = 90
RATE_LIMIT_WINDOW = 65


def load_chunks():
    filepath = PROCESSED_DIR / "knowledge_chunks.jsonl"
    chunks = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                chunks.append(json.loads(line))
    return chunks


def get_embeddings(texts, max_retries=3):
    for attempt in range(max_retries):
        try:
            result = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=texts,
                task_type="retrieval_document",
            )
            return result["embedding"]
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                wait = RATE_LIMIT_WINDOW * (attempt + 1)
                print(f"    Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                raise
    raise RuntimeError("Max retries exceeded")


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
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("ERROR: Set GOOGLE_API_KEY environment variable first.")
        print("  Windows:  set GOOGLE_API_KEY=your-key")
        print("  Linux:    export GOOGLE_API_KEY='your-key'")
        return

    genai.configure(api_key=api_key)

    print("Loading knowledge chunks...")
    chunks = load_chunks()
    print(f"Loaded {len(chunks)} chunks")

    VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(VECTORSTORE_DIR))

    existing_names = [c.name for c in client.list_collections()]
    if COLLECTION_NAME in existing_names:
        client.delete_collection(COLLECTION_NAME)
        print(f"Deleted existing collection '{COLLECTION_NAME}'")

    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"description": "UGM Anjem RAG Knowledge Base"},
    )

    total_batches = (len(chunks) - 1) // BATCH_SIZE + 1
    print(f"\nEmbedding {len(chunks)} chunks with {EMBEDDING_MODEL} ({total_batches} batches)...")

    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        texts = [c["content"] for c in batch]
        ids = [c["chunk_id"] for c in batch]
        metadatas = [flatten_metadata(c) for c in batch]

        embeddings = get_embeddings(texts)

        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
        )

        batch_num = i // BATCH_SIZE + 1
        items_done = i + len(batch)
        print(f"  Batch {batch_num}/{total_batches} ({len(batch)} chunks, total {items_done}/{len(chunks)})")

        if i + BATCH_SIZE < len(chunks):
            if items_done % RATE_LIMIT_PER_MIN < BATCH_SIZE:
                print(f"    Approaching rate limit, cooling down {RATE_LIMIT_WINDOW}s...")
                time.sleep(RATE_LIMIT_WINDOW)
            else:
                time.sleep(1)

    print(f"\nDone! {collection.count()} chunks stored in ChromaDB")
    print(f"Vector store: {VECTORSTORE_DIR}")


if __name__ == "__main__":
    main()
