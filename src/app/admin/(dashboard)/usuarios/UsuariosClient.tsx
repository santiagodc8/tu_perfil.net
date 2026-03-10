"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateShort } from "@/lib/utils";
import type { Profile, UserRole } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Editor",
};

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-primary/10 text-primary font-semibold",
  editor: "bg-gray-100 text-gray-600",
};

export default function UsuariosClient({
  initialProfiles,
}: {
  initialProfiles: Profile[];
}) {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Invite form state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("editor");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  async function handleRoleChange(profileId: string, newRole: UserRole) {
    setUpdatingId(profileId);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", profileId);

    if (!error) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
      );
    }
    setUpdatingId(null);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    setInviting(true);

    try {
      const res = await fetch("/api/admin/usuarios/invitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          full_name: inviteFullName.trim(),
          role: inviteRole,
          password: invitePassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error ?? "Error al crear el usuario.");
        setInviting(false);
        return;
      }

      setInviteSuccess(
        `Usuario ${inviteEmail} creado correctamente como ${ROLE_LABELS[inviteRole]}.`
      );
      setInviteEmail("");
      setInviteFullName("");
      setInvitePassword("");
      setInviteRole("editor");
      setShowInviteForm(false);

      // Refresh profiles list
      const { data: updated } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true })
        .returns<Profile[]>();
      setProfiles(updated ?? []);
    } catch {
      setInviteError("Error de conexión. Intentá de nuevo.");
    }

    setInviting(false);
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">

      {/* Success message */}
      {inviteSuccess && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <span className="text-green-500 font-bold flex-shrink-0">✓</span>
          <p className="text-green-700 text-sm">{inviteSuccess}</p>
        </div>
      )}

      {/* Invite form toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
          {profiles.length} usuario{profiles.length !== 1 ? "s" : ""} registrado{profiles.length !== 1 ? "s" : ""}
        </h3>
        <button
          onClick={() => {
            setShowInviteForm((v) => !v);
            setInviteError("");
            setInviteSuccess("");
          }}
          className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition"
        >
          {showInviteForm ? "Cancelar" : "+ Nuevo usuario"}
        </button>
      </div>

      {/* Invite form */}
      {showInviteForm && (
        <form
          onSubmit={handleInvite}
          className="bg-surface-card rounded-xl border border-surface-border p-6 space-y-4"
        >
          <h3 className="font-semibold text-heading">Crear nuevo usuario</h3>

          {inviteError && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
              {inviteError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={inviteFullName}
                onChange={(e) => setInviteFullName(e.target.value)}
                required
                placeholder="Ej: María García"
                className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Email
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                placeholder="usuario@email.com"
                className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Contraseña inicial
              </label>
              <input
                type="password"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              />
              <p className="text-xs text-muted mt-1">
                El usuario puede cambiarla después desde su cuenta.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Rol
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
              >
                <option value="editor">Editor — puede crear y editar noticias</option>
                <option value="admin">Admin — acceso completo</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={inviting}
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {inviting ? "Creando usuario..." : "Crear usuario"}
            </button>
            <button
              type="button"
              onClick={() => setShowInviteForm(false)}
              className="px-4 py-2.5 text-muted hover:text-body text-sm transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Users list */}
      <div className="bg-surface-card rounded-xl border border-surface-border">
        {profiles.length === 0 ? (
          <div className="p-6 text-center text-muted">
            No hay usuarios registrados.
          </div>
        ) : (
          <ul className="divide-y divide-surface-border">
            {profiles.map((profile) => (
              <li
                key={profile.id}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-heading">
                      {profile.full_name || "Sin nombre"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${ROLE_STYLES[profile.role]}`}
                    >
                      {ROLE_LABELS[profile.role]}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{profile.email}</p>
                  <p className="text-xs text-muted">
                    Registrado el {formatDateShort(profile.created_at)}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <select
                    value={profile.role}
                    disabled={updatingId === profile.id}
                    onChange={(e) =>
                      handleRoleChange(profile.id, e.target.value as UserRole)
                    }
                    className="text-sm border border-surface-border rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:opacity-50 cursor-pointer"
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Info box */}
      <div className="bg-surface rounded-xl border border-surface-border p-4">
        <p className="text-xs text-muted leading-relaxed">
          <strong className="text-body">Roles:</strong>{" "}
          <strong>Admin</strong> tiene acceso completo al panel (noticias, categorías, suscriptores, newsletter, usuarios).{" "}
          <strong>Editor</strong> puede crear y editar noticias, ver comentarios y estadísticas.
        </p>
      </div>
    </div>
  );
}
