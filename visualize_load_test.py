"""
Visualisasi hasil load testing chatbot RAG UGM Anjem.

Sumber data:
  - results/locust_{10,25,50,100}_stats.csv  (baris "Aggregated")
    untuk P50/P95/P99, RPS, dan Error Rate.
  - Pipeline breakdown (Retrieval / Live Context / Generation) dan
    Saturasi (CPU / Memory) dimasukkan manual dari Grafana
    karena tidak direkam di CSV Locust.

Menghasilkan 5 PNG (300 dpi) di folder results/:
  1. latency_trend.png       — Grouped bar Latensi P50/P95/P99 + anotasi Error Rate
  2. pipeline_breakdown.png  — Pipeline Breakdown p95 (Retrieval / LiveCtx / Generation)
  3. traffic_rps.png         — Laju Permintaan (Traffic) antarskenario
  4. error_rate.png          — Error Rate antarskenario
  5. saturation.png          — CPU & Memory Usage antarskenario

Jalankan dari root proyek:
  python visualize_load_test.py
"""

from __future__ import annotations

import csv
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "results"
OUT_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Mapping skenario → file stats Locust
# ---------------------------------------------------------------------------
SCENARIOS: list[tuple[str, str]] = [
    ("Light Load (10)",  "locust_10_stats.csv"),
    ("Normal Load (25)", "locust_25_stats.csv"),
    ("Heavy Load (50)", "locust_50_stats.csv"),
    ("Very Heavy Load (100)", "locust_100_stats.csv"),
]


def _read_aggregated_row(csv_path: Path) -> dict[str, str]:
    """Ambil baris 'Aggregated' dari file stats Locust."""
    with csv_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("Name", "").strip() == "Aggregated":
                return row
    raise ValueError(f"Tidak ada baris 'Aggregated' di {csv_path}")


def load_locust_data() -> dict[str, list[float]]:
    """Ekstrak P50/P95/P99 (detik), RPS, dan Error Rate (%) dari CSV Locust."""
    out: dict[str, list[float]] = {
        "p50": [], "p95": [], "p99": [],
        "rps": [], "error_rate": [],
        "request_count": [], "failure_count": [],
    }
    for _label, fname in SCENARIOS:
        row = _read_aggregated_row(OUT_DIR / fname)
        req_count = float(row["Request Count"])
        fail_count = float(row["Failure Count"])
        out["p50"].append(float(row["50%"]) / 1000.0)
        out["p95"].append(float(row["95%"]) / 1000.0)
        out["p99"].append(float(row["99%"]) / 1000.0)
        out["rps"].append(float(row["Requests/s"]))
        out["error_rate"].append(
            (fail_count / req_count) * 100.0 if req_count > 0 else 0.0
        )
        out["request_count"].append(req_count)
        out["failure_count"].append(fail_count)
    return out


# Pipeline breakdown p95 (detik) — dibaca dari Grafana panel saat tiap skenario
RETRIEVAL = [0.894, 0.838, 0.799, 0.698]
LIVE_CONTEXT = [0.0095, 0.0095, 0.0095, 0.0095]
GENERATION = [6.28, 7.18, 17.3, 19.3]

# Saturation rata-rata (persen) — dibaca dari Grafana panel saat tiap skenario
CPU = [1.52, 1.35, 2.03, 1.30]
MEMORY = [8.43, 8.49, 8.61, 8.53]


# ---------------------------------------------------------------------------
# Konfigurasi gaya akademis
# ---------------------------------------------------------------------------
sns.set_theme(style="whitegrid", context="notebook")
plt.rcParams.update({
    "figure.facecolor": "white",
    "axes.facecolor": "white",
    "axes.edgecolor": "#333333",
    "axes.labelcolor": "#222222",
    "axes.titleweight": "bold",
    "axes.titlesize": 13,
    "axes.labelsize": 11,
    "xtick.color": "#222222",
    "ytick.color": "#222222",
    "font.family": "DejaVu Sans",
    "savefig.facecolor": "white",
})


def _annotate_bars(ax: plt.Axes, fmt: str = "{:.2f}", offset: float = 0.5) -> None:
    for patch in ax.patches:
        height = patch.get_height()
        if height == 0:
            continue
        x = patch.get_x() + patch.get_width() / 2
        ax.annotate(
            fmt.format(height),
            xy=(x, height),
            xytext=(0, offset),
            textcoords="offset points",
            ha="center",
            va="bottom",
            fontsize=9,
            color="#222222",
        )


# ---------------------------------------------------------------------------
# Grafik 1 — Latensi P50/P95/P99 (grouped bar) + Error Rate di sumbu X
# ---------------------------------------------------------------------------
def plot_latency_trend(skenario: list[str], data: dict[str, list[float]]) -> None:
    fig, ax = plt.subplots(figsize=(12, 6.5))
    x = np.arange(len(skenario))
    width = 0.26

    series = [
        ("P50 (Median)", data["p50"], "#2ecc71"),
        ("P95",          data["p95"], "#f39c12"),
        ("P99",          data["p99"], "#e74c3c"),
    ]
    for i, (label, values, color) in enumerate(series):
        offset = (i - 1) * width
        ax.bar(
            x + offset, values, width,
            label=label, color=color,
            edgecolor="#222222", linewidth=0.5,
        )

    _annotate_bars(ax, fmt="{:.1f}s", offset=2)

    ax.axhline(20, color="gray", linestyle="--", linewidth=1, alpha=0.6,
               label="SLO P95 < 20 s")

    # Label skenario + error rate agar narasi sidang mengaitkan latensi & kegagalan
    xlabels = [
        f"{name}\n(Error {err:.1f}%)"
        for name, err in zip(skenario, data["error_rate"])
    ]

    ax.set_title(
        "Perbandingan Latensi End-to-End Antarskenario Pengujian Beban",
        pad=12,
    )
    ax.set_xlabel("Skenario Pengujian")
    ax.set_ylabel("Latensi (detik)")
    ax.set_xticks(x)
    ax.set_xticklabels(xlabels, rotation=0, ha="center", fontsize=9)
    ymax = max(max(data["p99"]), 20) * 1.15
    ax.set_ylim(0, ymax)
    ax.legend(loc="upper left", frameon=True)

    fig.text(
        0.5, 0.01,
        "Catatan: P95 = ambang SLO (95% permintaan); pada beban tinggi P95 dan P99 dapat "
        "mendekati plafon tunggu (~31 s) karena antrean API eksternal dan HTTP 500 — "
        "bandingkan dengan grafik Error Rate.",
        ha="center", fontsize=8.5, color="#444444", style="italic",
    )

    plt.tight_layout(rect=[0, 0.04, 1, 1])
    out = OUT_DIR / "latency_trend.png"
    fig.savefig(out, dpi=300, bbox_inches="tight")
    plt.close(fig)
    print(f"Disimpan: {out}")


# ---------------------------------------------------------------------------
# Grafik 2 — Pipeline Breakdown p95
# ---------------------------------------------------------------------------
def plot_pipeline_breakdown(skenario: list[str]) -> None:
    fig, ax = plt.subplots(figsize=(11, 6))
    x = np.arange(len(skenario))
    width = 0.26

    stages = [
        ("Retrieval",        RETRIEVAL,    "#3498db"),
        ("Live Context",     LIVE_CONTEXT, "#1abc9c"),
        ("Generation (LLM)", GENERATION,   "#e67e22"),
    ]
    for i, (label, values, color) in enumerate(stages):
        offset = (i - 1) * width
        ax.bar(x + offset, values, width, label=label,
               color=color, edgecolor="#222222", linewidth=0.5)

    _annotate_bars(ax, fmt="{:.2f}s", offset=2)

    ax.set_title("Breakdown Latensi p95 per Tahap Pipeline RAG")
    ax.set_xlabel("Skenario Pengujian")
    ax.set_ylabel("Latensi p95 (detik)")
    ax.set_xticks(x)
    ax.set_xticklabels(skenario, rotation=10)
    ax.set_ylim(0, max(GENERATION) * 1.2)
    ax.legend(loc="upper left", frameon=True)

    plt.tight_layout()
    out = OUT_DIR / "pipeline_breakdown.png"
    fig.savefig(out, dpi=300, bbox_inches="tight")
    plt.close(fig)
    print(f"Disimpan: {out}")


# ---------------------------------------------------------------------------
# Grafik 3 — Laju Permintaan (Traffic / RPS)
# ---------------------------------------------------------------------------
def plot_traffic_rps(skenario: list[str], rps: list[float]) -> None:
    fig, ax = plt.subplots(figsize=(9, 5.5))
    x = np.arange(len(skenario))
    bars = ax.bar(x, rps, color="#2980b9", edgecolor="#1f4e6e",
                  linewidth=0.6, width=0.55)
    for bar, val in zip(bars, rps):
        ax.annotate(
            f"{val:.3f}",
            xy=(bar.get_x() + bar.get_width() / 2, val),
            xytext=(0, 4), textcoords="offset points",
            ha="center", fontsize=10, fontweight="bold", color="#1f4e6e",
        )

    ax.set_title("Laju Permintaan (Traffic) Antarskenario Pengujian Beban")
    ax.set_xlabel("Skenario Pengujian")
    ax.set_ylabel("Laju Permintaan (req/s)")
    ax.set_xticks(x)
    ax.set_xticklabels(skenario, rotation=10)
    ax.set_ylim(0, max(rps) * 1.25)

    plt.tight_layout()
    out = OUT_DIR / "traffic_rps.png"
    fig.savefig(out, dpi=300, bbox_inches="tight")
    plt.close(fig)
    print(f"Disimpan: {out}")


# ---------------------------------------------------------------------------
# Grafik 4 — Error Rate
# ---------------------------------------------------------------------------
def plot_error_rate(skenario: list[str], error_rate: list[float]) -> None:
    fig, ax = plt.subplots(figsize=(9, 5.5))
    x = np.arange(len(skenario))
    colors = [
        "#27ae60" if v < 5 else ("#f1c40f" if v < 10 else "#c0392b")
        for v in error_rate
    ]
    bars = ax.bar(x, error_rate, color=colors,
                  edgecolor="#222222", linewidth=0.6, width=0.55)
    for bar, val in zip(bars, error_rate):
        ax.annotate(
            f"{val:.2f}%",
            xy=(bar.get_x() + bar.get_width() / 2, val),
            xytext=(0, 4), textcoords="offset points",
            ha="center", fontsize=10, fontweight="bold", color="#222222",
        )

    ax.axhline(5, color="#c0392b", linestyle="--",
               linewidth=1, alpha=0.6, label="SLO < 5%")

    ax.set_title("Tingkat Kegagalan (Error Rate) Antarskenario")
    ax.set_xlabel("Skenario Pengujian")
    ax.set_ylabel("Error Rate (%)")
    ax.set_xticks(x)
    ax.set_xticklabels(skenario, rotation=10)
    ax.set_ylim(0, max(max(error_rate) * 1.25, 10))
    ax.legend(loc="upper left", frameon=True)

    plt.tight_layout()
    out = OUT_DIR / "error_rate.png"
    fig.savefig(out, dpi=300, bbox_inches="tight")
    plt.close(fig)
    print(f"Disimpan: {out}")


# ---------------------------------------------------------------------------
# Grafik 5 — Saturation (CPU & Memory)
# ---------------------------------------------------------------------------
def plot_saturation(skenario: list[str]) -> None:
    fig, ax = plt.subplots(figsize=(10, 5.5))
    x = np.arange(len(skenario))
    width = 0.36

    ax.bar(x - width / 2, CPU, width, label="CPU Usage",
           color="#8e44ad", edgecolor="#222222", linewidth=0.6)
    ax.bar(x + width / 2, MEMORY, width, label="Memory Usage",
           color="#16a085", edgecolor="#222222", linewidth=0.6)

    _annotate_bars(ax, fmt="{:.2f}%", offset=2)

    ax.set_title("Saturasi Sumber Daya Host (CPU dan Memory)")
    ax.set_xlabel("Skenario Pengujian")
    ax.set_ylabel("Penggunaan (%)")
    ax.set_xticks(x)
    ax.set_xticklabels(skenario, rotation=10)
    ax.set_ylim(0, max(MEMORY) * 1.4)
    ax.legend(loc="upper left", frameon=True)

    plt.tight_layout()
    out = OUT_DIR / "saturation.png"
    fig.savefig(out, dpi=300, bbox_inches="tight")
    plt.close(fig)
    print(f"Disimpan: {out}")


def print_summary(skenario: list[str], data: dict[str, list[float]]) -> None:
    print("\nRingkasan data dari CSV Locust (baris Aggregated):")
    hdr = (
        f"{'Skenario':<22} {'P50':>7} {'P95':>7} {'P99':>7} "
        f"{'RPS':>7} {'Err%':>7} {'Req':>5} {'Fail':>5}"
    )
    print(hdr)
    print("-" * len(hdr))
    for i, label in enumerate(skenario):
        p95, p99 = data["p95"][i], data["p99"][i]
        tail_note = "  (ekor datar)" if p99 > 0 and abs(p99 - p95) < 1.0 else ""
        print(
            f"{label:<22} "
            f"{data['p50'][i]:>6.1f}s "
            f"{p95:>6.1f}s "
            f"{p99:>6.1f}s "
            f"{data['rps'][i]:>7.3f} "
            f"{data['error_rate'][i]:>6.1f}% "
            f"{int(data['request_count'][i]):>5d} "
            f"{int(data['failure_count'][i]):>5d}"
            f"{tail_note}"
        )
    print(
        "\nNarasi sidang: median (P50) tetap rendah di Heavy Load, tetapi P95/P99 "
        "melampaui SLO; pada beban tinggi P95 hampir sama dengan P99 = ekor saturasi. "
        "Lihat Error Rate.\n"
    )


def main() -> None:
    skenario = [s[0] for s in SCENARIOS]
    data = load_locust_data()
    print_summary(skenario, data)
    plot_latency_trend(skenario, data)
    plot_pipeline_breakdown(skenario)
    plot_traffic_rps(skenario, data["rps"])
    plot_error_rate(skenario, data["error_rate"])
    plot_saturation(skenario)


if __name__ == "__main__":
    main()
