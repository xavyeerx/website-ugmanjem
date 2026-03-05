"""
Validate knowledge base completeness and quality.
Checks topic coverage, query coverage, and data quality.
"""

import json
from pathlib import Path
from collections import Counter
from datetime import datetime

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "processed"
METADATA_DIR = Path(__file__).resolve().parent.parent / "metadata"

REQUIRED_TOPICS = [
    ("umum", "definisi", "Definisi & overview UGM Anjem"),
    ("umum", "tentang", "Tentang UGM Anjem"),
    ("layanan", "daftar_layanan", "Daftar layanan"),
    ("tarif", "tarif_anjem", "Tarif anjem weekday/weekend"),
    ("tarif", "tarif_per_km", "Tarif per km di luar pricelist"),
    ("tarif", "tarif_khusus", "Ketentuan tarif khusus (hujan, malam, transit)"),
    ("order", "cara_order", "Cara order / pemesanan"),
    ("pembayaran", "metode_pembayaran", "Metode pembayaran"),
    ("keamanan", "panduan_keamanan", "Keamanan & keselamatan"),
    ("driver", "pendaftaran", "Pendaftaran driver"),
    ("driver", "sop", "SOP driver"),
    ("kontak", "kontak", "Kontak & media sosial"),
]

TEST_QUERIES = [
    "Apa itu UGM Anjem?",
    "Berapa harga anjem dari Pogung ke kampus?",
    "Bagaimana cara order?",
    "Apa syarat jadi driver?",
    "Apakah bisa bayar pakai QRIS?",
    "Apa sanksi driver yang telat?",
    "Berapa tambahan harga saat hujan?",
    "Berapa tarif di luar pricelist?",
    "Apa link website UGM Anjem?",
    "Bagaimana ketentuan transit?",
    "Berapa tarif jastip makanan?",
    "Bagaimana jika ada modus penipuan top up?",
    "Apakah ada fee tambahan dini hari?",
    "Berapa jumlah driver aktif?",
    "Dimana form pendaftaran driver?",
]


def load_chunks():
    filepath = PROCESSED_DIR / "knowledge_chunks.jsonl"
    chunks = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                chunks.append(json.loads(line))
    return chunks


def check_topic_coverage(chunks):
    print("=" * 60)
    print("TOPIC COVERAGE CHECK")
    print("=" * 60)

    covered = 0
    missing = []

    for category, subcategory, description in REQUIRED_TOPICS:
        found = any(
            c.get("category") == category and c.get("subcategory") == subcategory
            for c in chunks
        )
        if not found:
            found = any(
                c.get("category") == category and subcategory in c.get("content", "").lower()
                for c in chunks
            )

        icon = "[+]" if found else "[-]"
        status = "COVERED" if found else "MISSING"
        print(f"  {icon} {description}: {status}")

        if found:
            covered += 1
        else:
            missing.append(description)

    total = len(REQUIRED_TOPICS)
    pct = covered / total * 100 if total else 0
    print(f"\n  Coverage: {covered}/{total} ({pct:.1f}%)")

    if missing:
        print(f"\n  Missing topics:")
        for m in missing:
            print(f"    - {m}")

    return covered, total, missing


def check_query_coverage(chunks):
    print("\n" + "=" * 60)
    print("QUERY COVERAGE CHECK (keyword-based)")
    print("=" * 60)

    covered = 0
    for query in TEST_QUERIES:
        keywords = [w.lower() for w in query.split() if len(w) > 3]
        matches = 0
        for chunk in chunks:
            content = chunk.get("content", "").lower()
            question = chunk.get("question", "").lower()
            hit = sum(1 for kw in keywords if kw in content or kw in question)
            if hit >= 2:
                matches += 1

        icon = "[+]" if matches > 0 else "[-]"
        print(f"  {icon} \"{query}\" -> {matches} matching chunks")

        if matches > 0:
            covered += 1

    total = len(TEST_QUERIES)
    pct = covered / total * 100 if total else 0
    print(f"\n  Query coverage: {covered}/{total} ({pct:.1f}%)")
    return covered, total


def check_data_quality(chunks):
    print("\n" + "=" * 60)
    print("DATA QUALITY CHECK")
    print("=" * 60)

    issues = []

    empty = [c for c in chunks if not c.get("content", "").strip()]
    if empty:
        issues.append(f"{len(empty)} chunks with empty content")

    short = [c for c in chunks if len(c.get("content", "")) < 20]
    if short:
        issues.append(f"{len(short)} chunks with very short content (<20 chars)")

    long_c = [c for c in chunks if len(c.get("content", "")) > 2000]
    if long_c:
        issues.append(f"{len(long_c)} chunks with very long content (>2000 chars)")

    for field in ["source", "category", "chunk_id"]:
        miss = [c for c in chunks if not c.get(field)]
        if miss:
            issues.append(f"{len(miss)} chunks missing '{field}'")

    contents = [c.get("content", "") for c in chunks]
    dupes = len(contents) - len(set(contents))
    if dupes:
        issues.append(f"{dupes} exact-duplicate chunks")

    if issues:
        print("  Issues found:")
        for iss in issues:
            print(f"  [!] {iss}")
    else:
        print("  [+] No quality issues found")

    return issues


def print_stats(chunks):
    print("\n" + "=" * 60)
    print("KNOWLEDGE BASE STATISTICS")
    print("=" * 60)
    print(f"  Total chunks: {len(chunks)}")

    print("\n  By source:")
    for src, cnt in Counter(c.get("source") for c in chunks).most_common():
        print(f"    {src}: {cnt}")

    print("\n  By category:")
    for cat, cnt in Counter(c.get("category") for c in chunks).most_common():
        print(f"    {cat}: {cnt}")

    print("\n  By audience:")
    for aud, cnt in Counter(c.get("audience") for c in chunks).most_common():
        print(f"    {aud}: {cnt}")

    lengths = [len(c.get("content", "")) for c in chunks]
    if lengths:
        print(f"\n  Content length (chars): min={min(lengths)}, max={max(lengths)}, avg={sum(lengths)/len(lengths):.0f}")


def main():
    print("Validating knowledge base...\n")
    chunks = load_chunks()

    topic_covered, topic_total, missing = check_topic_coverage(chunks)
    query_covered, query_total = check_query_coverage(chunks)
    issues = check_data_quality(chunks)
    print_stats(chunks)

    report = {
        "validated_at": datetime.now().isoformat(),
        "total_chunks": len(chunks),
        "topic_coverage": f"{topic_covered}/{topic_total}",
        "query_coverage": f"{query_covered}/{query_total}",
        "missing_topics": missing,
        "quality_issues": issues,
        "status": "PASS" if not issues and topic_covered == topic_total else "NEEDS_REVIEW",
    }

    METADATA_DIR.mkdir(parents=True, exist_ok=True)
    report_path = METADATA_DIR / "coverage_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n\nReport saved: {report_path}")
    print(f"Overall status: {report['status']}")
    return report


if __name__ == "__main__":
    main()
