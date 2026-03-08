"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Truck,
  Star,
  BarChart3,
  Image,
  Phone,
  BookOpen,
  Sparkles,
  Calculator,
  LogOut,
  Menu,
  X,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Layanan", icon: Truck },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/stats", label: "Statistik", icon: BarChart3 },
  { href: "/admin/pricing", label: "Konfigurasi Harga", icon: Calculator },
  { href: "/admin/pricelist", label: "Pricelist", icon: Image },
  { href: "/admin/contact", label: "Contact & Social", icon: Phone },
  { href: "/admin/tutorial", label: "Tutorial", icon: BookOpen },
  { href: "/admin/features", label: "Features", icon: Sparkles },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  const handlePublish = async () => {
    setPublishing(true);
    setPublishMsg("");
    try {
      const res = await fetch("/api/revalidate-content", { method: "POST" });
      if (res.ok) {
        setPublishMsg("Website updated!");
        setTimeout(() => setPublishMsg(""), 3000);
      } else {
        setPublishMsg("Gagal update");
      }
    } catch {
      setPublishMsg("Error");
    } finally {
      setPublishing(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-bold text-gray-900">
            UGM Anjem
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 space-y-2">
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${publishing ? "animate-spin" : ""}`} />
            {publishing ? "Publishing..." : "Publish ke Website"}
          </button>
          {publishMsg && (
            <p className="text-xs text-center text-green-600 font-medium">
              {publishMsg}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 -ml-2"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Admin Panel</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Live
            </span>
          </div>
          <div className="ml-auto">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Lihat Website →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
