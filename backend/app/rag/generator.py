import time
import logging

import google.generativeai as genai
from app.rag.prompts import SYSTEM_PROMPT

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
        max_retries: int = 2,
    ) -> str:
        context = "\n\n".join(
            f"[{c['metadata'].get('source', '')} | {c['metadata'].get('section', '')}]\n{c['content']}"
            for c in context_chunks
        )

        contents = []
        for msg in (history or [])[-6:]:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [msg["content"]]})

        user_prompt = (
            "Berikut konteks yang relevan dari knowledge base UGM Anjem:\n\n"
            f"{context}\n\n"
            f"Pertanyaan pengguna: {query}"
        )
        contents.append({"role": "user", "parts": [user_prompt]})

        for attempt in range(max_retries + 1):
            try:
                response = self.model.generate_content(contents)
                return response.text
            except Exception as e:
                if ("RESOURCE_EXHAUSTED" in str(e) or "429" in str(e)) and attempt < max_retries:
                    wait = 5 * (attempt + 1)
                    logger.warning(f"Rate limited (attempt {attempt + 1}), retrying in {wait}s...")
                    time.sleep(wait)
                    continue
                raise
