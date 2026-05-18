import asyncio
import time
import logging

import httpx
import chromadb

from app.metrics import (
    RETRIEVAL_LATENCY,
    RETRIEVAL_CHUNKS,
    RETRIEVAL_DISTANCE,
    RETRIEVAL_ERRORS,
)

# Error cause labels (matches chatbot_retrieval_errors_total label schema)
_ERR_EMBED_TIMEOUT  = "openai_timeout"
_ERR_EMBED_LIMIT    = "openai_rate_limit"
_ERR_CHROMADB       = "chromadb_error"
_ERR_UNKNOWN        = "unknown"

logger = logging.getLogger(__name__)

OPENAI_EMBED_URL = "https://api.openai.com/v1/embeddings"
EMBED_TIMEOUT = httpx.Timeout(connect=10.0, read=30.0, write=10.0, pool=10.0)


class KnowledgeRetriever:
    def __init__(
        self,
        db_path: str,
        collection_name: str,
        api_key: str,
        embedding_model: str = "text-embedding-3-small",
    ):
        self.api_key = api_key
        self.embedding_model = embedding_model
        self._client = httpx.AsyncClient(
            timeout=EMBED_TIMEOUT,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )

        self.db_client = chromadb.PersistentClient(path=db_path)
        self.collection = self.db_client.get_collection(
            collection_name,
            embedding_function=None,
        )
        logger.info(
            f"KnowledgeRetriever ready — {self.collection.count()} chunks, "
            f"embedding model: {embedding_model}"
        )

    def count(self) -> int:
        return self.collection.count()

    async def _get_embedding(self, text: str) -> list[float]:
        """Get embedding vector from OpenAI (async, non-blocking)."""
        response = await self._client.post(
            OPENAI_EMBED_URL,
            json={
                "model": self.embedding_model,
                "input": text,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["data"][0]["embedding"]

    async def search(self, query: str, n_results: int = 5) -> list[dict]:
        start = time.perf_counter()
        try:
            query_embedding = await self._get_embedding(query)

            # ChromaDB adalah library synchronous — jalankan di thread pool
            # agar tidak memblokir event loop FastAPI saat concurrent requests.
            results = await asyncio.to_thread(
                self.collection.query,
                query_embeddings=[query_embedding],
                n_results=n_results,
                include=["documents", "metadatas", "distances"],
            )

            chunks = []
            if results and results["ids"] and results["ids"][0]:
                for i in range(len(results["ids"][0])):
                    dist = results["distances"][0][i] if results["distances"] else 0
                    RETRIEVAL_DISTANCE.observe(dist)
                    chunks.append({
                        "content": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i] or {},
                        "distance": dist,
                    })

            RETRIEVAL_CHUNKS.observe(len(chunks))
            return chunks
        except httpx.TimeoutException:
            RETRIEVAL_ERRORS.labels(cause=_ERR_EMBED_TIMEOUT).inc()
            raise
        except httpx.HTTPStatusError as e:
            cause = _ERR_EMBED_LIMIT if e.response.status_code == 429 else _ERR_UNKNOWN
            RETRIEVAL_ERRORS.labels(cause=cause).inc()
            raise
        except chromadb.errors.ChromaError:
            RETRIEVAL_ERRORS.labels(cause=_ERR_CHROMADB).inc()
            raise
        except Exception:
            RETRIEVAL_ERRORS.labels(cause=_ERR_UNKNOWN).inc()
            raise
        finally:
            RETRIEVAL_LATENCY.observe(time.perf_counter() - start)

    async def aclose(self):
        await self._client.aclose()
