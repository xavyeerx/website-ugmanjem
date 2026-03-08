import { createClient } from "@/lib/supabase/server";
import {
  Truck,
  Star,
  BarChart3,
  Image,
  Users,
} from "lucide-react";
import Link from "next/link";

async function getCounts() {
  const supabase = await createClient();

  const [services, reviews, stats, pricelist] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase.from("stats").select("id", { count: "exact", head: true }),
    supabase.from("pricelist").select("id", { count: "exact", head: true }),
  ]);

  return {
    services: services.count ?? 0,
    reviews: reviews.count ?? 0,
    stats: stats.count ?? 0,
    pricelist: pricelist.count ?? 0,
  };
}

export default async function AdminDashboard() {
  let counts = { services: 0, reviews: 0, stats: 0, pricelist: 0 };

  try {
    counts = await getCounts();
  } catch {
    // Supabase not configured yet, show zeros
  }

  const cards = [
    {
      label: "Layanan",
      count: counts.services,
      icon: Truck,
      href: "/admin/services",
      color: "bg-blue-500",
    },
    {
      label: "Reviews",
      count: counts.reviews,
      icon: Star,
      href: "/admin/reviews",
      color: "bg-yellow-500",
    },
    {
      label: "Statistik",
      count: counts.stats,
      icon: BarChart3,
      href: "/admin/stats",
      color: "bg-green-500",
    },
    {
      label: "Pricelist",
      count: counts.pricelist,
      icon: Image,
      href: "/admin/pricelist",
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola semua konten website UGM Anjem dari sini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`${card.color} p-2.5 rounded-lg text-white`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {card.count}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">{card.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link
            href="/admin/stats"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Update Jumlah Driver
            </span>
          </Link>
          <Link
            href="/admin/reviews"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Star className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">
              Tambah Review Baru
            </span>
          </Link>
          <Link
            href="/admin/contact"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              Update Contact Info
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
