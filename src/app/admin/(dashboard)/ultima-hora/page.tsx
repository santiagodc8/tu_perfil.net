"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";

export default function UltimaHoraPage() {
  const supabase = createClient();
  const [id, setId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("breaking_news")
        .select("*")
        .limit(1)
        .single();

      if (data) {
        setId(data.id);
        setText(data.text ?? "");
        setLink(data.link ?? "");
        setActive(data.active ?? false);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    setSaved(false);

    await supabase
      .from("breaking_news")
      .update({
        text: text.trim(),
        link: link.trim() || null,
        active,
      })
      .eq("id", id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleToggle() {
    if (!id) return;
    const newActive = !active;
    setActive(newActive);
    setSaving(true);

    await supabase
      .from("breaking_news")
      .update({ active: newActive })
      .eq("id", id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div>
        <AdminHeader title="Última Hora" />
        <div className="p-6 text-muted">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Última Hora" />
      <div className="p-6 max-w-2xl space-y-6">
        {/* Toggle grande */}
        <div
          className={`rounded-xl p-6 border-2 transition ${
            active
              ? "bg-red-50 border-red-300"
              : "bg-gray-50 border-surface-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-heading text-lg">
                {active ? "Banner ACTIVO" : "Banner inactivo"}
              </h3>
              <p className="text-sm text-muted mt-0.5">
                {active
                  ? "Se muestra en el sitio público ahora mismo"
                  : "No se muestra en el sitio"}
              </p>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-16 h-9 rounded-full transition ${
                active ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow transition-transform ${
                  active ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-surface-card rounded-xl border border-surface-border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-body mb-1">
              Texto del banner
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ej: Terremoto de magnitud 7.2 sacude la región"
              className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              maxLength={200}
            />
            <p className="text-xs text-muted mt-1">{text.length}/200 caracteres</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-1">
              Enlace (opcional)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Ej: /noticia/terremoto-region o dejar vacío"
              className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <p className="text-xs text-muted mt-1">
              Puede ser una ruta del sitio (/noticia/...) o dejarlo vacío
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="w-full bg-primary hover:bg-primary-hover active:bg-primary-dark text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          {saved && (
            <p className="text-green-600 text-sm text-center font-medium">
              Guardado correctamente
            </p>
          )}
        </div>

        {/* Preview */}
        {text.trim() && (
          <div>
            <h4 className="text-sm font-medium text-muted mb-2">Vista previa:</h4>
            <div className="bg-red-600 text-white rounded-lg overflow-hidden">
              <div className="py-2 px-4">
                <span className="flex items-center gap-2 justify-center text-center">
                  <span className="font-black text-xs uppercase tracking-wider bg-white text-red-600 px-2 py-0.5 rounded flex-shrink-0">
                    Última Hora
                  </span>
                  <span className="text-sm font-medium">{text}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
