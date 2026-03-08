"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Save, X, Plus, Trash2, Loader2 } from "lucide-react";

type Stat = {
  id: number;
  key: string;
  value: string;
  label: string;
  sort_order: number;
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStat, setNewStat] = useState({ key: "", value: "", label: "" });
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stats")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      setError(error.message);
      setStats([]);
    } else {
      setError(null);
      setStats(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const startEdit = (stat: Stat) => {
    setEditingId(stat.id);
    setEditValue(stat.value);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    setSavingId(editingId);
    const { error } = await supabase
      .from("stats")
      .update({ value: editValue })
      .eq("id", editingId);
    setSavingId(null);
    if (error) {
      setError(error.message);
    } else {
      setStats((prev) =>
        prev.map((s) =>
          s.id === editingId ? { ...s, value: editValue } : s
        )
      );
      setEditingId(null);
      setEditValue("");
      setSuccessId(editingId);
      setTimeout(() => setSuccessId(null), 2000);
    }
  };

  const handleAdd = async () => {
    if (!newStat.key.trim() || !newStat.value.trim() || !newStat.label.trim()) {
      setError("Key, value, dan label wajib diisi.");
      return;
    }
    setAdding(true);
    setError(null);
    const maxSort = stats.length ? Math.max(...stats.map((s) => s.sort_order)) : -1;
    const { error } = await supabase.from("stats").insert({
      key: newStat.key.trim(),
      value: newStat.value.trim(),
      label: newStat.label.trim(),
      sort_order: maxSort + 1,
    });
    setAdding(false);
    if (error) {
      setError(error.message);
    } else {
      setShowAddForm(false);
      setNewStat({ key: "", value: "", label: "" });
      fetchStats();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus stat ini?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("stats").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      setError(error.message);
    } else {
      setStats((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) cancelEdit();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold text-gray-900">Statistik</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Stat
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Stat Baru</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Key
              </label>
              <input
                type="text"
                value={newStat.key}
                onChange={(e) =>
                  setNewStat((p) => ({ ...p, key: e.target.value }))
                }
                placeholder="contoh: driver_active"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Label
              </label>
              <input
                type="text"
                value={newStat.label}
                onChange={(e) =>
                  setNewStat((p) => ({ ...p, label: e.target.value }))
                }
                placeholder="contoh: Driver Active"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Value
              </label>
              <input
                type="text"
                value={newStat.value}
                onChange={(e) =>
                  setNewStat((p) => ({ ...p, value: e.target.value }))
                }
                placeholder="contoh: 20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={adding}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewStat({ key: "", value: "", label: "" });
                setError(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`relative p-6 bg-white border rounded-xl shadow-sm transition-all ${
              successId === stat.id
                ? "border-green-400 ring-2 ring-green-200"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-sm font-medium text-gray-500">
                {stat.label}
              </span>
              <div className="flex items-center gap-1">
                {editingId !== stat.id ? (
                  <>
                    <button
                      onClick={() => startEdit(stat)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(stat.id)}
                      disabled={deletingId === stat.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingId === stat.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {editingId === stat.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-2.5 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={savingId === stat.id}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingId === stat.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Simpan
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={savingId === stat.id}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            )}

            {successId === stat.id && (
              <div className="absolute top-3 right-3 text-green-600 text-xs font-medium">
                Tersimpan
              </div>
            )}
          </div>
        ))}
      </div>

      {stats.length === 0 && !showAddForm && (
        <div className="p-12 text-center bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500">Belum ada stat.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah stat pertama
          </button>
        </div>
      )}
    </div>
  );
}
