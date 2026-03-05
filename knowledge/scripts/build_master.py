"""
Build master knowledge base from all raw extracted sources.
Combines all raw/*.json into a single knowledge_chunks.jsonl.
"""

import json
import hashlib
from pathlib import Path
from datetime import datetime
from collections import Counter

RAW_DIR = Path(__file__).resolve().parent.parent / "raw"
PROCESSED_DIR = Path(__file__).resolve().parent.parent / "processed"
METADATA_DIR = Path(__file__).resolve().parent.parent / "metadata"

SOURCE_PRIORITY = {
    "pdf_panduan": 1,
    "website": 2,
    "faq_csv": 3,
    "sop_driver": 4,
}

RAW_FILES = [
    ("website_content.json", "website"),
    ("pdf_panduan.json", "pdf_panduan"),
    ("faq_normalized.json", "faq_csv"),
    ("sop_driver.json", "sop_driver"),
]


def generate_chunk_id(source, index, content):
    content_hash = hashlib.md5(content.encode()).hexdigest()[:8]
    return f"{source}_{index:03d}_{content_hash}"


def determine_content_type(chunk):
    source = chunk.get("source", "")
    if source == "faq_csv":
        return "faq"
    if source == "sop_driver":
        return "sop"
    if source == "pdf_panduan":
        section = chunk.get("section", "").lower()
        if "tarif" in section or "harga" in section:
            return "tarif_tabel"
        if "kontak" in section:
            return "kontak"
        if "cara" in section or "order" in section:
            return "prosedur"
        return "kebijakan"
    if source == "website":
        return "informasi"
    return "lainnya"


def load_raw_files():
    all_chunks = []
    for filename, source in RAW_FILES:
        filepath = RAW_DIR / filename
        if filepath.exists():
            with open(filepath, "r", encoding="utf-8") as f:
                chunks = json.load(f)
            print(f"  Loaded {len(chunks):>3} chunks from {filename}")
            all_chunks.extend(chunks)
        else:
            print(f"  WARNING: {filename} not found — skipping")
    return all_chunks


def enrich_metadata(chunks):
    for i, chunk in enumerate(chunks):
        source = chunk.get("source", "unknown")
        chunk["chunk_id"] = generate_chunk_id(source, i, chunk.get("content", ""))
        chunk["content_type"] = determine_content_type(chunk)
        chunk["source_priority"] = SOURCE_PRIORITY.get(source, 99)
        chunk.setdefault("audience", "all")
        chunk.setdefault("category", "umum")
        chunk.setdefault("priority", "medium")
        chunk["version"] = "1.0"
        chunk["last_updated"] = datetime.now().strftime("%Y-%m-%d")
    return chunks


def build_source_registry(chunks):
    source_counts = Counter(c.get("source") for c in chunks)
    category_counts = Counter(c.get("category") for c in chunks)

    return {
        "version": "1.0.0",
        "built_at": datetime.now().isoformat(),
        "embedding_model": "models/text-embedding-004 (Google Gemini)",
        "total_chunks": len(chunks),
        "sources": {
            source: {
                "chunks": count,
                "last_extracted": datetime.now().strftime("%Y-%m-%d"),
            }
            for source, count in source_counts.items()
        },
        "category_distribution": dict(category_counts.most_common()),
    }


def main():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    METADATA_DIR.mkdir(parents=True, exist_ok=True)

    print("Loading raw data...")
    chunks = load_raw_files()

    if not chunks:
        print("ERROR: No raw data found. Run extraction scripts first.")
        return

    print(f"\nTotal raw chunks: {len(chunks)}")
    print("Enriching metadata...")
    chunks = enrich_metadata(chunks)
    chunks.sort(key=lambda c: c.get("source_priority", 99))

    output_path = PROCESSED_DIR / "knowledge_chunks.jsonl"
    with open(output_path, "w", encoding="utf-8") as f:
        for chunk in chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + "\n")

    print(f"\nMaster knowledge: {output_path}")
    print(f"Total chunks: {len(chunks)}")

    registry = build_source_registry(chunks)
    registry_path = METADATA_DIR / "source_registry.json"
    with open(registry_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, ensure_ascii=False, indent=2)
    print(f"Source registry: {registry_path}")

    print("\n--- Summary ---")
    for source, count in Counter(c["source"] for c in chunks).most_common():
        print(f"  {source}: {count} chunks")
    print("\nBy category:")
    for cat, count in Counter(c["category"] for c in chunks).most_common():
        print(f"  {cat}: {count}")

    return chunks


if __name__ == "__main__":
    main()
