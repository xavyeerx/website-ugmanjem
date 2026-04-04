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
        self._client = httpx.Client(
            timeout=EMBED_TIMEOUT,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )

        self.db_client = chromadb.PersistentClient(path=db_path)
        self.collection = self.db_client.get_collection(collection_name)
        logger.info(
            f"KnowledgeRetriever ready — {self.collection.count()} chunks, "
            f"embedding model: {embedding_model}"
        )

    def count(self) -> int:
        return self.collection.count()

    def _get_embedding(self, text: str) -> list[float]:
        """Get embedding vector from OpenAI."""
        response = self._client.post(
            OPENAI_EMBED_URL,
            json={
                "model": self.embedding_model,
                "input": text,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["data"][0]["embedding"]

    def search(self, query: str, n_results: int = 5) -> list[dict]:
        start = time.perf_counter()
        try:
            query_embedding = self._get_embedding(query)

            results = self.collection.query(
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
        except Exception:
            RETRIEVAL_ERRORS.inc()
            raise
        finally:
            RETRIEVAL_LATENCY.observe(time.perf_counter() - start)

    def __del__(self):
        try:
            self._client.close()
        except Exception:
            pass
