"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import { formatDateShort } from "@/lib/utils";
import type { Contact } from "@/types";

export default function MensajesPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);

  async function fetchMessages() {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelect(msg: Contact) {
    setSelected(msg);
    if (!msg.read) {
      await supabase.from("contacts").update({ read: true }).eq("id", msg.id);
      fetchMessages();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este mensaje?")) return;
    await supabase.from("contacts").delete().eq("id", id);
    if (selected?.id === id) setSelected(null);
    fetchMessages();
  }

  return (
    <div>
      <AdminHeader title="Mensajes de contacto" />
      <div className="p-4 md:p-6">
        <div className="bg-surface-card rounded-xl border border-surface-border">
          {loading ? (
            <div className="p-6 text-center text-muted">Cargando...</div>
          ) : messages.length === 0 ? (
            <div className="p-6 text-center text-muted">
              No hay mensajes todavía.
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div
                    onClick={() => handleSelect(msg)}
                    className={`px-6 py-4 cursor-pointer hover:bg-surface transition flex items-start justify-between gap-4 ${
                      selected?.id === msg.id ? "bg-surface" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!msg.read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-heading">
                          {msg.name}
                        </span>
                        <span className="text-xs text-muted">{msg.email}</span>
                      </div>
                      <p className="text-sm text-muted mt-1 truncate">
                        {msg.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-muted">
                        {formatDateShort(msg.created_at)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(msg.id);
                        }}
                        className="text-xs text-muted hover:text-red-500"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {selected?.id === msg.id && (
                    <div className="px-6 py-4 bg-surface border-t border-surface-border">
                      <p className="text-sm text-body whitespace-pre-wrap">
                        {msg.message}
                      </p>
                      <p className="text-xs text-muted mt-3">
                        De: {msg.name} ({msg.email})
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
