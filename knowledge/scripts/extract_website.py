"""
Extract knowledge from UGM Anjem website source code (Next.js).
Reads data/*.ts and lib/constants.ts to extract structured content.
"""

import json
import re
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "raw"


def read_ts(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def parse_stats():
    content = read_ts(BASE_DIR / "data" / "stats.ts")
    chunks = []

    stats_match = re.findall(r'\{ value: "(.+?)", label: "(.+?)" \}', content)
    if stats_match:
        stats_text = "Statistik UGM Anjem: " + ", ".join(
            f"{label}: {value}" for value, label in stats_match
        )
        chunks.append({
            "content": stats_text,
            "section": "Statistik",
            "category": "umum",
            "subcategory": "statistik",
        })

    features = re.findall(
        r'title: "(.+?)",\s*description:\s*"(.+?)"',
        content.split("features")[1].split("tutorialSteps")[0] if "features" in content else "",
        re.DOTALL,
    )
    for title, desc in features:
        chunks.append({
            "content": f"Keunggulan UGM Anjem - {title}: {desc}",
            "section": "Keunggulan",
            "category": "umum",
            "subcategory": "keunggulan",
        })

    steps_block = content.split("tutorialSteps")[1].split("driverRequirements")[0] if "tutorialSteps" in content else ""
    steps = re.findall(
        r'step: (\d+),\s*title: "(.+?)",\s*description:\s*"(.+?)"',
        steps_block, re.DOTALL,
    )
    if steps:
        tutorial_text = "Cara Order UGM Anjem:\n"
        for num, title, desc in steps:
            tutorial_text += f"Langkah {num}: {title} - {desc}\n"
        chunks.append({
            "content": tutorial_text.strip(),
            "section": "Tutorial Order",
            "category": "order",
            "subcategory": "cara_order",
        })

    if "driverRequirements" in content:
        reqs_block = content.split("driverRequirements")[1]
        reqs = re.findall(r'"(.+?)"', reqs_block)
        if reqs:
            chunks.append({
                "content": "Syarat menjadi driver UGM Anjem: " + "; ".join(reqs) + ".",
                "section": "Syarat Driver",
                "category": "driver",
                "subcategory": "syarat",
            })

    return chunks


def parse_services():
    content = read_ts(BASE_DIR / "data" / "services.ts")
    chunks = []

    services = re.findall(
        r'title: "(.+?)",\s*image: ".+?",\s*rating: (\d+),\s*trips: "(.+?)",\s*price: "(.+?)",\s*category: "(.+?)"',
        content,
    )
    for title, rating, trips, price, category in services:
        chunks.append({
            "content": f"Layanan {title}: Harga mulai dari {price}, sudah {trips} trip selesai. Rating: {rating}/5. Kategori: {category}.",
            "section": f"Layanan {title}",
            "category": "layanan",
            "subcategory": category,
        })

    if "serviceDescriptions" in content:
        descs_block = content.split("serviceDescriptions")[1]
        descs = re.findall(r'"(.+?)":\s*\n?\s*"(.+?)"', descs_block)
        for key, desc in descs:
            chunks.append({
                "content": f"Deskripsi layanan {key}: {desc}",
                "section": f"Deskripsi {key}",
                "category": "layanan",
                "subcategory": key.replace("-", "_"),
            })

    return chunks


def parse_pricelist():
    content = read_ts(BASE_DIR / "data" / "pricelist.ts")
    images = re.findall(r'alt: "(.+?)"', content)
    if not images:
        return []
    areas = [img.replace("UGM Anjem Pricelist ", "") for img in images]
    return [{
        "content": f"Pricelist UGM Anjem tersedia dalam bentuk poster untuk area: {', '.join(areas)}. Poster pricelist dapat dilihat di website anjemugm.vercel.app bagian Pricelist.",
        "section": "Pricelist",
        "category": "tarif",
        "subcategory": "pricelist",
    }]


def parse_constants():
    content = read_ts(BASE_DIR / "lib" / "constants.ts")
    chunks = []

    wa_order = re.search(r'WHATSAPP_ORDER_URL\s*=\s*"(.+?)"', content)
    wa_admin = re.search(r'WHATSAPP_ADMIN_URL\s*=\s*"(.+?)"', content)
    driver_reg = re.search(r'DRIVER_REGISTRATION_URL\s*=\s*"(.+?)"', content)
    ig = re.search(r'instagram:\s*"(.+?)"', content)
    tiktok = re.search(r'tiktok:\s*"(.+?)"', content)

    lines = ["Kontak & Media Sosial UGM Anjem:", "- Website: anjemugm.vercel.app"]
    if ig:
        lines.append(f"- Instagram: {ig.group(1)}")
    if tiktok:
        lines.append(f"- TikTok: {tiktok.group(1)}")
    if wa_order:
        lines.append(f"- Link Grup WhatsApp: {wa_order.group(1)}")
    if wa_admin:
        lines.append(f"- WhatsApp Admin: {wa_admin.group(1)}")
    if driver_reg:
        lines.append(f"- Form Pendaftaran Driver: {driver_reg.group(1)}")
    chunks.append({
        "content": "\n".join(lines),
        "section": "Kontak",
        "category": "kontak",
        "subcategory": "media_sosial",
    })

    price_per_km = re.search(r'PRICE_PER_KM\s*=\s*(\d+)', content)
    min_price = re.search(r'MINIMUM_PRICE\s*=\s*(\d+)', content)
    jastip_fee = re.search(r'JASTIP_FEE\s*=\s*(\d+)', content)
    rainy_fee = re.search(r'RAINY_FEE\s*=\s*(\d+)', content)
    early_fee = re.search(r'EARLY_MORNING_FEE\s*=\s*(\d+)', content)

    price_lines = ["Konstanta Harga UGM Anjem:"]
    if price_per_km:
        price_lines.append(f"- Tarif per km (di luar pricelist): Rp{price_per_km.group(1)}")
    if min_price:
        price_lines.append(f"- Tarif minimum: Rp{min_price.group(1)}")
    if jastip_fee:
        price_lines.append(f"- Fee tambahan jastip: Rp{jastip_fee.group(1)}")
    if rainy_fee:
        price_lines.append(f"- Fee tambahan hujan: Rp{rainy_fee.group(1)}")
    if early_fee:
        price_lines.append(f"- Fee tambahan dini hari (>22:00): Rp{early_fee.group(1)}")
    chunks.append({
        "content": "\n".join(price_lines),
        "section": "Konstanta Harga",
        "category": "tarif",
        "subcategory": "konstanta",
    })

    return chunks


def parse_reviews():
    content = read_ts(BASE_DIR / "data" / "reviews.ts")
    reviews = re.findall(
        r'name: "(.+?)",\s*affiliation: "(.+?)",\s*review:\s*"(.+?)"',
        content, re.DOTALL,
    )
    return [
        {
            "content": f'Testimoni dari {name} ({affil}): "{review}"',
            "section": "Testimoni",
            "category": "umum",
            "subcategory": "testimoni",
        }
        for name, affil, review in reviews
    ]


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    all_chunks = []
    all_chunks.extend(parse_stats())
    all_chunks.extend(parse_services())
    all_chunks.extend(parse_pricelist())
    all_chunks.extend(parse_constants())
    all_chunks.extend(parse_reviews())

    for chunk in all_chunks:
        chunk["source"] = "website"
        chunk["source_file"] = "Next.js source code"
        chunk["extracted_at"] = datetime.now().isoformat()

    output_path = OUTPUT_DIR / "website_content.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    print(f"[extract_website] {len(all_chunks)} chunks -> {output_path}")
    return all_chunks


if __name__ == "__main__":
    main()
