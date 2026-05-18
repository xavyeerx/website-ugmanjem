"""
Prometheus metrics for UGM Anjem Chatbot — Four Golden Signals framework.

Signals:
  1. LATENCY  — how long things take (per pipeline stage + end-to-end)
  2. TRAFFIC  — how much demand is on the system (RPS, total requests)
  3. ERRORS   — rate of failing requests (classified by cause & component)
  4. SATURATION — how "full" the system is (concurrency, CPU, memory)

Additional:
  5. USER SATISFACTION — subjective feedback (4-scale rating)
  6. SYSTEM INFO       — build metadata
"""

from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    Summary,
    Info,
)

# ---------------------------------------------------------------------------
# Shared constants
# ---------------------------------------------------------------------------

#: Maximum expected concurrent in-flight chat requests.
#: Used to compute saturation ratio (0–100 %). Tune per deployment.
MAX_CONCURRENT_REQUESTS: int = 10

# ---------------------------------------------------------------------------
# Histogram bucket definitions (in seconds)
# ---------------------------------------------------------------------------
LATENCY_BUCKETS    = (0.1, 0.25, 0.5, 1.0, 2.0, 3.0, 5.0, 7.5, 10.0, 15.0, 20.0, 30.0, 45.0, 60.0)
RETRIEVAL_BUCKETS  = (0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0)
GENERATION_BUCKETS = (1.0, 2.0, 3.0, 5.0, 7.5, 10.0, 15.0, 20.0, 30.0, 45.0, 60.0, 90.0, 120.0)
LIVE_CTX_BUCKETS   = (0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0)

# ===========================================================================
# SIGNAL 1 — LATENCY
# ===========================================================================

# End-to-end chat latency (client perspective: from POST /api/chat to response)
CHAT_E2E_LATENCY = Histogram(
    "chatbot_chat_e2e_duration_seconds",
    "End-to-end chat processing time (retrieval + live_ctx + generation)",
    buckets=LATENCY_BUCKETS,
)

# Generic HTTP request latency per endpoint & method
REQUEST_LATENCY = Histogram(
    "chatbot_http_request_duration_seconds",
    "HTTP request latency (end-to-end, all endpoints)",
    ["method", "endpoint"],
    buckets=LATENCY_BUCKETS,
)

# RAG pipeline stage latencies
RETRIEVAL_LATENCY = Histogram(
    "chatbot_retrieval_duration_seconds",
    "Time to embed query (OpenAI text-embedding-3-small) and search ChromaDB",
    buckets=RETRIEVAL_BUCKETS,
)

LIVE_CTX_LATENCY = Histogram(
    "chatbot_live_context_duration_seconds",
    "Time to fetch live context from Supabase (includes cache-hit path)",
    buckets=LIVE_CTX_BUCKETS,
)

GENERATION_LATENCY = Histogram(
    "chatbot_generation_duration_seconds",
    "Time for OpenAI GPT-4o-mini to generate a response (all attempts combined)",
    buckets=GENERATION_BUCKETS,
)

# ===========================================================================
# SIGNAL 2 — TRAFFIC
# ===========================================================================

# Primary chat traffic counter (high-cardinality label: status)
CHAT_REQUESTS_TOTAL = Counter(
    "chatbot_chat_requests_total",
    "Total chat requests processed by the RAG pipeline",
    ["status"],  # success | error | timeout
)

# Generic HTTP traffic counter per endpoint
REQUEST_COUNT = Counter(
    "chatbot_http_requests_total",
    "Total HTTP requests received (all endpoints)",
    ["method", "endpoint", "status"],
)

# Retrieval quality signals (help characterise traffic patterns)
RETRIEVAL_CHUNKS = Histogram(
    "chatbot_retrieval_chunks_returned",
    "Number of knowledge-base chunks returned per query",
    buckets=(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
)

RETRIEVAL_DISTANCE = Summary(
    "chatbot_retrieval_distance",
    "ChromaDB cosine distance of retrieved chunks (lower = more relevant)",
)

GENERATION_INPUT_CHARS = Summary(
    "chatbot_generation_input_chars",
    "Total characters sent to the LLM (prompt size proxy for token usage)",
)

GENERATION_OUTPUT_CHARS = Summary(
    "chatbot_generation_output_chars",
    "Total characters received from the LLM (response size)",
)

# ===========================================================================
# SIGNAL 3 — ERRORS
# ===========================================================================

# Top-level HTTP errors (middleware level)
HTTP_ERRORS_TOTAL = Counter(
    "chatbot_http_errors_total",
    "Total HTTP requests that resulted in a 4xx/5xx response",
    ["method", "endpoint", "status_code"],
)

# Pipeline component errors — classified by cause
RETRIEVAL_ERRORS = Counter(
    "chatbot_retrieval_errors_total",
    "Errors during the retrieval stage (embedding or ChromaDB query)",
    ["cause"],  # openai_timeout | openai_rate_limit | chromadb_error | unknown
)

LIVE_CTX_ERRORS = Counter(
    "chatbot_live_context_errors_total",
    "Errors during the live context fetch from Supabase",
    ["cause"],  # supabase_timeout | supabase_unavailable | unknown
)

GENERATION_ERRORS = Counter(
    "chatbot_generation_errors_total",
    "Errors during the LLM generation stage",
    ["cause"],  # openai_timeout | openai_rate_limit | openai_api_error | unknown
)

GENERATION_RETRIES = Counter(
    "chatbot_generation_retries_total",
    "Total OpenAI API retry attempts (rate-limit or transient error)",
    ["reason"],  # rate_limit | timeout | other
)

# Live-context cache counters (informational — high miss rate = Supabase pressure)
LIVE_CTX_CACHE_HIT = Counter(
    "chatbot_live_context_cache_hits_total",
    "Live context cache hits (Supabase not queried)",
)

LIVE_CTX_CACHE_MISS = Counter(
    "chatbot_live_context_cache_misses_total",
    "Live context cache misses (actual Supabase fetch performed)",
)

# ===========================================================================
# SIGNAL 4 — SATURATION
# ===========================================================================

# Real-time concurrency gauge (raw count of in-flight chat requests)
IN_PROGRESS = Gauge(
    "chatbot_http_requests_in_progress",
    "Number of HTTP requests currently being processed",
    ["endpoint"],
)

# Derived saturation percentage (0–100 %) updated in middleware
SATURATION_RATIO = Gauge(
    "chatbot_saturation_ratio",
    "In-flight chat requests as a percentage of MAX_CONCURRENT_REQUESTS capacity (0–100)",
)

# ===========================================================================
# SIGNAL 5 — USER SATISFACTION (chatbot-specific, beyond standard 4GS)
# ===========================================================================

RATING_TOTAL = Counter(
    "chatbot_rating_total",
    "Total answer ratings submitted by users (4-scale categorical)",
    ["rating"],  # very_helpful | helpful | not_helpful | very_not_helpful
)

RATING_HELPFUL_RATIO = Gauge(
    "chatbot_rating_helpful_ratio",
    "Proportion of positive ratings (very_helpful + helpful) out of all submitted ratings",
)

RATING_AVG_SCORE = Gauge(
    "chatbot_rating_avg_score",
    "Weighted average satisfaction score (1 = Tidak Membantu … 4 = Sangat Membantu)",
)

# ===========================================================================
# SYSTEM INFO
# ===========================================================================

SYSTEM_INFO = Info(
    "chatbot_system",
    "Static system configuration metadata (LLM model, embedding model, etc.)",
)
