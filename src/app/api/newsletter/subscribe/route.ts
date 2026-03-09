import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let email = "";
  let name = "";

  try {
    const body = await request.json();
    email = (body.email ?? "").trim().toLowerCase();
    name = (body.name ?? "").trim();
  } catch {
    return NextResponse.json(
      { error: "Formato de solicitud inválido." },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { error: "El email es obligatorio." },
      { status: 400 }
    );
  }

  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "El email no es válido." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Upsert: si ya existía y estaba desuscrito, lo reactivamos
  const { error } = await supabase.from("subscribers").upsert(
    {
      email,
      name: name || null,
      active: true,
      unsubscribed_at: null,
    },
    {
      onConflict: "email",
      ignoreDuplicates: false,
    }
  );

  if (error) {
    console.error("[newsletter/subscribe] Supabase error:", error);
    return NextResponse.json(
      { error: "Error al procesar tu suscripción. Intenta de nuevo." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
