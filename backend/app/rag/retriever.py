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

# Timeout for embedding request (should be fast)
EMBED_TIMEOUT = httpx.Timeout(connect=10.0, read=30.0, write=10.0, pool=10.0)


class KnowledgeRetriever:
    def __init__(
        self,
        db_path: str,
        collection_name: str,
        ollama_base_url: str = "http://localhost:11434",
        embedding_model: str = "nomic-embed-text",
    ):
        self.ollama_base_url = ollama_base_url.rstrip("/")
        self.embedding_model = embedding_model
        self._client = httpx.Client(timeout=EMBED_TIMEOUT)

        self.db_client = chromadb.PersistentClient(path=db_path)
        self.collection = self.db_client.get_collection(collection_name)

        # Verify embedding model is available
        try:
            resp = self._client.get(f"{self.ollama_base_url}/api/tags")
            resp.raise_for_status()
            models = [m["name"] for m in resp.json().get("models", [])]
            if not any(embedding_model in m for m in models):
                logger.warning(
                    f"Embedding model '{embedding_model}' not found in Ollama. "
                    f"Available: {models}. Run: ollama pull {embedding_model}"
                )
            else:
                logger.info(f"Embedding model '{embedding_model}' ready")
        except Exception as e:
            logger.warning(f"Could not verify embedding model: {e}")

    def count(self) -> int:
        return self.collection.count()

    def _get_embedding(self, text: str) -> list[float]:
        """Get embedding vector from Ollama."""
        response = self._client.post(
            f"{self.ollama_base_url}/api/embed",
            json={
                "model": self.embedding_model,
                "input": text,
            },
        )
        response.raise_for_status()
        data = response.json()

        # Ollama /api/embed returns {"embeddings": [[...]]}
        embeddings = data.get("embeddings", [])
        if embeddings and len(embeddings) > 0:
            return embeddings[0]

        raise ValueError(f"No embedding returned from Ollama: {data}")

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
