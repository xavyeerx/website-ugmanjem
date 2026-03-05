import logging

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

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


@router.post("/api/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, request: Request):
    retriever = request.app.state.retriever
    generator = request.app.state.generator

    if not retriever or not generator:
        raise HTTPException(
            status_code=503,
            detail="RAG engine belum siap. Jalankan embed_knowledge.py terlebih dahulu.",
        )

    try:
        chunks = retriever.search(body.message, n_results=5)
    except Exception as e:
        logger.error(f"Retriever error: {e}")
        raise HTTPException(status_code=502, detail="Gagal mengambil konteks dari knowledge base.")

    history = [{"role": m.role, "content": m.content} for m in body.conversation_history]

    try:
        answer = generator.generate(
            query=body.message,
            context_chunks=chunks,
            history=history,
        )
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Generator error: {error_msg}")
        if "RESOURCE_EXHAUSTED" in error_msg or "429" in error_msg:
            raise HTTPException(
                status_code=429,
                detail="Kuota API Gemini sedang habis. Silakan coba lagi dalam beberapa menit.",
            )
        raise HTTPException(status_code=502, detail="Gagal menghasilkan jawaban dari AI.")

    seen = set()
    sources = []
    for c in chunks:
        meta = c.get("metadata", {})
        key = (meta.get("source", ""), meta.get("section", ""))
        if key not in seen:
            seen.add(key)
            sources.append(SourceItem(
                source=meta.get("source", "unknown"),
                section=meta.get("section", ""),
            ))

    return ChatResponse(answer=answer, sources=sources)
