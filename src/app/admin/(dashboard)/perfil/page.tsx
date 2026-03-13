"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";

export default function PerfilPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setRole(profile.role ?? "");
      }
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      setError("La contraseña actual es incorrecta.");
      setSaving(false);
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setMessage("Contraseña actualizada correctamente.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaving(false);
  }

  return (
    <div>
      <AdminHeader title="Mi perfil" />
      <div className="p-4 md:p-6 max-w-lg space-y-6">
        {/* Info del usuario */}
        <div className="bg-surface-card rounded-xl border border-surface-border p-5 space-y-3">
          <div>
            <span className="text-xs text-muted">Email</span>
            <p className="text-sm font-medium text-heading">{email}</p>
          </div>
          <div>
            <span className="text-xs text-muted">Nombre</span>
            <p className="text-sm font-medium text-heading">{fullName || "—"}</p>
          </div>
          <div>
            <span className="text-xs text-muted">Rol</span>
            <p className="text-sm font-medium text-heading capitalize">{role || "—"}</p>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <form
          onSubmit={handleChangePassword}
          className="bg-surface-card rounded-xl border border-surface-border p-5 space-y-4"
        >
          <h3 className="font-semibold text-heading">Cambiar contraseña</h3>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg border border-green-200">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-heading mb-1">
              Contraseña actual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <p className="text-xs text-muted mt-1">Mínimo 8 caracteres</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
