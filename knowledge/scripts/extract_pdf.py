"""
Extract knowledge from Panduan Pengguna UGM Anjem PDF.
Since we have the PDF generator source code (generate_panduan_pdf.py),
we extract content directly — far more reliable than parsing the PDF file.
"""

import json
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "raw"

PANDUAN_SECTIONS = [
    {
        "section": "1. Tentang UGM Anjem",
        "content": (
            "UGM Anjem (Antar Jemput UGM) adalah layanan antar jemput dan jasa titip (jastip) berbasis "
            "komunitas yang dioperasikan oleh mahasiswa Universitas Gadjah Mada. Layanan ini hadir sebagai "
            "solusi mobilitas terpercaya bagi mahasiswa UGM yang membutuhkan transportasi di sekitar area "
            "kampus dan kos-kosan. "
            "Seluruh driver UGM Anjem adalah mahasiswa UGM aktif yang telah terverifikasi, sehingga lebih "
            "memahami wilayah kampus dan sekitarnya. Dengan tarif yang terjangkau dan proses pemesanan yang "
            "mudah melalui grup WhatsApp, UGM Anjem menjadi pilihan utama mahasiswa untuk kebutuhan "
            "transportasi sehari-hari."
        ),
        "category": "umum",
        "subcategory": "tentang",
    },
    {
        "section": "1.1 Keunggulan UGM Anjem",
        "content": (
            "Keunggulan UGM Anjem: "
            "1) Driver 100% Mahasiswa UGM - Lebih paham wilayah dalam dan sekitar kampus, bonus mendapat relasi baru. "
            "2) Aman, Cepat, dan Fleksibel - Cukup chat di grup WhatsApp, kami siap membantu segala kebutuhanmu. "
            "3) Terjangkau - Tarif ramah kantong mahasiswa, mulai dari Rp5.000 saja. "
            "4) Mudah Diakses - Pemesanan dilakukan langsung via grup WhatsApp tanpa perlu install aplikasi tambahan. "
            "5) Keunggulan Mobilitas Area Kampus - Menguasai jalur-jalur dalam kampus UGM yang tidak terjangkau ojol biasa."
        ),
        "category": "umum",
        "subcategory": "keunggulan",
    },
    {
        "section": "1.2 Statistik UGM Anjem",
        "content": (
            "Statistik UGM Anjem per Maret 2026: "
            "Driver Aktif: 20 Driver. "
            "Grup WhatsApp: 3 Grup. "
            "Order Selesai: 3.000+ Order. "
            "Member Grup: 2.000+ Member."
        ),
        "category": "umum",
        "subcategory": "statistik",
    },
    {
        "section": "2. Layanan yang Tersedia",
        "content": (
            "UGM Anjem menyediakan beberapa jenis layanan:\n"
            "A. Antar Jemput (Anjem): Layanan utama untuk mengantar dan menjemput mahasiswa dari/ke kampus, "
            "kos, atau lokasi lain di sekitar area UGM. Tarif mulai dari Rp5.000.\n"
            "B. Jasa Titip (Jastip): Driver membelikan dan mengantarkan pesanan (makanan, obat, barang). "
            "Jastip makanan (dengan menunggu) mulai dari Rp6.000. Jastip barang (tanpa menunggu) mulai dari Rp5.000.\n"
            "C. Survei Kost: Layanan mengantar dan menemani survei lokasi kos. Tarif mulai dari Rp15.000.\n"
            "D. Urus Berkas Kampus: Bantuan mengurus berkas di lingkungan kampus UGM "
            "(legalisir, pengambilan surat, administrasi). Tarif mulai dari Rp15.000."
        ),
        "category": "layanan",
        "subcategory": "daftar_layanan",
    },
    {
        "section": "3. Cara Order (Pemesanan)",
        "content": (
            "Langkah-langkah pemesanan layanan UGM Anjem:\n"
            "1. Join Grup WhatsApp Resmi: Bergabung via link di website anjemugm.vercel.app atau bio Instagram @ugm.anjem.\n"
            "2. Kirim Pesan Order di Grup: Sebutkan jenis layanan (anjem/jastip/dll), lokasi penjemputan, dan tujuan.\n"
            "3. Tunggu Respon Driver: Driver yang ready akan membalas via Personal Chat (PC) dan me-react pesan di grup. Waktu tunggu maksimal 10 menit.\n"
            "4. Konfirmasi Detail via PC: Lanjutkan detail pemesanan dengan driver pertama yang menghubungi. Abaikan driver lain.\n"
            "5. Share Lokasi & Tunggu Driver: Bagikan lokasi live dan tunggu di titik jemput.\n"
            "6. Bayar Langsung ke Driver: Setelah sampai tujuan, bayar tunai atau QRIS."
        ),
        "category": "order",
        "subcategory": "cara_order",
    },
    {
        "section": "3.1 Contoh Pesan Order",
        "content": (
            "Contoh format pesan order di grup WhatsApp:\n"
            "- 'Ada yang bisa anjem dari Pogung ke Kampus SV?'\n"
            "- 'Mau jastip makanan dari Warmindo Sendowo dong'\n"
            "- 'Butuh anjem dari FEB ke kos Jakal, ada yang ready?'"
        ),
        "category": "order",
        "subcategory": "contoh_order",
    },
    {
        "section": "3.2 Catatan Keamanan Order",
        "content": (
            "Pastikan yang menghubungi via PC adalah ADMIN GRUP RESMI. Jika yang menghubungi bukan admin, "
            "segera laporkan kepada admin grup. Hanya terima order dari admin grup demi keamanan. "
            "Jika dalam 10 menit tidak ada respon, berarti semua driver sedang off — coba lagi nanti."
        ),
        "category": "keamanan",
        "subcategory": "keamanan_order",
    },
    {
        "section": "4. Informasi Tarif & Harga",
        "content": (
            "Tarif resmi UGM Anjem:\n\n"
            "A. Tarif Antar Jemput:\n"
            "WEEKDAYS (Gerbang Kampus Terbuka): Rp5.000 area dekat (Sendowo, Pogung, Klebengan), "
            "Rp6.000 area kos >2.5 km, Maks Rp6.000 jarak >3 km.\n"
            "WEEKEND/MALAM (Gerbang Kampus Tertutup): Rp5.000 area dekat, "
            "Rp6.000 area terdampak muter 2.5-3 km, Rp7.000 area terdampak muter 3-4 km.\n"
            "Tarif weekday wajib Rp5.000-Rp6.000. Tarif weekend/malam Rp5.000-Rp7.000."
        ),
        "category": "tarif",
        "subcategory": "tarif_anjem",
    },
    {
        "section": "4.1 Tarif Di Luar Area Pricelist",
        "content": (
            "Untuk tujuan di luar area pricelist, berlaku tarif Rp2.500 per kilometer. "
            "Rumus: Jarak (km) x Rp2.500. Hasil dibulatkan ke ribuan terdekat ke bawah. "
            "Contoh: Jarak 4,56 km → 4,56 x Rp2.500 = Rp11.400 → dibulatkan menjadi Rp11.000."
        ),
        "category": "tarif",
        "subcategory": "tarif_per_km",
    },
    {
        "section": "4.2 Tarif Layanan Lainnya",
        "content": (
            "Tarif layanan selain anjem:\n"
            "- Jastip Makanan (dengan menunggu): mulai dari Rp6.000\n"
            "- Jastip Barang (tanpa menunggu): mulai dari Rp5.000\n"
            "- Survei Kost: mulai dari Rp15.000\n"
            "- Urus Berkas Kampus: mulai dari Rp15.000"
        ),
        "category": "tarif",
        "subcategory": "tarif_lainnya",
    },
    {
        "section": "5. Ketentuan Tarif Khusus",
        "content": (
            "A. Fee Tambahan Dini Hari: Order setelah 22.00 WIB dikenakan +Rp1.000 untuk semua layanan.\n\n"
            "B. Tarif Hujan: +Rp1.000 jika driver pakai mantel dan customer tidak, "
            "+Rp2.000 jika customer memakai mantel driver, "
            "+Rp3.000 jika keduanya pakai mantel dan hujan deras + jarak jauh.\n\n"
            "C. Ketentuan Transit: Transit searah/dekat dengan tunggu maks 7 menit: GRATIS. "
            "Transit tunggu >7 menit: +Rp1.000-Rp2.000. Transit beda arah jauh: 2x orderan."
        ),
        "category": "tarif",
        "subcategory": "tarif_khusus",
    },
    {
        "section": "6. Metode Pembayaran",
        "content": (
            "Pembayaran langsung kepada driver setelah layanan selesai.\n"
            "A. Tunai (Cash): Bayar langsung, disarankan uang pas.\n"
            "B. QRIS: Scan QRIS dari driver, bisa pakai e-wallet atau mobile banking.\n\n"
            "PENTING: Pembayaran ke driver langsung, BUKAN transfer ke rekening tertentu. "
            "Jika ada yang minta transfer sebelum layanan, laporkan ke admin."
        ),
        "category": "pembayaran",
        "subcategory": "metode_pembayaran",
    },
    {
        "section": "7. Keamanan & Keselamatan",
        "content": (
            "Panduan keamanan pengguna:\n"
            "- Hanya terima order dari ADMIN GRUP resmi.\n"
            "- Jika ada yang mengaku driver tapi BUKAN admin, segera laporkan.\n"
            "- Jangan beri info sensitif (PIN, password) ke siapapun.\n"
            "- Selalu pakai share location.\n"
            "- Kenakan helm selama perjalanan.\n\n"
            "Kebijakan Keluhan: Sampaikan dengan jelas dan sopan, sertakan bukti, admin akan menindaklanjuti."
        ),
        "category": "keamanan",
        "subcategory": "panduan_keamanan",
    },
    {
        "section": "9. Kontak & Media Sosial",
        "content": (
            "Platform UGM Anjem:\n"
            "- Website: anjemugm.vercel.app\n"
            "- Instagram: @ugm.anjem\n"
            "- TikTok: @ugm.anjem\n"
            "- WhatsApp Grup: Link tersedia di website dan bio Instagram"
        ),
        "category": "kontak",
        "subcategory": "kontak",
    },
    {
        "section": "10. Bergabung Sebagai Driver",
        "content": (
            "Persyaratan driver UGM Anjem:\n"
            "- Mahasiswa aktif Universitas Gadjah Mada\n"
            "- Memiliki komitmen dan banyak waktu luang\n"
            "- Kendaraan bermotor dengan surat lengkap (STNK, SIM)\n\n"
            "Cara mendaftar: Isi formulir di anjemugm.vercel.app bagian 'Join As A Driver'. "
            "Admin akan menghubungi untuk verifikasi dan briefing."
        ),
        "category": "driver",
        "subcategory": "pendaftaran",
    },
]


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    chunks = []
    for section_data in PANDUAN_SECTIONS:
        chunks.append({
            "content": section_data["content"],
            "section": section_data["section"],
            "category": section_data["category"],
            "subcategory": section_data["subcategory"],
            "source": "pdf_panduan",
            "source_file": "Panduan_Pengguna_UGM_Anjem.pdf",
            "extracted_at": datetime.now().isoformat(),
        })

    output_path = OUTPUT_DIR / "pdf_panduan.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    print(f"[extract_pdf] {len(chunks)} sections -> {output_path}")
    return chunks


if __name__ == "__main__":
    main()
