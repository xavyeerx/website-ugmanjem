"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, X, Save, Loader2 } from "lucide-react";

type TutorialStep = {
  id: number;
  step_number: number;
  title: string;
  description: string;
  link_text: string | null;
  link_url: string | null;
};

export default function TutorialAdminPage() {
  const [items, setItems] = useState<TutorialStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    step_number: 1,
    title: "",
    description: "",
    link_text: "",
    link_url: "",
  });

  const supabase = createClient();

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tutorial_steps")
      .select("*")
      .order("step_number");
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm({
      step_number: items.length + 1,
      title: "",
      description: "",
      link_text: "",
      link_url: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: TutorialStep) => {
    setForm({
      step_number: item.step_number,
      title: item.title,
      description: item.description,
      link_text: item.link_text ?? "",
      link_url: item.link_url ?? "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      step_number: form.step_number,
      title: form.title,
      description: form.description,
      link_text: form.link_text || null,
      link_url: form.link_url || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("tutorial_steps")
        .update(payload)
        .eq("id", editingId);
      if (error) setMessage({ type: "error", text: error.message });
      else {
        setMessage({ type: "success", text: "Berhasil diperbarui" });
        loadData();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("tutorial_steps").insert(payload);
      if (error) setMessage({ type: "error", text: error.message });
      else {
        setMessage({ type: "success", text: "Berhasil ditambahkan" });
        loadData();
        resetForm();
      }
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Tutorial Steps</h1>
        <button
          onClick={() => {
            resetForm();
            setForm({
              step_number: items.length + 1,
              title: "",
              description: "",
              link_text: "",
              link_url: "",
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Tambah
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editingId ? "Edit Tutorial Step" : "Tambah Tutorial Step"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Step Number</label>
              <input
                type="number"
                min={1}
                value={form.step_number}
                onChange={(e) =>
                  setForm({ ...form, step_number: parseInt(e.target.value) || 1 })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Link Text (opsional)
              </label>
              <input
                type="text"
                value={form.link_text}
                onChange={(e) => setForm({ ...form, link_text: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. klik disini"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Link URL (opsional)
              </label>
              <input
                type="url"
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                {item.step_number}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                {item.link_url && item.link_text && (
                  <a
                    href={item.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                  >
                    {item.link_text} →
                  </a>
                )}
              </div>
              <button
                onClick={() => handleEdit(item)}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
