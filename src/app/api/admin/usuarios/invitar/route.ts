import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types";

export async function POST(request: Request) {
  // Verificar que el solicitante es admin
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Sin permisos." }, { status: 403 });
  }

  // Parsear el body
  let body: {
    email: string;
    full_name: string;
    role: UserRole;
    password: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const { email, full_name, role, password } = body;

  if (!email || !password || !role) {
    return NextResponse.json(
      { error: "Email, contraseña y rol son requeridos." },
      { status: 400 }
    );
  }

  if (!["admin", "editor"].includes(role)) {
    return NextResponse.json({ error: "Rol inválido." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  // Crear el usuario via Supabase Admin API
  const adminClient = createAdminClient();
  const { data: newUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || "" },
    });

  if (createError || !newUser?.user) {
    const msg =
      createError?.message?.includes("already registered")
        ? "Ya existe un usuario con ese email."
        : (createError?.message ?? "Error al crear el usuario.");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // El trigger on_auth_user_created ya creó el perfil con role='editor'.
  // Si el rol solicitado es diferente, actualizarlo.
  if (role !== "editor") {
    await adminClient
      .from("profiles")
      .update({ role, full_name: full_name || "", updated_at: new Date().toISOString() })
      .eq("id", newUser.user.id);
  } else if (full_name) {
    // Actualizar solo el nombre si hay uno
    await adminClient
      .from("profiles")
      .update({ full_name, updated_at: new Date().toISOString() })
      .eq("id", newUser.user.id);
  }

  return NextResponse.json({ ok: true });
}
