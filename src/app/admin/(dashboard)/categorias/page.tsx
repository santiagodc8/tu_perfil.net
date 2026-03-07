"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import type { Category } from "@/types";

export default function CategoriasPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#1a1a2e");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function fetchCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });
    setCategories(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    if (editingId) {
      await supabase
        .from("categories")
        .update({ name: name.trim(), slug: generateSlug(name), color })
        .eq("id", editingId);
    } else {
      await supabase
        .from("categories")
        .insert({ name: name.trim(), slug: generateSlug(name), color });
    }

    setName("");
    setColor("#1a1a2e");
    setEditingId(null);
    setSaving(false);
    fetchCategories();
  }

  function handleEdit(cat: Category) {
    setName(cat.name);
    setColor(cat.color);
    setEditingId(cat.id);
  }

  function handleCancelEdit() {
    setName("");
    setColor("#1a1a2e");
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;
    await supabase.from("categories").delete().eq("id", id);
    fetchCategories();
  }

  return (
    <div>
      <AdminHeader title="Categorías" />
      <div className="p-6 max-w-2xl space-y-6">
        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface-card rounded-xl border border-surface-border p-6"
        >
          <h3 className="font-semibold text-heading mb-4">
            {editingId ? "Editar categoría" : "Nueva categoría"}
          </h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-body mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Perfil Político"
                required
                className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-[42px] border border-surface-border rounded-lg cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {saving ? "..." : editingId ? "Guardar" : "Crear"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 text-muted hover:text-body transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Listado */}
        <div className="bg-surface-card rounded-xl border border-surface-border">
          {loading ? (
            <div className="p-6 text-center text-muted">Cargando...</div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-muted">
              No hay categorías. Crea la primera arriba.
            </div>
          ) : (
            <ul className="divide-y divide-surface-border">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="px-6 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <span className="text-sm font-medium text-heading">
                        {cat.name}
                      </span>
                      <span className="text-xs text-muted ml-2">
                        /{cat.slug}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-sm text-muted hover:text-primary transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-sm text-muted hover:text-red-500 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
