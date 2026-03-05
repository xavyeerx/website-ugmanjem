"""
Normalize FAQ CSV into structured JSON with metadata enrichment.
Reads data/anjem_faq_60.csv and classifies each QA pair.
"""

import csv
import json
from pathlib import Path
from datetime import datetime
from collections import Counter

BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "raw"

CATEGORY_KEYWORDS = {
    "apa itu": ("umum", "definisi", "informasi_layanan"),
    "siapa yang": ("umum", "target_pengguna", "informasi_layanan"),
    "layanan yang tersedia": ("layanan", "daftar_layanan", "informasi_layanan"),
    "melayani 24 jam": ("layanan", "jam_operasional", "informasi_layanan"),
    "cara memesan": ("order", "cara_order", "cara_order"),
    "cara order": ("order", "cara_order", "cara_order"),
    "aplikasi": ("order", "platform", "cara_order"),
    "hanya untuk mahasiswa": ("umum", "target_pengguna", "informasi_layanan"),
    "tarif": ("tarif", "harga", "cek_harga"),
    "harga": ("tarif", "harga", "cek_harga"),
    "biaya": ("tarif", "biaya", "cek_harga"),
    "bayar": ("pembayaran", "metode", "pembayaran"),
    "pembayaran": ("pembayaran", "metode", "pembayaran"),
    "qris": ("pembayaran", "qris", "pembayaran"),
    "menjadi driver": ("driver", "pendaftaran", "syarat_driver"),
    "syarat": ("driver", "syarat", "syarat_driver"),
    "pendapatan": ("driver", "pendapatan", "info_driver"),
    "bagi hasil": ("driver", "pendapatan", "info_driver"),
    "rating": ("driver", "rating", "info_driver"),
    "driver": ("driver", "info_driver", "info_driver"),
    "admin": ("kontak", "admin", "kontak"),
    "hubungi": ("kontak", "kontak", "kontak"),
    "rute": ("layanan", "rute", "informasi_layanan"),
    "jarak": ("tarif", "jarak", "cek_harga"),
    "batal": ("order", "pembatalan", "cara_order"),
    "jadwal": ("order", "penjadwalan", "cara_order"),
    "helm": ("keamanan", "helm", "keamanan"),
    "kecelakaan": ("keamanan", "kecelakaan", "keamanan"),
    "asuransi": ("keamanan", "asuransi", "keamanan"),
    "barang": ("layanan", "barang", "informasi_layanan"),
    "hewan": ("layanan", "hewan", "informasi_layanan"),
    "diskon": ("tarif", "promo", "cek_harga"),
    "promo": ("tarif", "promo", "cek_harga"),
    "website": ("kontak", "website", "kontak"),
    "media sosial": ("kontak", "media_sosial", "kontak"),
    "whatsapp": ("kontak", "whatsapp", "kontak"),
    "grup": ("kontak", "whatsapp", "kontak"),
    "keamanan": ("keamanan", "keamanan", "keamanan"),
    "data": ("keamanan", "privasi", "keamanan"),
    "perlakuan": ("keamanan", "keluhan", "keluhan"),
    "bandara": ("layanan", "rute_khusus", "informasi_layanan"),
    "paket": ("layanan", "paket", "informasi_layanan"),
    "lokasi": ("order", "lokasi", "cara_order"),
    "transit": ("tarif", "transit", "cek_harga"),
    "hujan": ("tarif", "cuaca", "cek_harga"),
    "malam": ("tarif", "waktu", "cek_harga"),
    "dini hari": ("tarif", "waktu", "cek_harga"),
    "statistik": ("umum", "statistik", "informasi_layanan"),
    "jumlah": ("umum", "statistik", "informasi_layanan"),
    "iuran": ("driver", "iuran", "info_driver"),
    "kemitraan": ("driver", "iuran", "info_driver"),
    "tagline": ("umum", "branding", "informasi_layanan"),
    "semboyan": ("umum", "branding", "informasi_layanan"),
    "keunggulan": ("umum", "keunggulan", "informasi_layanan"),
    "survei kost": ("layanan", "survei_kost", "informasi_layanan"),
    "urus berkas": ("layanan", "urus_berkas", "informasi_layanan"),
    "jastip": ("layanan", "jastip", "informasi_layanan"),
    "jasa titip": ("layanan", "jastip", "informasi_layanan"),
    "kalkulator": ("layanan", "website_fitur", "cek_harga"),
    "estimasi": ("tarif", "estimasi", "cek_harga"),
    "weekday": ("tarif", "tarif_weekday", "cek_harga"),
    "weekend": ("tarif", "tarif_weekend", "cek_harga"),
    "per km": ("tarif", "tarif_per_km", "cek_harga"),
    "kilometer": ("tarif", "tarif_per_km", "cek_harga"),
    "form": ("driver", "pendaftaran", "syarat_driver"),
    "pendaftaran": ("driver", "pendaftaran", "syarat_driver"),
    "transfer": ("keamanan", "keamanan_pembayaran", "keamanan"),
    "respon": ("order", "waktu_tunggu", "cara_order"),
    "contoh": ("order", "contoh_order", "cara_order"),
    "format pesan": ("order", "contoh_order", "cara_order"),
}

HIGH_PRIORITY_KW = [
    "tarif", "harga", "cara memesan", "cara order", "apa itu", "bayar",
    "pembayaran", "keamanan", "weekday", "weekend", "hujan", "transit",
]
MEDIUM_PRIORITY_KW = [
    "driver", "syarat", "jadwal", "batal", "rute", "layanan",
    "jastip", "estimasi", "kalkulator",
]


def classify(question):
    q = question.lower()
    for kw, val in CATEGORY_KEYWORDS.items():
        if kw in q:
            return val
    return ("umum", "lainnya", "informasi_layanan")


def audience_for(question, answer):
    text = (question + " " + answer).lower()
    driver_kw = [
        "menjadi driver", "syarat driver", "pendapatan driver",
        "iuran", "bagi hasil", "pendaftaran driver", "mitra driver",
    ]
    if any(k in text for k in driver_kw):
        return "calon_driver"
    return "customer"


def priority_for(question):
    q = question.lower()
    if any(k in q for k in HIGH_PRIORITY_KW):
        return "high"
    if any(k in q for k in MEDIUM_PRIORITY_KW):
        return "medium"
    return "low"


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    csv_path = BASE_DIR / "data" / "anjem_faq_60.csv"
    chunks = []

    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            q = row.get("question", "").strip()
            a = row.get("answer", "").strip()
            if not q or not a:
                continue

            cat, subcat, intent = classify(q)

            chunks.append({
                "content": f"Q: {q}\nA: {a}",
                "question": q,
                "answer": a,
                "category": cat,
                "subcategory": subcat,
                "intent": intent,
                "audience": audience_for(q, a),
                "priority": priority_for(q),
                "source": "faq_csv",
                "source_file": "data/anjem_faq_60.csv",
                "faq_index": i + 1,
                "extracted_at": datetime.now().isoformat(),
            })

    output_path = OUTPUT_DIR / "faq_normalized.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    print(f"[normalize_faq] {len(chunks)} FAQ entries -> {output_path}")

    cat_dist = Counter(c["category"] for c in chunks)
    print("  Category distribution:")
    for cat, count in cat_dist.most_common():
        print(f"    {cat}: {count}")

    return chunks


if __name__ == "__main__":
    main()
