import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Preloader from "@/components/preloader";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "UGM Anjem - Antar Jemput & Jastip Mahasiswa UGM",
  description:
    "Solusi mobilitas & jastipan terpercaya untuk mahasiswa UGM. Pesan antar jemput dan jastip dengan mudah hanya melalui satu chat.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
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
        <Analytics />
      </body>
    </html>
  );
}
