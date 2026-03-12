"""
Fetch live dynamic data from Supabase for real-time RAG context.

Caches results to avoid hitting Supabase on every chat request.
Falls back gracefully if Supabase is unreachable.
"""

import time
import logging
from dataclasses import dataclass, field

from supabase import create_client, Client

from app.metrics import (
    LIVE_CTX_LATENCY,
    LIVE_CTX_CACHE_HIT,
    LIVE_CTX_CACHE_MISS,
    LIVE_CTX_ERRORS,
)

logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 300  # 5 minutes


@dataclass
class _Cache:
    text: str = ""
    fetched_at: float = 0.0


class LiveContext:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.client: Client = create_client(supabase_url, supabase_key)
        self._cache = _Cache()

    def _is_cache_fresh(self) -> bool:
        return (time.time() - self._cache.fetched_at) < CACHE_TTL_SECONDS

    def get_context(self) -> str:
        start = time.perf_counter()
        if self._is_cache_fresh():
            LIVE_CTX_CACHE_HIT.inc()
            LIVE_CTX_LATENCY.observe(time.perf_counter() - start)
            return self._cache.text

        LIVE_CTX_CACHE_MISS.inc()
        try:
            text = self._fetch_and_format()
            self._cache = _Cache(text=text, fetched_at=time.time())
            LIVE_CTX_LATENCY.observe(time.perf_counter() - start)
            return text
        except Exception as e:
            LIVE_CTX_ERRORS.inc()
            LIVE_CTX_LATENCY.observe(time.perf_counter() - start)
            logger.warning(f"Supabase fetch failed, using stale cache: {e}")
            return self._cache.text

    def _fetch_and_format(self) -> str:
        sections: list[str] = []

        stats = self._query("stats", order="sort_order")
        if stats:
            lines = ["Statistik UGM Anjem (data terkini dari website):"]
            for s in stats:
                lines.append(f"- {s['label']}: {s['value']}")
            sections.append("\n".join(lines))

        services = self._query("services", order="sort_order")
        if services:
            lines = ["Daftar layanan UGM Anjem (data terkini):"]
            for s in services:
                lines.append(
                    f"- {s['title']}: harga mulai {s['price']}, "
                    f"{s['trips']} trip selesai, rating {s['rating']}/5, "
                    f"kategori {s['category']}"
                )
            sections.append("\n".join(lines))

        pricing = self._query("pricing_config")
        if pricing:
            price_map = {r["key"]: r["value"] for r in pricing}
            lines = ["Konfigurasi harga UGM Anjem (data terkini):"]
            label_map = {
                "price_per_km": "Tarif per km (di luar pricelist)",
                "minimum_price": "Tarif minimum",
                "jastip_fee": "Fee tambahan jastip",
                "rainy_fee": "Fee tambahan hujan",
                "early_morning_fee": "Fee tambahan dini hari (>22:00)",
            }
            for key, label in label_map.items():
                if key in price_map:
                    lines.append(f"- {label}: Rp{price_map[key]}")
            sections.append("\n".join(lines))

        social = self._query("social_links", order="sort_order")
        if social:
            lines = ["Kontak & media sosial UGM Anjem (data terkini):"]
            lines.append("- Website: anjemugm.vercel.app")
            for s in social:
                name = s.get("name", s.get("platform", ""))
                url = s.get("url", "")
                if s.get("platform") == "email":
                    email_addr = url.split("to=")[-1] if "to=" in url else url
                    lines.append(f"- Email: {email_addr}")
                else:
                    lines.append(f"- {name}: {url}")
            sections.append("\n".join(lines))

        features = self._query("features", order="sort_order")
        if features:
            lines = ["Keunggulan UGM Anjem:"]
            for f in features:
                lines.append(f"- {f['title']}: {f['description']}")
            sections.append("\n".join(lines))

        reviews = self._query("reviews", order="sort_order", filters={"is_visible": True})
        if reviews:
            lines = ["Testimoni pengguna UGM Anjem:"]
            for r in reviews:
                lines.append(
                    f'- {r["name"]} ({r["affiliation"]}): "{r["review_text"]}"'
                )
            sections.append("\n".join(lines))

        return "\n\n".join(sections)

    def _query(
        self,
        table: str,
        order: str | None = None,
        filters: dict | None = None,
    ) -> list[dict]:
        try:
            q = self.client.table(table).select("*")
            if filters:
                for k, v in filters.items():
                    q = q.eq(k, v)
            if order:
                q = q.order(order)
            return q.execute().data or []
        except Exception as e:
            logger.warning(f"Failed to query {table}: {e}")
            return []
