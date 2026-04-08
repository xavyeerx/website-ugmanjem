import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from app.config import settings
from app.api.chat import router as chat_router
from app.api.rating import router as rating_router
from app.rag.retriever import KnowledgeRetriever
from app.rag.generator import AnswerGenerator
from app.rag.live_context import LiveContext
from app.metrics import (
    REQUEST_COUNT,
    REQUEST_LATENCY,
    IN_PROGRESS,
    SYSTEM_INFO,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    SYSTEM_INFO.info({
        "llm_model": settings.OPENAI_MODEL,
        "embedding_model": settings.OPENAI_EMBEDDING_MODEL,
        "provider": "openai",
        "vectorstore_path": settings.VECTORSTORE_PATH,
        "collection_name": settings.COLLECTION_NAME,
        "supabase_enabled": str(bool(settings.SUPABASE_URL)),
    })

    try:
        app.state.retriever = KnowledgeRetriever(
            db_path=settings.VECTORSTORE_PATH,
            collection_name=settings.COLLECTION_NAME,
            api_key=settings.OPENAI_API_KEY,
            embedding_model=settings.OPENAI_EMBEDDING_MODEL,
        )
        app.state.generator = AnswerGenerator(
            api_key=settings.OPENAI_API_KEY,
            model_name=settings.OPENAI_MODEL,
        )
        print(f"RAG engine ready — {app.state.retriever.count()} chunks loaded")
        print(f"  LLM: {settings.OPENAI_MODEL} (OpenAI API)")
        print(f"  Embedding: {settings.OPENAI_EMBEDDING_MODEL}")
    except Exception as e:
        print(f"WARNING: RAG engine failed to initialize: {e}")
        app.state.retriever = None
        app.state.generator = None

    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        try:
            app.state.live_context = LiveContext(
                supabase_url=settings.SUPABASE_URL,
                supabase_key=settings.SUPABASE_ANON_KEY,
            )
            print("Live context (Supabase) connected")
        except Exception as e:
            print(f"WARNING: Supabase connection failed: {e}")
            app.state.live_context = None
    else:
        app.state.live_context = None

    yield


app = FastAPI(
    title="UGM Anjem Chatbot API",
    version="3.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    if request.url.path == "/metrics":
        return await call_next(request)

    endpoint = request.url.path
    method = request.method
    IN_PROGRESS.labels(endpoint=endpoint).inc()
    start = time.perf_counter()

    try:
        response = await call_next(request)
        REQUEST_COUNT.labels(
            method=method, endpoint=endpoint, status=response.status_code,
        ).inc()
        return response
    except Exception:
        REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=500).inc()
        raise
    finally:
        REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(
            time.perf_counter() - start
        )
        IN_PROGRESS.labels(endpoint=endpoint).dec()


app.include_router(chat_router)
app.include_router(rating_router)


@app.get("/metrics")
async def metrics():
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "rag_ready": app.state.retriever is not None,
        "live_context": app.state.live_context is not None,
        "llm_model": settings.OPENAI_MODEL,
        "embedding_model": settings.OPENAI_EMBEDDING_MODEL,
        "provider": "openai",
    }
