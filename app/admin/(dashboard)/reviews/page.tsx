"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Star,
} from "lucide-react";

type ReviewRow = {
  id: number;
  name: string;
  affiliation: string;
  review_text: string;
  rating: number;
  avatar_url: string;
  bg_image_url: string | null;
  is_visible: boolean;
  sort_order: number;
};

const defaultForm = {
  name: "",
  affiliation: "",
  review_text: "",
  rating: 5,
  avatar_url: "/images/pp-man.png",
  bg_image_url: "",
  is_visible: true,
  sort_order: 0,
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const supabase = createClient();

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("reviews")
      .select("*")
      .order("sort_order", { ascending: true });

    if (err) {
      setError(err.message);
      setReviews([]);
    } else {
      setReviews((data as ReviewRow[]) ?? []);
      setError("");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(defaultForm);
    setFormOpen(true);
    setError("");
  };

  const openEditForm = (r: ReviewRow) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      affiliation: r.affiliation,
      review_text: r.review_text,
      rating: r.rating,
      avatar_url: r.avatar_url || "/images/pp-man.png",
      bg_image_url: r.bg_image_url || "",
      is_visible: r.is_visible,
      sort_order: r.sort_order,
    });
    setFormOpen(true);
    setError("");
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(defaultForm);
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      affiliation: form.affiliation.trim(),
      review_text: form.review_text.trim(),
      rating: form.rating,
      avatar_url: form.avatar_url.trim() || "/images/pp-man.png",
      bg_image_url: form.bg_image_url.trim() || null,
      is_visible: form.is_visible,
      sort_order: form.sort_order,
    };

    if (editingId) {
      const { error: err } = await supabase
        .from("reviews")
        .update(payload)
        .eq("id", editingId);

      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from("reviews").insert(payload);

      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    }

    await fetchReviews();
    closeForm();
    setSaving(false);
  };

  const handleToggleVisibility = async (id: number) => {
    const r = reviews.find((x) => x.id === id);
    if (!r) return;
    setTogglingId(id);
    const { error: err } = await supabase
      .from("reviews")
      .update({ is_visible: !r.is_visible })
      .eq("id", id);
    setTogglingId(null);
    if (!err) await fetchReviews();
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm(null);
    const { error: err } = await supabase.from("reviews").delete().eq("id", id);
    if (!err) await fetchReviews();
  };

  const snippet = (text: string, maxLen = 80) =>
    text.length <= maxLen ? text : text.slice(0, maxLen) + "…";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola testimoni pelanggan UGM Anjem
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Review
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : error && !formOpen ? (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg border border-red-200">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {r.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{r.affiliation}</p>
                </div>
                <span
                  className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    r.is_visible
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {r.is_visible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                  {r.is_visible ? "Tampil" : "Sembunyi"}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {snippet(r.review_text)}
              </p>

              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i <= r.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVisibility(r.id)}
                  disabled={togglingId === r.id}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  title={r.is_visible ? "Sembunyikan" : "Tampilkan"}
                >
                  {togglingId === r.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : r.is_visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => openEditForm(r)}
                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {deleteConfirm === r.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
                    >
                      Ya
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(r.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Review" : "Tambah Review"}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Afiliasi
                </label>
                <input
                  type="text"
                  value={form.affiliation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, affiliation: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Contoh: Mahasiswa UGM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review
                </label>
                <textarea
                  value={form.review_text}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, review_text: e.target.value }))
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Teks testimoni..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, rating: i }))
                      }
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          i <= form.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <input
                  type="text"
                  value={form.avatar_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, avatar_url: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="/images/pp-man.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Image URL
                </label>
                <input
                  type="text"
                  value={form.bg_image_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bg_image_url: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="URL gambar background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urutan (sort_order)
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sort_order: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  min={0}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_visible}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_visible: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Tampilkan di website
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
