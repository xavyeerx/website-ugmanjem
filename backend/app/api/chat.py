import time
import logging

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from app.metrics import CHAT_E2E_LATENCY, CHAT_REQUESTS_TOTAL

logger = logging.getLogger(__name__)
router = APIRouter()


class MessageItem(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[MessageItem] = []


class SourceItem(BaseModel):
    source: str
    section: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceItem] = []


class EvalChatResponse(BaseModel):
    answer: str
    sources: list[SourceItem] = []
    retrieved_contexts: list[str] = []


def _build_sources(chunks: list[dict]) -> list[SourceItem]:
    seen: set[tuple[str, str]] = set()
    sources: list[SourceItem] = []
    for c in chunks:
        meta = c.get("metadata", {})
        key = (meta.get("source", ""), meta.get("section", ""))
        if key not in seen:
            seen.add(key)
            sources.append(SourceItem(
                source=meta.get("source", "unknown"),
                section=meta.get("section", ""),
            ))
    return sources


async def _run_rag(body: ChatRequest, request: Request) -> tuple[str, list[dict], str]:
    """Shared RAG pipeline. Returns (answer, chunks, live_ctx)."""
    retriever = request.app.state.retriever
    generator = request.app.state.generator

    if not retriever or not generator:
        CHAT_REQUESTS_TOTAL.labels(status="error").inc()
        raise HTTPException(
            status_code=503,
            detail="RAG engine belum siap. Pastikan Ollama running dan model sudah di-pull.",
        )

    try:
        chunks = retriever.search(body.message, n_results=5)
    except Exception as e:
        CHAT_REQUESTS_TOTAL.labels(status="error").inc()
        logger.error(f"Retriever error: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Gagal mengambil konteks dari knowledge base: {e}",
        )

    history = [{"role": m.role, "content": m.content} for m in body.conversation_history]

    live_ctx = ""
    live_context_provider = getattr(request.app.state, "live_context", None)
    if live_context_provider:
        try:
            live_ctx = live_context_provider.get_context()
        except Exception as e:
            logger.warning(f"Live context fetch failed: {e}")

    try:
        answer = generator.generate(
            query=body.message,
            context_chunks=chunks,
            history=history,
            live_context=live_ctx,
        )
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Generator error: {error_msg}")
        if "timeout" in error_msg.lower():
            CHAT_REQUESTS_TOTAL.labels(status="timeout").inc()
            raise HTTPException(
                status_code=504,
                detail="LLM inference timeout. Model mungkin sedang loading atau server sibuk.",
            )
        CHAT_REQUESTS_TOTAL.labels(status="error").inc()
        raise HTTPException(status_code=502, detail="Gagal menghasilkan jawaban dari AI.")

    return answer, chunks, live_ctx


@router.post("/api/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, request: Request):
    start = time.perf_counter()
    try:
        answer, chunks, _ = await _run_rag(body, request)
    except HTTPException:
        CHAT_E2E_LATENCY.observe(time.perf_counter() - start)
        raise
    CHAT_REQUESTS_TOTAL.labels(status="success").inc()
    CHAT_E2E_LATENCY.observe(time.perf_counter() - start)
    return ChatResponse(answer=answer, sources=_build_sources(chunks))


@router.post("/api/chat/eval", response_model=EvalChatResponse)
async def chat_eval(body: ChatRequest, request: Request):
    """Endpoint khusus evaluasi RAGAS.

    Identik dengan /api/chat, namun turut mengembalikan retrieved_contexts
    (teks tiap chunk yang diambil dari knowledge base) sehingga metrik
    faithfulness dan answer_relevancy dapat dihitung oleh RAGAS.
    Endpoint ini TIDAK dimaksudkan untuk digunakan oleh pengguna akhir.
    """
    start = time.perf_counter()
    try:
        answer, chunks, _ = await _run_rag(body, request)
    except HTTPException:
        CHAT_E2E_LATENCY.observe(time.perf_counter() - start)
        raise
    CHAT_REQUESTS_TOTAL.labels(status="success").inc()
    CHAT_E2E_LATENCY.observe(time.perf_counter() - start)
    retrieved_contexts = [c.get("content", "") for c in chunks]
    return EvalChatResponse(
        answer=answer,
        sources=_build_sources(chunks),
        retrieved_contexts=retrieved_contexts,
    )
