"""
Load testing for UGM Anjem Chatbot API using Locust.

Usage (from project root):
  pip install locust
  locust -f tests/locustfile.py --host http://10.33.109.173

Scenarios (jalankan satu per satu secara headless):
  1. Light load  : 10  users, spawn rate 2/s,  duration 5min
     locust -f tests/locustfile.py --host http://10.33.109.173 \
            --users 10  --spawn-rate 2  --run-time 5m  --headless --csv results/locust_10
  2. Normal load : 25  users, spawn rate 5/s,  duration 5min
     locust -f tests/locustfile.py --host http://10.33.109.173 \
            --users 25  --spawn-rate 5  --run-time 5m  --headless --csv results/locust_25
  3. Stress test : 50  users, spawn rate 10/s, duration 5min
     locust -f tests/locustfile.py --host http://10.33.109.173 \
            --users 50  --spawn-rate 10 --run-time 5m  --headless --csv results/locust_50
  4. Spike test  : 100 users, spawn rate 20/s, duration 5min
     locust -f tests/locustfile.py --host http://10.33.109.173 \
            --users 100 --spawn-rate 20 --run-time 5m  --headless --csv results/locust_100
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

    # Chatbot memanggil OpenAI LLM yang bisa memakan waktu hingga 60 detik
    # Default timeout locust terlalu kecil — set 90 detik agar tidak false-fail
    def on_start(self):
        self.client.timeout = 90

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
            timeout=90,
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
            timeout=90,
        )

    # /health tidak diikutkan dalam load test karena server LLM yang sedang
    # memproses request bisa lambat merespons health check, menghasilkan
    # false positive pada failure rate yang mengaburkan data pengujian.
