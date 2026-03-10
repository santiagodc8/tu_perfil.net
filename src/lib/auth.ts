import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

/**
 * Obtiene el rol del usuario actualmente autenticado.
 * Retorna null si no hay sesión activa.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (profile?.role as UserRole) ?? null;
}

/**
 * Obtiene el perfil completo del usuario autenticado.
 * Retorna null si no hay sesión activa.
 */
export async function getCurrentProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile ?? null;
}
