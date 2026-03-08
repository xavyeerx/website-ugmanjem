"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, Calculator } from "lucide-react";

type PricingItem = {
  id: number;
  key: string;
  value: number;
  label: string;
  description: string | null;
  unit: string;
  sort_order: number;
};

export default function AdminPricingPage() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const supabase = createClient();

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pricing_config")
      .select("*")
      .order("sort_order");
    if (error) {
      showToast("error", error.message);
    } else {
      setItems(data ?? []);
      const vals: Record<number, string> = {};
      data?.forEach((d) => {
        vals[d.id] = String(d.value);
      });
      setEditValues(vals);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (item: PricingItem) => {
    const newValue = parseFloat(editValues[item.id] ?? "0");
    if (isNaN(newValue) || newValue < 0) {
      showToast("error", "Nilai harus berupa angka positif");
      return;
    }

    setSavingId(item.id);
    const { error } = await supabase
      .from("pricing_config")
      .update({ value: newValue })
      .eq("id", item.id);

    if (error) {
      showToast("error", error.message);
    } else {
      showToast("success", `${item.label} berhasil diperbarui ke ${newValue}`);
      await fetchItems();
    }
    setSavingId(null);
  };

  const hasChanged = (item: PricingItem) => {
    return editValues[item.id] !== String(item.value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Konfigurasi Harga
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Atur parameter perhitungan estimasi harga yang ditampilkan di website.
          Perubahan akan langsung mempengaruhi kalkulator harga.
        </p>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-5 transition-colors ${
                  hasChanged(item)
                    ? "border-blue-300 shadow-md"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.label}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                    {item.unit}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      Rp
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={editValues[item.id] ?? ""}
                      onChange={(e) =>
                        setEditValues((v) => ({
                          ...v,
                          [item.id]: e.target.value,
                        }))
                      }
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => handleSave(item)}
                    disabled={!hasChanged(item) || savingId === item.id}
                    className="px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    {savingId === item.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Saat ini:{" "}
                  <span className="font-medium">
                    Rp {Number(item.value).toLocaleString("id-ID")}
                  </span>
                </p>
              </div>
            ))}
          </div>

          {/* Formula Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Rumus Perhitungan
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 space-y-2">
              <p>
                <span className="text-blue-600">basePrice</span> = jarak_km ×{" "}
                <span className="font-bold">
                  {Number(
                    editValues[items.find((i) => i.key === "price_per_km")?.id ?? 0] ?? 2500
                  ).toLocaleString("id-ID")}
                </span>
              </p>
              <p>
                <span className="text-blue-600">basePrice</span> = max(
                basePrice,{" "}
                <span className="font-bold">
                  {Number(
                    editValues[items.find((i) => i.key === "minimum_price")?.id ?? 0] ?? 5000
                  ).toLocaleString("id-ID")}
                </span>
                )
              </p>
              <p>
                <span className="text-green-600">estimasi</span> = basePrice +
                biaya_jastip + biaya_hujan + biaya_malam
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Setelah mengubah parameter, klik tombol{" "}
              <strong>&quot;Publish ke Website&quot;</strong> di sidebar untuk
              memperbarui website.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
