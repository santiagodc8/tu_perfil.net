"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import ImageUpload from "@/components/admin/ImageUpload";
import type { Ad, AdPosition } from "@/types";

const POSITION_LABELS: Record<AdPosition, string> = {
  sidebar: "Barra lateral",
  header: "Banner superior",
  between_articles: "Entre secciones",
};

export default function PublicidadPage() {
  const supabase = createClient();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState<AdPosition>("sidebar");
  const [sortOrder, setSortOrder] = useState(0);

  async function fetchAds() {
    const { data } = await supabase
      .from("ads")
      .select("*")
      .order("position")
      .order("sort_order", { ascending: true });
    setAds(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setTitle("");
    setImageUrl("");
    setLinkUrl("");
    setPosition("sidebar");
    setSortOrder(0);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !imageUrl) return;
    setSaving(true);

    const payload = {
      title: title.trim(),
      image_url: imageUrl,
      link_url: linkUrl.trim(),
      position,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      await supabase.from("ads").update(payload).eq("id", editingId);
    } else {
      await supabase.from("ads").insert(payload);
    }

    resetForm();
    setSaving(false);
    fetchAds();
  }

  function handleEdit(ad: Ad) {
    setTitle(ad.title);
    setImageUrl(ad.image_url);
    setLinkUrl(ad.link_url);
    setPosition(ad.position);
    setSortOrder(ad.sort_order);
    setEditingId(ad.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleToggleActive(ad: Ad) {
    await supabase
      .from("ads")
      .update({ active: !ad.active, updated_at: new Date().toISOString() })
      .eq("id", ad.id);
    fetchAds();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este anuncio?")) return;
    await supabase.from("ads").delete().eq("id", id);
    fetchAds();
  }

  return (
    <div>
      <AdminHeader title="Publicidad" />
      <div className="p-6 max-w-3xl space-y-6">
        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface-card rounded-xl border border-surface-border p-6 space-y-4"
        >
          <h3 className="font-semibold text-heading mb-2">
            {editingId ? "Editar anuncio" : "Nuevo anuncio"}
          </h3>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-body mb-1">
              Nombre (interno, no se muestra en el sitio)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Banner lateral - Farmacia López"
              required
              className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-body mb-1">
              Imagen del anuncio
            </label>
            <ImageUpload
              imageUrl={imageUrl || null}
              onUpload={(url) => setImageUrl(url)}
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-body mb-1">
              Link de destino (opcional)
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://ejemplo.com"
              className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <p className="text-xs text-muted mt-1">
              Si se deja vacío, el anuncio se muestra sin link
            </p>
          </div>

          {/* Posición + Orden */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Ubicación
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as AdPosition)}
                className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                {Object.entries(POSITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Orden
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <p className="text-xs text-muted mt-1">Menor = aparece primero</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || !imageUrl}
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear anuncio"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 text-muted hover:text-body transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Listado */}
        <div className="bg-surface-card rounded-xl border border-surface-border">
          <div className="px-6 py-4 border-b border-surface-border">
            <h3 className="font-semibold text-heading">
              Anuncios activos e inactivos
            </h3>
          </div>

          {loading ? (
            <div className="p-6 text-center text-muted">Cargando...</div>
          ) : ads.length === 0 ? (
            <div className="p-6 text-center text-muted">
              No hay anuncios. Crea el primero arriba.
            </div>
          ) : (
            <ul className="divide-y divide-surface-border">
              {ads.map((ad) => (
                <li key={ad.id} className="px-6 py-4">
                  <div className="flex gap-4 items-start">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={ad.image_url}
                        alt={ad.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-heading text-sm truncate">
                          {ad.title}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            ad.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {ad.active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span>{POSITION_LABELS[ad.position]}</span>
                        <span>·</span>
                        <span>Orden: {ad.sort_order}</span>
                        {ad.link_url && (
                          <>
                            <span>·</span>
                            <a
                              href={ad.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate max-w-[200px]"
                            >
                              {ad.link_url}
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleActive(ad)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                          ad.active
                            ? "border-gray-300 text-muted hover:bg-gray-50"
                            : "border-green-300 text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {ad.active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => handleEdit(ad)}
                        className="text-xs text-muted hover:text-primary transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="text-xs text-muted hover:text-red-500 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Guía rápida */}
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 space-y-2">
          <p className="font-semibold">Ubicaciones disponibles:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>
              <strong>Barra lateral</strong> — se muestra en la columna derecha del sitio
            </li>
            <li>
              <strong>Banner superior</strong> — aparece debajo de la cabecera, ancho completo
            </li>
            <li>
              <strong>Entre secciones</strong> — se intercala entre las categorías de noticias
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
