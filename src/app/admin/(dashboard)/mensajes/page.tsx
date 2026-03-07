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
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Cargando...</div>
          ) : messages.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No hay mensajes todavía.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div
                    onClick={() => handleSelect(msg)}
                    className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition flex items-start justify-between gap-4 ${
                      selected?.id === msg.id ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!msg.read && (
                          <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {msg.name}
                        </span>
                        <span className="text-xs text-gray-400">{msg.email}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {msg.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {formatDateShort(msg.created_at)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(msg.id);
                        }}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {selected?.id === msg.id && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-3">
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
