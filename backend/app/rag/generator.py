import asyncio
import json
import time
import logging

import httpx
from app.rag.prompts import SYSTEM_PROMPT
from app.metrics import (
    GENERATION_LATENCY,
    GENERATION_RETRIES,
    GENERATION_ERRORS,
    GENERATION_INPUT_CHARS,
    GENERATION_OUTPUT_CHARS,
)

# Error cause labels (matches chatbot_generation_errors_total label schema)
_ERR_RATE_LIMIT   = "openai_rate_limit"
_ERR_TIMEOUT      = "openai_timeout"
_ERR_API_ERROR    = "openai_api_error"
_ERR_UNKNOWN      = "unknown"

logger = logging.getLogger(__name__)

OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"
OPENAI_TIMEOUT = httpx.Timeout(connect=10.0, read=60.0, write=10.0, pool=10.0)


class AnswerGenerator:
    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model_name = model_name
        self._client = httpx.AsyncClient(
            timeout=OPENAI_TIMEOUT,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )

        # One-time sync check at startup only — tidak memblokir event loop
        # karena ini dijalankan saat inisialisasi, sebelum server menerima request.
        try:
            with httpx.Client(timeout=10.0) as sync_client:
                resp = sync_client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {api_key}"},
                )
                resp.raise_for_status()
            logger.info(f"OpenAI API connected — model '{model_name}' ready")
        except Exception as e:
            logger.warning(f"Could not verify OpenAI API key: {e}")

    async def generate(
        self,
        query: str,
        context_chunks: list[dict],
        history: list[dict] | None = None,
        live_context: str = "",
        max_retries: int = 2,
    ) -> str:
        rag_context = "\n\n".join(
            f"[{c['metadata'].get('source', '')} | {c['metadata'].get('section', '')}]\n{c['content']}"
            for c in context_chunks
        )

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        for msg in (history or [])[-6:]:
            role = "user" if msg["role"] == "user" else "assistant"
            messages.append({"role": role, "content": msg["content"]})

        prompt_parts = []
        if live_context:
            prompt_parts.append(
                "=== DATA LIVE (dari website, SELALU terbaru & utamakan) ===\n\n"
                f"{live_context}"
            )
        prompt_parts.append(
            "=== KNOWLEDGE BASE (FAQ, SOP, panduan detail) ===\n\n"
            f"{rag_context}"
        )
        prompt_parts.append(f"Pertanyaan pengguna: {query}")

        user_prompt = "\n\n".join(prompt_parts)
        messages.append({"role": "user", "content": user_prompt})

        total_input_chars = sum(len(m["content"]) for m in messages)
        GENERATION_INPUT_CHARS.observe(total_input_chars)

        tools = [
            {
                "type": "function",
                "function": {
                    "name": "calculate_route_distance",
                    "description": "Menghitung jarak lintasan berkendara yang sebenarnya di aspal antara dua buah lokasi spesifik (Origin ke Destination). WAJIB panggil fungsi ini jika pengguna bertanya soal jarak, kilometer, atau seberapa jauh antara dua tempat.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "pickup_location": {
                                "type": "string",
                                "description": "Nama lokasi penjemputan/awal (contoh: 'Fakultas Teknik', 'Tugu Jogja', 'Asrama Sendowo')"
                            },
                            "dropoff_location": {
                                "type": "string",
                                "description": "Nama lokasi pengantaran/tujuan (contoh: 'RSCM Jakarta', 'RS Sardjito')"
                            }
                        },
                        "required": ["pickup_location", "dropoff_location"]
                    }
                }
            }
        ]

        start = time.perf_counter()
        for attempt in range(max_retries + 1):
            try:
                response = await self._client.post(
                    OPENAI_CHAT_URL,
                    json={
                        "model": self.model_name,
                        "messages": messages,
                        "temperature": 0.7,
                        "max_tokens": 1024,
                        "tools": tools,
                        "tool_choice": "auto"
                    },
                )

                if response.status_code == 429:
                    wait = 5 * (attempt + 1)
                    logger.warning(f"OpenAI rate limited, retrying in {wait}s...")
                    GENERATION_RETRIES.labels(reason="rate_limit").inc()
                    if attempt == max_retries:
                        GENERATION_ERRORS.labels(cause=_ERR_RATE_LIMIT).inc()
                        GENERATION_LATENCY.observe(time.perf_counter() - start)
                        from httpx import HTTPStatusError
                        raise HTTPStatusError(
                            "OpenAI 429 rate limit exceeded after retries",
                            request=response.request,
                            response=response,
                        )
                    await asyncio.sleep(wait)
                    continue

                response.raise_for_status()
                data = response.json()
                message_resp = data["choices"][0]["message"]

                if message_resp.get("tool_calls"):
                    tool_calls = message_resp["tool_calls"]
                    messages.append(message_resp)

                    for tool_call in tool_calls:
                        if tool_call["function"]["name"] == "calculate_route_distance":
                            args = json.loads(tool_call["function"]["arguments"])

                            from app.rag.tools.map_calculator import calculate_route_distance
                            # Jalankan di thread pool agar tidak memblokir event loop
                            tool_result = await asyncio.to_thread(
                                calculate_route_distance,
                                args.get("pickup_location", ""),
                                args.get("dropoff_location", ""),
                            )

                            messages.append({
                                "role": "tool",
                                "tool_call_id": tool_call["id"],
                                "name": "calculate_route_distance",
                                "content": tool_result,
                            })

                    # Second pass inference setelah tool result
                    response2 = await self._client.post(
                        OPENAI_CHAT_URL,
                        json={
                            "model": self.model_name,
                            "messages": messages,
                            "temperature": 0.7,
                            "max_tokens": 1024,
                        },
                    )
                    response2.raise_for_status()
                    data2 = response2.json()
                    answer = data2["choices"][0]["message"]["content"]
                else:
                    answer = message_resp.get("content", "")

                GENERATION_LATENCY.observe(time.perf_counter() - start)
                GENERATION_OUTPUT_CHARS.observe(len(answer))
                return answer

            except httpx.TimeoutException:
                if attempt < max_retries:
                    GENERATION_RETRIES.labels(reason="timeout").inc()
                    wait = 3 * (attempt + 1)
                    logger.warning(f"OpenAI timeout (attempt {attempt + 1}), retrying in {wait}s...")
                    await asyncio.sleep(wait)
                    continue
                GENERATION_ERRORS.labels(cause=_ERR_TIMEOUT).inc()
                GENERATION_LATENCY.observe(time.perf_counter() - start)
                raise

            except Exception as e:
                cause = _ERR_API_ERROR if "httpx" in type(e).__module__ else _ERR_UNKNOWN
                if attempt < max_retries:
                    GENERATION_RETRIES.labels(reason="other").inc()
                    wait = 3 * (attempt + 1)
                    logger.warning(f"Generation error (attempt {attempt + 1}): {e}, retrying in {wait}s...")
                    await asyncio.sleep(wait)
                    continue
                GENERATION_ERRORS.labels(cause=cause).inc()
                GENERATION_LATENCY.observe(time.perf_counter() - start)
                raise

    async def aclose(self):
        await self._client.aclose()
