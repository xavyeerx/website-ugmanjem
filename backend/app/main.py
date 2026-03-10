from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.chat import router as chat_router
from app.rag.retriever import KnowledgeRetriever
from app.rag.generator import AnswerGenerator
from app.rag.live_context import LiveContext


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app.state.retriever = KnowledgeRetriever(
            db_path=settings.VECTORSTORE_PATH,
            collection_name=settings.COLLECTION_NAME,
            api_key=settings.GOOGLE_API_KEY,
        )
        app.state.generator = AnswerGenerator(
            api_key=settings.GOOGLE_API_KEY,
            model_name=settings.GEMINI_MODEL,
        )
        print(f"RAG engine ready — {app.state.retriever.count()} chunks loaded")
    except Exception as e:
        print(f"WARNING: RAG engine failed to initialize: {e}")
        print("Make sure to run embed_knowledge.py first.")
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
        print("Live context disabled (no Supabase credentials)")
        app.state.live_context = None

    yield


app = FastAPI(
    title="UGM Anjem Chatbot API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "rag_ready": app.state.retriever is not None,
        "live_context": app.state.live_context is not None,
    }
