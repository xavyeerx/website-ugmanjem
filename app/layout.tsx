import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Preloader from "@/components/preloader";
import { WhatsAppFloat } from "@/components/shared/whatsapp-float";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "UGM Anjem - Antar Jemput & Jastip Mahasiswa UGM",
  description:
    "Solusi mobilitas & jastipan terpercaya untuk mahasiswa UGM. Pesan antar jemput dan jastip dengan mudah hanya melalui satu chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistMono.variable} font-sans antialiased`}>
        <Preloader />
        {children}
        <WhatsAppFloat />
        <Analytics />
      </body>
    </html>
  );
}
