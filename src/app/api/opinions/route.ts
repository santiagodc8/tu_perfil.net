import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/opinions — opiniones aprobadas
export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("opinions")
    .select("id, author_name, content, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Error al obtener opiniones" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/opinions — enviar opinión (pendiente de aprobación)
export async function POST(request: Request) {
  const { allowed } = checkRateLimit(getClientIp(request), "opinion", {
    limit: 5,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiadas opiniones enviadas. Intenta de nuevo más tarde." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { author_name, author_email, content } = body as Record<string, string>;

  if (!author_name || !author_email || !content) {
    return NextResponse.json(
      { error: "Todos los campos son requeridos" },
      { status: 400 }
    );
  }

  if (author_name.trim().length < 2) {
    return NextResponse.json({ error: "El nombre es muy corto" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(author_email.trim())) {
    return NextResponse.json({ error: "El email no es válido" }, { status: 400 });
  }

  if (content.trim().length < 10) {
    return NextResponse.json({ error: "La opinión es muy corta (mínimo 10 caracteres)" }, { status: 400 });
  }

  if (content.trim().length > 1000) {
    return NextResponse.json(
      { error: "La opinión no puede superar 1000 caracteres" },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { error } = await supabase.from("opinions").insert({
    author_name: author_name.trim(),
    author_email: author_email.trim().toLowerCase(),
    content: content.trim(),
    approved: false,
  });

  if (error) {
    return NextResponse.json({ error: "Error al guardar la opinión" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
