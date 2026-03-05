from pathlib import Path
from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    GOOGLE_API_KEY: str = ""
    VECTORSTORE_PATH: str = str(PROJECT_ROOT / "vectorstore" / "chroma_db")
    COLLECTION_NAME: str = "ugm_anjem_knowledge"
    GEMINI_MODEL: str = "gemini-2.5-flash"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://10.33.109.173",
        "http://10.33.109.173:80",
        "https://anjemugm.vercel.app",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
