import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - UGM Anjem",
  description: "Admin panel untuk mengelola konten website UGM Anjem",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
