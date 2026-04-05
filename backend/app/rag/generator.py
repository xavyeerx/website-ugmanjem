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

logger = logging.getLogger(__name__)

OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"
OPENAI_TIMEOUT = httpx.Timeout(connect=10.0, read=60.0, write=10.0, pool=10.0)


class AnswerGenerator:
    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model_name = model_name
        self._client = httpx.Client(
            timeout=OPENAI_TIMEOUT,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )

        # Verify API key is reachable
        try:
            resp = self._client.get("https://api.openai.com/v1/models")
            resp.raise_for_status()
            logger.info(f"OpenAI API connected — model '{model_name}' ready")
        except Exception as e:
            logger.warning(f"Could not verify OpenAI API key: {e}")

    def generate(
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

        # Define Tools
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
                response = self._client.post(
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
                    # Rate limited
                    wait = 5 * (attempt + 1)
                    logger.warning(f"OpenAI rate limited, retrying in {wait}s...")
                    GENERATION_RETRIES.inc()
                    time.sleep(wait)
                    continue

                response.raise_for_status()
                data = response.json()
                message_resp = data["choices"][0]["message"]
                
                # Cek jika LLM menggunakan Tool Calling
                if message_resp.get("tool_calls"):
                    tool_calls = message_resp["tool_calls"]
                    # Append respon assistant agar valid untuk role berantai
                    messages.append(message_resp)
                    
                    for tool_call in tool_calls:
                        if tool_call["function"]["name"] == "calculate_route_distance":
                            import json
                            args = json.loads(tool_call["function"]["arguments"])
                            
                            from app.rag.tools.map_calculator import calculate_route_distance
                            tool_result = calculate_route_distance(
                                args.get("pickup_location", ""),
                                args.get("dropoff_location", "")
                            )
                            
                            messages.append({
                                "role": "tool",
                                "tool_call_id": tool_call["id"],
                                "name": "calculate_route_distance",
                                "content": tool_result
                            })
                            
                    # Pemanggilan lapis kedua (Second Pass Inference)
                    response2 = self._client.post(
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
                    # Tidak memanggil Tool, langsung jawab lisan
                    answer = message_resp.get("content", "")

                GENERATION_LATENCY.observe(time.perf_counter() - start)
                GENERATION_OUTPUT_CHARS.observe(len(answer))
                return answer

            except httpx.TimeoutException:
                if attempt < max_retries:
                    GENERATION_RETRIES.inc()
                    wait = 3 * (attempt + 1)
                    logger.warning(f"OpenAI timeout (attempt {attempt + 1}), retrying in {wait}s...")
                    time.sleep(wait)
                    continue
                GENERATION_ERRORS.labels(error_type="timeout").inc()
                GENERATION_LATENCY.observe(time.perf_counter() - start)
                raise

            except Exception as e:
                if attempt < max_retries:
                    GENERATION_RETRIES.inc()
                    wait = 3 * (attempt + 1)
                    logger.warning(f"Generation error (attempt {attempt + 1}): {e}, retrying in {wait}s...")
                    time.sleep(wait)
                    continue
                GENERATION_ERRORS.labels(error_type="other").inc()
                GENERATION_LATENCY.observe(time.perf_counter() - start)
                raise

    def __del__(self):
        try:
            self._client.close()
        except Exception:
            pass
