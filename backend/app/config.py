from pathlib import Path
from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    # Ollama settings (replaces Google Gemini API)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen3:8b"
    OLLAMA_EMBEDDING_MODEL: str = "nomic-embed-text"

    VECTORSTORE_PATH: str = str(PROJECT_ROOT / "vectorstore" / "chroma_db")
    COLLECTION_NAME: str = "ugm_anjem_knowledge"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""

    # Extra CORS origins (comma-separated), e.g. from deploy env var
    EXTRA_CORS_ORIGINS: str = ""

    @property
    def CORS_ORIGINS(self) -> list[str]:
        origins = [
            "http://localhost:3000",
            "http://10.33.109.173",
            "http://10.33.109.173:80",
            "https://anjemugm.vercel.app",
        ]
        if self.EXTRA_CORS_ORIGINS:
            origins.extend(
                o.strip() for o in self.EXTRA_CORS_ORIGINS.split(",") if o.strip()
            )
        return origins

    class Config:
        env_file = ".env"


settings = Settings()
