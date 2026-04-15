"""
Skenario 2 — Pengujian Akurasi Jawaban Chatbot (RAG Quality) dengan RAGAS

Skrip ini mengirim 30 pertanyaan ground truth ke chatbot API secara otomatis,
lalu mengevaluasi kualitas jawaban menggunakan framework RAGAS.

Metrik RAGAS yang digunakan:
  - answer_relevancy  : seberapa relevan jawaban bot terhadap pertanyaan
                        (0.0 = tidak relevan, 1.0 = sangat relevan)
  - answer_correctness: seberapa benar jawaban bot dibanding ground truth,
                        menggabungkan kemiripan faktual dan semantik
                        (0.0 = salah, 1.0 = identik dengan ground truth)

Kedua metrik menggunakan LLM (OpenAI GPT) sebagai evaluator otomatis.

Referensi:
  Es, S., James, J., Espinosa-Anke, L., & Schockaert, S. (2024).
  RAGAs: Automated Evaluation of Retrieval Augmented Generation.
  EACL 2024 System Demonstrations.

Prasyarat:
  - OPENAI_API_KEY harus di-set di environment (sama dengan key di backend/.env)

Cara menjalankan (dari root project):
  pip install ragas openai requests
  set OPENAI_API_KEY=sk-proj-...        (Windows)
  export OPENAI_API_KEY=sk-proj-...     (Linux/Mac)
  python tests/accuracy_test.py

Output: results/accuracy_results.csv
"""

import csv
import os
import statistics
import time

import requests
from ragas import evaluate
from ragas.dataset_schema import EvaluationDataset, SingleTurnSample
from ragas.metrics import AnswerCorrectness, AnswerRelevancy

TARGET = os.getenv("CHATBOT_URL", "http://10.33.109.173")
OUTPUT = os.path.join(os.path.dirname(__file__), "..", "results", "accuracy_results.csv")
DELAY  = 3  # detik antar request agar tidak rate-limited

# ---------------------------------------------------------------------------
# 30 Pertanyaan Ground Truth — berdasarkan FAQ & konten resmi UGM Anjem
# Dikelompokkan ke 5 kategori (6 pertanyaan masing-masing)
# ---------------------------------------------------------------------------
QUESTIONS = [
    # ── 1. TARIF & HARGA (6 pertanyaan) ─────────────────────────────────────
    {
        "id": 1, "category": "Tarif & Harga",
        "question": "Berapa tarif dasar layanan antar jemput motor UGM Anjem?",
        "ground_truth": "Motor: Rp2.500/km dengan tarif minimum Rp5.000.",
    },
    {
        "id": 2, "category": "Tarif & Harga",
        "question": "Berapa biaya tambahan saat hujan untuk layanan motor?",
        "ground_truth": "Tambahan flat Rp2.000 saat hujan untuk motor.",
    },
    {
        "id": 3, "category": "Tarif & Harga",
        "question": "Berapa tarif mobil UGM Anjem dan bagaimana perhitungannya?",
        "ground_truth": "Mobil: tarif dasar Rp7.000 + Rp4.000/km, dengan multiplier cuaca "
                        "(Normal 1.0x, Mendung 1.2x, Hujan 1.6x, Badai 2.0x).",
    },
    {
        "id": 4, "category": "Tarif & Harga",
        "question": "Berapa tarif layanan survei kost UGM Anjem?",
        "ground_truth": "Mulai dari Rp15.000, tergantung lokasi dan lama waktu tunggu.",
    },
    {
        "id": 5, "category": "Tarif & Harga",
        "question": "Apakah ada biaya tambahan untuk perjalanan malam hari?",
        "ground_truth": "Ya, tambahan Rp1.000 untuk perjalanan setelah pukul 22.00 WIB.",
    },
    {
        "id": 6, "category": "Tarif & Harga",
        "question": "Berapa tarif jasa titip makanan dengan driver menunggu?",
        "ground_truth": "Mulai dari Rp6.000, tergantung jarak dan kondisi.",
    },

    # ── 2. CARA ORDER & PEMBAYARAN (6 pertanyaan) ────────────────────────────
    {
        "id": 7, "category": "Cara Order & Pembayaran",
        "question": "Bagaimana cara memesan layanan UGM Anjem?",
        "ground_truth": "Bergabung ke grup WhatsApp resmi UGM Anjem (link di bio Instagram "
                        "@ugm.anjem atau website anjemugm.vercel.app), lalu kirim pesanan di grup.",
    },
    {
        "id": 8, "category": "Cara Order & Pembayaran",
        "question": "Apakah bisa memesan layanan UGM Anjem lewat aplikasi atau website?",
        "ground_truth": "Tidak. Pemesanan dilakukan via grup WhatsApp. Website hanya untuk "
                        "informasi, pricelist, dan kalkulator harga.",
    },
    {
        "id": 9, "category": "Cara Order & Pembayaran",
        "question": "Apakah UGM Anjem menerima pembayaran QRIS?",
        "ground_truth": "Ya, pembayaran bisa tunai atau QRIS langsung ke driver setelah layanan selesai.",
    },
    {
        "id": 10, "category": "Cara Order & Pembayaran",
        "question": "Apakah bisa membatalkan pesanan UGM Anjem?",
        "ground_truth": "Bisa, selama driver belum berangkat menjemput.",
    },
    {
        "id": 11, "category": "Cara Order & Pembayaran",
        "question": "Apakah bisa menjadwalkan jemputan untuk keesokan harinya?",
        "ground_truth": "Bisa, pemesanan terjadwal dapat dilakukan melalui grup WhatsApp sejak H-1.",
    },
    {
        "id": 12, "category": "Cara Order & Pembayaran",
        "question": "Apa yang harus dilakukan jika ada yang meminta transfer pembayaran sebelum layanan?",
        "ground_truth": "Segera laporkan ke admin. Pembayaran UGM Anjem dilakukan LANGSUNG ke driver "
                        "setelah layanan selesai, bukan via transfer rekening terlebih dahulu.",
    },

    # ── 3. LAYANAN (6 pertanyaan) ─────────────────────────────────────────────
    {
        "id": 13, "category": "Layanan",
        "question": "Apa saja layanan yang tersedia di UGM Anjem?",
        "ground_truth": "Antar jemput, jasa titip (jastip), survei kost, urus berkas kampus, "
                        "dan kebutuhan lain di kawasan UGM dan Yogyakarta.",
    },
    {
        "id": 14, "category": "Layanan",
        "question": "Apakah UGM Anjem melayani 24 jam?",
        "ground_truth": "Tersedia setiap saat, namun pemesanan pukul 00.00–06.00 WIB "
                        "mungkin lebih lambat responsnya.",
    },
    {
        "id": 15, "category": "Layanan",
        "question": "Apakah UGM Anjem menyediakan kendaraan mobil?",
        "ground_truth": "Ya, tersedia layanan Mobil (kapasitas 4 orang) selain Motor.",
    },
    {
        "id": 16, "category": "Layanan",
        "question": "Bagaimana ketentuan transit atau mampir saat perjalanan?",
        "ground_truth": "Transit searah atau dekat dengan tunggu maks 7 menit: gratis. "
                        "Tunggu lebih dari 7 menit: +Rp1.000–Rp2.000. "
                        "Transit beda arah jauh: dihitung 2 orderan terpisah.",
    },
    {
        "id": 17, "category": "Layanan",
        "question": "Apakah UGM Anjem melayani rute ke Bandara Yogyakarta International Airport?",
        "ground_truth": "Ya, tersedia layanan ke dan dari bandara dengan tarif khusus.",
    },
    {
        "id": 18, "category": "Layanan",
        "question": "Bagaimana kebijakan barang tertinggal di kendaraan driver?",
        "ground_truth": "Barang tertinggal disimpan oleh driver atau admin maksimal 7 hari.",
    },

    # ── 4. DRIVER (6 pertanyaan) ──────────────────────────────────────────────
    {
        "id": 19, "category": "Driver",
        "question": "Apa saja syarat menjadi driver UGM Anjem?",
        "ground_truth": "Mahasiswa UGM (dibuktikan KTM), memiliki SIM aktif, kendaraan pribadi "
                        "kondisi baik, KTP, memiliki 2 helm, dan bersedia mengikuti aturan operasional.",
    },
    {
        "id": 20, "category": "Driver",
        "question": "Bagaimana cara mendaftar menjadi driver UGM Anjem?",
        "ground_truth": "Mengisi form antrian di website anjemugm.vercel.app bagian "
                        "'Join As A Driver', lalu menunggu konfirmasi dari admin.",
    },
    {
        "id": 21, "category": "Driver",
        "question": "Apakah ada sistem bagi hasil untuk driver UGM Anjem?",
        "ground_truth": "Tidak ada bagi hasil. Seluruh pendapatan order milik driver. "
                        "Hanya ada iuran kemitraan yang dibayarkan setiap dua minggu sekali.",
    },
    {
        "id": 22, "category": "Driver",
        "question": "Apakah driver UGM Anjem wajib mahasiswa UGM?",
        "ground_truth": "Ya, wajib. Konsep UGM Anjem adalah Dari Mahasiswa Untuk Mahasiswa.",
    },
    {
        "id": 23, "category": "Driver",
        "question": "Berapa jumlah driver aktif UGM Anjem saat ini?",
        "ground_truth": "20 driver aktif, semuanya mahasiswa UGM terverifikasi.",
    },
    {
        "id": 24, "category": "Driver",
        "question": "Apakah ada biaya pendaftaran untuk menjadi driver UGM Anjem?",
        "ground_truth": "Tidak ada biaya pendaftaran.",
    },

    # ── 5. INFO UMUM & KONTAK (6 pertanyaan) ─────────────────────────────────
    {
        "id": 25, "category": "Info Umum & Kontak",
        "question": "Apa itu UGM Anjem?",
        "ground_truth": "Platform layanan antar jemput, jasa titip, dan kebutuhan lain "
                        "bagi mahasiswa UGM dengan harga kompetitif dan fleksibel.",
    },
    {
        "id": 26, "category": "Info Umum & Kontak",
        "question": "Berapa statistik UGM Anjem secara keseluruhan?",
        "ground_truth": "20 driver aktif, 3 grup WhatsApp, 3.000+ order selesai, 2.000+ member grup "
                        "(per Maret 2026).",
    },
    {
        "id": 27, "category": "Info Umum & Kontak",
        "question": "Bagaimana cara menghubungi admin UGM Anjem?",
        "ground_truth": "Melalui halaman Kontak di website anjemugm.vercel.app atau "
                        "WhatsApp admin di nomor 082123035583.",
    },
    {
        "id": 28, "category": "Info Umum & Kontak",
        "question": "Apa keunggulan UGM Anjem dibanding ojek online biasa?",
        "ground_truth": "Driver 100% mahasiswa UGM yang paham jalur kampus, tarif mulai Rp5.000, "
                        "fleksibel cukup chat di WhatsApp tanpa aplikasi, dan bisa request jasa di luar layanan standar.",
    },
    {
        "id": 29, "category": "Info Umum & Kontak",
        "question": "Apa akun media sosial resmi UGM Anjem?",
        "ground_truth": "Instagram @ugm.anjem, TikTok @ugm.anjem. "
                        "Link grup WhatsApp tersedia di website dan bio Instagram.",
    },
    {
        "id": 30, "category": "Info Umum & Kontak",
        "question": "Apa yang terjadi jika tidak ada driver yang merespon dalam 10 menit?",
        "ground_truth": "Berarti semua driver sedang off. Coba lagi nanti atau di waktu berbeda.",
    },
]

# ---------------------------------------------------------------------------
# Phase 1: Kumpulkan jawaban bot dari API
# ---------------------------------------------------------------------------
def collect_answers() -> list[dict]:
    total = len(QUESTIONS)
    print(f"[Phase 1] Mengirim {total} pertanyaan ke {TARGET} ...\n")

    collected = []
    for item in QUESTIONS:
        print(f"  [{item['id']:02d}/{total}] {item['question'][:65]}...")
        try:
            resp = requests.post(
                f"{TARGET}/api/chat",
                json={"message": item["question"], "conversation_history": []},
                timeout=60,
            )
            bot_answer = resp.json().get("answer", "").strip() if resp.ok \
                else f"HTTP {resp.status_code}"
            api_status = "ok" if resp.ok else "error"
        except requests.exceptions.Timeout:
            bot_answer, api_status = "TIMEOUT", "error"
        except Exception as exc:
            bot_answer, api_status = f"ERROR: {exc}", "error"

        collected.append({
            "id":          item["id"],
            "category":    item["category"],
            "question":    item["question"],
            "ground_truth": item["ground_truth"],
            "bot_answer":  bot_answer,
            "api_status":  api_status,
        })

        if item["id"] < total:
            time.sleep(DELAY)

    ok = sum(1 for r in collected if r["api_status"] == "ok")
    print(f"\n  Selesai: {ok}/{total} berhasil.\n")
    return collected


# ---------------------------------------------------------------------------
# Phase 2: Evaluasi dengan RAGAS
# ---------------------------------------------------------------------------
def evaluate_ragas(collected: list[dict]) -> list[dict]:
    if not os.getenv("OPENAI_API_KEY"):
        raise EnvironmentError(
            "OPENAI_API_KEY belum di-set.\n"
            "  Windows : set OPENAI_API_KEY=sk-proj-...\n"
            "  Linux   : export OPENAI_API_KEY=sk-proj-..."
        )

    ok_items = [r for r in collected if r["api_status"] == "ok"]
    print(f"[Phase 2] Mengevaluasi {len(ok_items)} jawaban dengan RAGAS ...")
    print("  Metrik: AnswerRelevancy + AnswerCorrectness (via OpenAI LLM)\n")

    samples = [
        SingleTurnSample(
            user_input=r["question"],
            response=r["bot_answer"],
            reference=r["ground_truth"],
        )
        for r in ok_items
    ]

    dataset = EvaluationDataset(samples=samples)
    result  = evaluate(
        dataset=dataset,
        metrics=[AnswerRelevancy(), AnswerCorrectness()],
    )
    df = result.to_pandas()

    # Gabungkan skor RAGAS kembali ke data asli
    score_map = {
        r["question"]: {
            "answer_relevancy":   round(float(row["answer_relevancy"]),   4),
            "answer_correctness": round(float(row["answer_correctness"]), 4),
        }
        for r, (_, row) in zip(ok_items, df.iterrows())
    }

    for item in collected:
        scores = score_map.get(item["question"], {})
        item["answer_relevancy"]   = scores.get("answer_relevancy",   "")
        item["answer_correctness"] = scores.get("answer_correctness", "")

    return collected


# ---------------------------------------------------------------------------
# Simpan CSV & tampilkan ringkasan
# ---------------------------------------------------------------------------
def save_and_summarize(results: list[dict]):
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

    fieldnames = [
        "id", "category", "question", "ground_truth", "bot_answer",
        "api_status", "answer_relevancy", "answer_correctness",
    ]
    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)

    ok = [r for r in results if r["api_status"] == "ok" and r["answer_relevancy"] != ""]
    categories = dict.fromkeys(item["category"] for item in QUESTIONS)

    print("\n" + "=" * 75)
    print(f"{'Kategori':<25} {'N':>3}  {'Relevancy':>10}  {'Correctness':>12}")
    print("-" * 75)

    all_rel, all_cor = [], []
    for cat in categories:
        cat_items = [r for r in ok if r["category"] == cat]
        if not cat_items:
            continue
        rel = [r["answer_relevancy"]   for r in cat_items]
        cor = [r["answer_correctness"] for r in cat_items]
        all_rel.extend(rel); all_cor.extend(cor)
        print(f"{cat:<25} {len(cat_items):>3}  "
              f"{statistics.mean(rel):>10.4f}  {statistics.mean(cor):>12.4f}")

    print("-" * 75)
    if all_rel:
        print(f"{'TOTAL / RATA-RATA':<25} {len(all_rel):>3}  "
              f"{statistics.mean(all_rel):>10.4f}  {statistics.mean(all_cor):>12.4f}")

    print(f"\nHasil disimpan di: {os.path.abspath(OUTPUT)}")
    err = sum(1 for r in results if r["api_status"] != "ok")
    if err:
        print(f"  ⚠  {err} request gagal (cek kolom api_status)")


# ---------------------------------------------------------------------------
def run():
    collected = collect_answers()
    evaluated = evaluate_ragas(collected)
    save_and_summarize(evaluated)


if __name__ == "__main__":
    run()
