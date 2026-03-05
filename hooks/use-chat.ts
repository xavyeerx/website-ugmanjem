"use client";

import { useState, useCallback } from "react";
import type { ChatMessage } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Halo Sobat Anjem! Saya asisten virtual UGM Anjem. Mau tanya soal tarif, layanan, cara order, atau info lainnya? Langsung aja tanya ya!",
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = { role: "user", content };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const history = messages
          .filter((m) => m !== WELCOME)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            conversation_history: history,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (res.status === 429) {
            throw new Error("Kuota API sedang habis, coba lagi dalam beberapa menit ya.");
          }
          throw new Error(err.detail || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            sources: data.sources,
          },
        ]);
      } catch (err) {
        const errorMessage =
          err instanceof Error && err.message
            ? err.message
            : "Maaf, saya sedang tidak bisa merespon. Pastikan backend sudah berjalan, atau coba lagi nanti ya!";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: errorMessage,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages],
  );

  const clearMessages = useCallback(() => {
    setMessages([WELCOME]);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
}
