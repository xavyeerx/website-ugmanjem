"""
Prometheus metrics for UGM Anjem Chatbot QoS monitoring.

Metrics are organized by RAG pipeline stage:
  1. HTTP request level (middleware)
  2. Retrieval (ChromaDB search)
  3. Live context (Supabase fetch)
  4. Generation (Gemini API)
"""

from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    Summary,
    Info,
)

# ---------------------------------------------------------------------------
# Histogram bucket definitions (in seconds)
# ---------------------------------------------------------------------------
LATENCY_BUCKETS = (0.1, 0.25, 0.5, 1.0, 2.0, 3.0, 5.0, 7.5, 10.0, 15.0, 20.0, 30.0)
RETRIEVAL_BUCKETS = (0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0)
GENERATION_BUCKETS = (0.5, 1.0, 2.0, 3.0, 5.0, 7.5, 10.0, 15.0, 20.0, 30.0, 45.0, 60.0)
LIVE_CTX_BUCKETS = (0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0)

# ---------------------------------------------------------------------------
# 1. HTTP / Request-level metrics
# ---------------------------------------------------------------------------
REQUEST_COUNT = Counter(
    "chatbot_http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
)

REQUEST_LATENCY = Histogram(
    "chatbot_http_request_duration_seconds",
    "HTTP request latency (end-to-end)",
    ["method", "endpoint"],
    buckets=LATENCY_BUCKETS,
)

IN_PROGRESS = Gauge(
    "chatbot_http_requests_in_progress",
    "Number of HTTP requests currently being processed",
    ["endpoint"],
)

# ---------------------------------------------------------------------------
# 2. Chat endpoint metrics (full pipeline)
# ---------------------------------------------------------------------------
CHAT_E2E_LATENCY = Histogram(
    "chatbot_chat_e2e_duration_seconds",
    "End-to-end chat processing time (retrieval + live_ctx + generation)",
    buckets=LATENCY_BUCKETS,
)

CHAT_REQUESTS_TOTAL = Counter(
    "chatbot_chat_requests_total",
    "Total chat requests",
    ["status"],  # success, error, rate_limited
)

# ---------------------------------------------------------------------------
# 3. Retrieval metrics (ChromaDB)
# ---------------------------------------------------------------------------
RETRIEVAL_LATENCY = Histogram(
    "chatbot_retrieval_duration_seconds",
    "Time to embed query + search ChromaDB",
    buckets=RETRIEVAL_BUCKETS,
)

RETRIEVAL_CHUNKS = Histogram(
    "chatbot_retrieval_chunks_returned",
    "Number of chunks returned per query",
    buckets=(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
)

RETRIEVAL_DISTANCE = Summary(
    "chatbot_retrieval_distance",
    "ChromaDB distance score of retrieved chunks (lower = more relevant)",
)

RETRIEVAL_ERRORS = Counter(
    "chatbot_retrieval_errors_total",
    "Total retrieval errors",
)

# ---------------------------------------------------------------------------
# 4. Live context metrics (Supabase)
# ---------------------------------------------------------------------------
LIVE_CTX_LATENCY = Histogram(
    "chatbot_live_context_duration_seconds",
    "Time to fetch live context from Supabase",
    buckets=LIVE_CTX_BUCKETS,
)

LIVE_CTX_CACHE_HIT = Counter(
    "chatbot_live_context_cache_hits_total",
    "Live context cache hits",
)

LIVE_CTX_CACHE_MISS = Counter(
    "chatbot_live_context_cache_misses_total",
    "Live context cache misses (actual Supabase fetch)",
)

LIVE_CTX_ERRORS = Counter(
    "chatbot_live_context_errors_total",
    "Live context fetch errors",
)

# ---------------------------------------------------------------------------
# 5. Generation metrics (Gemini API)
# ---------------------------------------------------------------------------
GENERATION_LATENCY = Histogram(
    "chatbot_generation_duration_seconds",
    "Time for Gemini API to generate response",
    buckets=GENERATION_BUCKETS,
)

GENERATION_RETRIES = Counter(
    "chatbot_generation_retries_total",
    "Total Gemini API retry attempts",
)

GENERATION_ERRORS = Counter(
    "chatbot_generation_errors_total",
    "Total generation errors",
    ["error_type"],  # rate_limited, other
)

GENERATION_INPUT_CHARS = Summary(
    "chatbot_generation_input_chars",
    "Number of input characters sent to Gemini",
)

GENERATION_OUTPUT_CHARS = Summary(
    "chatbot_generation_output_chars",
    "Number of output characters received from Gemini",
)

# ---------------------------------------------------------------------------
# 6. System info
# ---------------------------------------------------------------------------
SYSTEM_INFO = Info(
    "chatbot_system",
    "System configuration info",
)
