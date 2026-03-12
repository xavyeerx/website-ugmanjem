"""
Load testing for UGM Anjem Chatbot API using Locust.

Usage (from project root):
  pip install locust
  locust -f tests/locustfile.py --host http://10.33.109.173

Scenarios:
  1. Steady state   : 5 users,  spawn rate 1/s,  duration 5min
  2. Normal load    : 20 users, spawn rate 2/s,  duration 10min
  3. Stress test    : 50 users, spawn rate 5/s,  duration 10min
  4. Spike test     : 100 users, spawn rate 20/s, duration 5min
"""

import random
from locust import HttpUser, task, between, tag

SAMPLE_QUESTIONS = [
    "Apa itu UGM Anjem?",
    "Berapa harga antar jemput?",
    "Bagaimana cara order?",
    "Apakah ada layanan jastip?",
    "Siapa yang jadi driver UGM Anjem?",
    "Bagaimana cara daftar jadi driver?",
    "Berapa jumlah driver aktif?",
    "Apa saja layanan yang tersedia?",
    "Apakah bisa bayar pakai QRIS?",
    "Jam operasional UGM Anjem kapan?",
    "Bagaimana cara menghubungi admin?",
    "Berapa tarif minimum?",
    "Apakah ada biaya tambahan saat hujan?",
    "Bagaimana cara survei kost?",
    "Apa keunggulan UGM Anjem?",
    "Berapa jumlah order yang sudah selesai?",
    "Ada berapa WA group?",
    "Apa email UGM Anjem?",
    "Bagaimana SOP driver?",
    "Apa saja syarat menjadi driver?",
]


class ChatbotUser(HttpUser):
    """Simulates a user interacting with the chatbot."""

    wait_time = between(3, 10)

    @tag("chat")
    @task(10)
    def ask_question(self):
        """Send a chat question (most common action)."""
        question = random.choice(SAMPLE_QUESTIONS)
        self.client.post(
            "/api/chat",
            json={
                "message": question,
                "conversation_history": [],
            },
            name="/api/chat",
        )

    @tag("chat", "with_history")
    @task(3)
    def ask_followup(self):
        """Send a question with conversation history (follow-up)."""
        question = random.choice(SAMPLE_QUESTIONS)
        followup = random.choice(SAMPLE_QUESTIONS)
        self.client.post(
            "/api/chat",
            json={
                "message": followup,
                "conversation_history": [
                    {"role": "user", "content": question},
                    {"role": "assistant", "content": "Ini adalah jawaban dummy untuk testing."},
                ],
            },
            name="/api/chat [with history]",
        )

    @tag("health")
    @task(2)
    def check_health(self):
        """Check health endpoint (lightweight)."""
        self.client.get("/health", name="/health")
