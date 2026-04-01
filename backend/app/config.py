from pathlib import Path
from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    GOOGLE_API_KEY: str = ""
    VECTORSTORE_PATH: str = str(PROJECT_ROOT / "vectorstore" / "chroma_db")
    COLLECTION_NAME: str = "ugm_anjem_knowledge"
    GEMINI_MODEL: str = "gemini-2.0-flash"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""

    # Extra CORS origins (comma-separated), e.g. from Railway env var
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

