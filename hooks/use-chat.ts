"use client";

import { useState, useCallback, useMemo } from "react";
import type { ChatMessage, RatingValue } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Halo Sobat Anjem! Saya asisten virtual UGM Anjem. Mau tanya soal tarif, layanan, cara order, atau info lainnya? Langsung aja tanya ya!",
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const history = messages
          .filter((m) => m.id !== "welcome")
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
            id: generateId(),
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
            id: generateId(),
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

  const submitRating = useCallback(
    async (messageId: string, question: string, answer: string, rating: RatingValue) => {
      // Kunci tombol rating di UI segera (optimistic update)
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, rating } : m)),
      );

      try {
        await fetch(`${API_URL}/api/rating`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, answer, rating }),
        });
      } catch {
        // Rating tetap terkunci di UI meskipun request gagal
      }
    },
    [],
  );

  const mustRate = useMemo(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant" && m.id !== "welcome");
    return lastAssistant !== undefined && lastAssistant.rating === undefined;
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([WELCOME]);
  }, []);

  return { messages, isLoading, mustRate, sendMessage, submitRating, clearMessages };
}
