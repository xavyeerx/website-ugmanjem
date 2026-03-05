"""
Parse SOP Mitra Driver UGM Anjem into structured knowledge chunks.
"""

import json
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "raw"

SOP_SECTIONS = [
    {
        "sop_section": "Pendaftaran & Administrasi",
        "content": (
            "Pendaftaran & Administrasi Mitra Driver UGM Anjem: "
            "Driver harus merupakan mahasiswa aktif atau alumni UGM. "
            "Iuran kemitraan dibayarkan setiap 2 minggu sekali."
        ),
        "severity": "medium",
        "tags": ["pendaftaran", "administrasi", "iuran"],
    },
    {
        "sop_section": "Kesiapan & Perlengkapan",
        "content": (
            "Kesiapan & Perlengkapan Driver: "
            "Kendaraan harus layak jalan dan surat-surat lengkap. "
            "WAJIB pakai helm dan sediakan helm untuk customer. "
            "Pakaian bebas sopan, rapi, dan wangi (nilai plus)."
        ),
        "severity": "high",
        "tags": ["perlengkapan", "kendaraan", "helm", "penampilan"],
    },
    {
        "sop_section": "Penerimaan Order",
        "content": (
            "Penerimaan Order Driver: "
            "WAJIB react pesan order di grup sebelum jemput customer. "
            "Boleh menumpuk order maksimal 2 order, tetapi tetap dikondisikan."
        ),
        "severity": "high",
        "tags": ["order", "react", "numpuk_order"],
    },
    {
        "sop_section": "Etika Pelayanan",
        "content": (
            "Etika Pelayanan Driver: "
            "Tepat waktu jemput (keterlambatan maksimal 5-10 menit). "
            "Ramah: senyum, sapa, sopan. "
            "Utamakan kenyamanan dan keselamatan customer. "
            "Dilarang merokok, berkata kasar, atau main HP berlebihan saat berkendara. "
            "Jika telat, wajib menginformasikan ke customer."
        ),
        "severity": "high",
        "tags": ["etika", "pelayanan", "keramahan", "keselamatan"],
    },
    {
        "sop_section": "Pembayaran & Tarif",
        "content": (
            "Pembayaran & Tarif Driver: "
            "Tarif harus sesuai pricelist resmi UGM Anjem. "
            "Tarif di luar pricelist harus didiskusikan di grup driver. "
            "Iuran wajib disetor tepat waktu, maksimal H+3 dari jadwal."
        ),
        "severity": "high",
        "tags": ["tarif", "pembayaran", "iuran", "pricelist"],
    },
    {
        "sop_section": "Komunikasi & Koordinasi",
        "content": (
            "Komunikasi & Koordinasi Driver: "
            "Komunikasi dilakukan di grup driver (termasuk info on/off status). "
            "Jika lama tidak aktif (off), wajib meminta izin ke admin."
        ),
        "severity": "medium",
        "tags": ["komunikasi", "koordinasi", "grup_driver"],
    },
    {
        "sop_section": "Sanksi & Pelanggaran",
        "content": (
            "Sanksi & Pelanggaran Driver UGM Anjem: "
            "1) Teguran Lisan: keterlambatan ringan, komunikasi buruk, jarang ON. "
            "2) Teguran Tertulis: menolak order tanpa alasan, markup tarif. "
            "3) Suspensi Sementara: pelanggaran etika atau keselamatan. "
            "4) Pemutusan Kemitraan: pelanggaran berat (penipuan, pelecehan, tidak setor iuran)."
        ),
        "severity": "critical",
        "tags": ["sanksi", "pelanggaran", "teguran", "suspensi", "pemutusan"],
    },
    {
        "sop_section": "WASPADA - Modus Penipuan Jastip",
        "content": (
            "PERINGATAN untuk Driver - Modus Penipuan Jastip: "
            "Tolak semua pesanan jastip dalam bentuk top up apapun modusnya. "
            "Tanyakan ke grup driver jika ada jastip dengan harga tidak wajar. "
            "Modus biasanya dimulai dari jastip kartu ke konter atau jastip makanan ke Indomaret. "
            "Cara deteksi: "
            "1) Pura-pura bilang sudah di lokasi (Indomaret/konter). "
            "2) Tanyakan apakah ada tambahan. "
            "3) Jika customer minta top up pulsa atau sejenisnya, blok dan laporkan di grup driver. "
            "4) Jika tidak ada tambahan top up, jastip aman untuk diambil."
        ),
        "severity": "critical",
        "tags": ["waspada", "penipuan", "top_up", "jastip", "modus"],
    },
]


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    chunks = []
    for section in SOP_SECTIONS:
        chunks.append({
            "content": section["content"],
            "section": f"SOP Driver - {section['sop_section']}",
            "sop_section": section["sop_section"],
            "severity": section["severity"],
            "tags": section["tags"],
            "category": "driver",
            "subcategory": "sop",
            "audience": "driver",
            "source": "sop_driver",
            "source_file": "SOP Mitra Driver UGM Anjem",
            "extracted_at": datetime.now().isoformat(),
        })

    full_sop = "SOP Lengkap Mitra Driver UGM Anjem:\n\n"
    for s in SOP_SECTIONS:
        full_sop += f"[{s['sop_section']}]\n{s['content']}\n\n"

    chunks.append({
        "content": full_sop.strip(),
        "section": "SOP Driver - Lengkap",
        "sop_section": "Lengkap",
        "severity": "high",
        "tags": ["sop", "lengkap", "driver"],
        "category": "driver",
        "subcategory": "sop_lengkap",
        "audience": "driver",
        "source": "sop_driver",
        "source_file": "SOP Mitra Driver UGM Anjem",
        "extracted_at": datetime.now().isoformat(),
    })

    output_path = OUTPUT_DIR / "sop_driver.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    print(f"[parse_sop] {len(chunks)} chunks ({len(SOP_SECTIONS)} sections + 1 full) -> {output_path}")
    return chunks


if __name__ == "__main__":
    main()
