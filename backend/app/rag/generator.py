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

# Timeout: 120s for generation (CPU inference can be slow)
OLLAMA_TIMEOUT = httpx.Timeout(connect=10.0, read=120.0, write=10.0, pool=10.0)


class AnswerGenerator:
    def __init__(self, base_url: str = "http://localhost:11434", model_name: str = "qwen3:8b"):
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name
        self._client = httpx.Client(timeout=OLLAMA_TIMEOUT)

        # Verify Ollama is reachable
        try:
            resp = self._client.get(f"{self.base_url}/api/tags")
            resp.raise_for_status()
            models = [m["name"] for m in resp.json().get("models", [])]
            if not any(model_name in m for m in models):
                logger.warning(
                    f"Model '{model_name}' not found in Ollama. "
                    f"Available: {models}. Run: ollama pull {model_name}"
                )
            else:
                logger.info(f"Ollama connected — model '{model_name}' ready")
        except Exception as e:
            logger.warning(f"Could not connect to Ollama at {self.base_url}: {e}")

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

        # Build messages in OpenAI-compatible chat format
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

        start = time.perf_counter()
        for attempt in range(max_retries + 1):
            try:
                response = self._client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": self.model_name,
                        "messages": messages,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "top_p": 0.9,
                            "num_predict": 1024,
                        },
                    },
                )
                response.raise_for_status()

                data = response.json()
                answer = data.get("message", {}).get("content", "")

                # Qwen3 may wrap answers in <think>...</think> tags; strip them
                if "<think>" in answer:
                    import re
                    answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL).strip()

                GENERATION_LATENCY.observe(time.perf_counter() - start)
                GENERATION_OUTPUT_CHARS.observe(len(answer))
                return answer

            except httpx.TimeoutException:
                if attempt < max_retries:
                    GENERATION_RETRIES.inc()
                    wait = 3 * (attempt + 1)
                    logger.warning(f"Ollama timeout (attempt {attempt + 1}), retrying in {wait}s...")
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
