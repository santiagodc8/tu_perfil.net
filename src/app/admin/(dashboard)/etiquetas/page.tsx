"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import { generateSlug } from "@/lib/utils";
import type { Tag } from "@/types";

export default function EtiquetasPage() {
  const supabase = createClient();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function fetchTags() {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .order("name", { ascending: true });
    setTags(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    if (editingId) {
      await supabase
        .from("tags")
        .update({ name: name.trim(), slug: generateSlug(name) })
        .eq("id", editingId);
    } else {
      await supabase
        .from("tags")
        .insert({ name: name.trim(), slug: generateSlug(name) });
    }

    setName("");
    setEditingId(null);
    setSaving(false);
    fetchTags();
  }

  function handleEdit(tag: Tag) {
    setName(tag.name);
    setEditingId(tag.id);
  }

  function handleCancelEdit() {
    setName("");
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta etiqueta? Se quitará de todas las noticias.")) return;
    await supabase.from("tags").delete().eq("id", id);
    fetchTags();
  }

  return (
    <div>
      <AdminHeader title="Etiquetas" />
      <div className="p-6 max-w-2xl space-y-6">
        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface-card rounded-xl border border-surface-border p-6"
        >
          <h3 className="font-semibold text-heading mb-4">
            {editingId ? "Editar etiqueta" : "Nueva etiqueta"}
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
                placeholder="Ej: elecciones"
                required
                className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              {name.trim() && (
                <p className="text-xs text-muted mt-1">
                  Slug: <span className="font-mono">{generateSlug(name)}</span>
                </p>
              )}
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
          ) : tags.length === 0 ? (
            <div className="p-6 text-center text-muted">
              No hay etiquetas. Crea la primera arriba.
            </div>
          ) : (
            <ul className="divide-y divide-surface-border">
              {tags.map((tag) => (
                <li
                  key={tag.id}
                  className="px-6 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-heading">
                      {tag.name}
                    </span>
                    <span className="text-xs text-muted font-mono">
                      /{tag.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="text-sm text-muted hover:text-primary transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
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
