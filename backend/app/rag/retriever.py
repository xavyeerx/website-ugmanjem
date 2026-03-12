import time

import google.generativeai as genai
import chromadb

from app.metrics import (
    RETRIEVAL_LATENCY,
    RETRIEVAL_CHUNKS,
    RETRIEVAL_DISTANCE,
    RETRIEVAL_ERRORS,
)

EMBEDDING_MODEL = "models/gemini-embedding-001"


class KnowledgeRetriever:
    def __init__(self, db_path: str, collection_name: str, api_key: str):
        genai.configure(api_key=api_key)
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_collection(collection_name)

    def count(self) -> int:
        return self.collection.count()

    def search(self, query: str, n_results: int = 5) -> list[dict]:
        start = time.perf_counter()
        try:
            query_embedding = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=query,
                task_type="retrieval_query",
            )["embedding"]

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
