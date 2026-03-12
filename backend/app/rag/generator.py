import time
import logging

import google.generativeai as genai
from app.rag.prompts import SYSTEM_PROMPT
from app.metrics import (
    GENERATION_LATENCY,
    GENERATION_RETRIES,
    GENERATION_ERRORS,
    GENERATION_INPUT_CHARS,
    GENERATION_OUTPUT_CHARS,
)

logger = logging.getLogger(__name__)


class AnswerGenerator:
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        genai.configure(api_key=api_key)
        self.model_name = model_name
        self.model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=SYSTEM_PROMPT,
        )

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

        contents = []
        for msg in (history or [])[-6:]:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [msg["content"]]})

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
        contents.append({"role": "user", "parts": [user_prompt]})

        total_input_chars = sum(
            len(part) for msg in contents for part in msg.get("parts", []) if isinstance(part, str)
        )
        GENERATION_INPUT_CHARS.observe(total_input_chars)

        start = time.perf_counter()
        for attempt in range(max_retries + 1):
            try:
                response = self.model.generate_content(contents)
                GENERATION_LATENCY.observe(time.perf_counter() - start)
                GENERATION_OUTPUT_CHARS.observe(len(response.text))
                return response.text
            except Exception as e:
                if ("RESOURCE_EXHAUSTED" in str(e) or "429" in str(e)) and attempt < max_retries:
                    GENERATION_RETRIES.inc()
                    wait = 5 * (attempt + 1)
                    logger.warning(f"Rate limited (attempt {attempt + 1}), retrying in {wait}s...")
                    time.sleep(wait)
                    continue
                error_type = "rate_limited" if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e) else "other"
                GENERATION_ERRORS.labels(error_type=error_type).inc()
                GENERATION_LATENCY.observe(time.perf_counter() - start)
                raise
