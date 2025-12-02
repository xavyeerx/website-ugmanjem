"use client";

import { WHATSAPP_ADMIN_URL } from "@/lib/constants";

export function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_ADMIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat via WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/30 active:scale-95 md:h-16 md:w-16"
    >
      {/* WhatsApp Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="h-8 w-8 fill-white md:h-9 md:w-9"
      >
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.962A15.91 15.91 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.32 22.598c-.39 1.1-1.932 2.014-3.18 2.28-.856.182-1.974.326-5.74-1.234-4.818-1.994-7.92-6.898-8.16-7.218-.232-.32-1.948-2.596-1.948-4.952s1.234-3.51 1.672-3.992c.39-.43 1.028-.634 1.64-.634.198 0 .376.01.536.018.438.02.658.046.948.734.362.856 1.244 3.032 1.352 3.252.11.22.22.518.072.818-.14.308-.264.446-.484.698-.22.252-.43.446-.65.718-.2.238-.426.492-.182.93.244.43 1.086 1.792 2.332 2.904 1.602 1.43 2.912 1.888 3.386 2.084.34.14.744.108.996-.164.318-.344.712-.914 1.112-1.476.286-.4.646-.45 1.02-.306.38.136 2.402 1.132 2.814 1.338.412.206.686.31.786.478.098.168.098.966-.292 2.066z" />
      </svg>

      {/* Pulse Animation Ring */}
      <span className="absolute -z-10 h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
    </a>
  );
}
