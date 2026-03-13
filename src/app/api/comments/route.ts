import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/comments?article_id=<uuid>
// Retorna comentarios aprobados de un artículo
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const article_id = searchParams.get("article_id");

  if (!article_id) {
    return NextResponse.json(
      { error: "article_id es requerido" },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, author_name, content, created_at")
    .eq("article_id", article_id)
    .eq("approved", true)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Error al obtener comentarios" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/comments
// Recibe y guarda un nuevo comentario (pendiente de aprobación)
export async function POST(request: Request) {
  const { allowed } = checkRateLimit(getClientIp(request), "comment", {
    limit: 10,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados comentarios. Intenta de nuevo más tarde." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { article_id, author_name, author_email, content } = body as Record<string, string>;

  // Validación básica
  if (!article_id || !author_name || !author_email || !content) {
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

  if (content.trim().length < 5) {
    return NextResponse.json({ error: "El comentario es muy corto" }, { status: 400 });
  }

  if (content.trim().length > 2000) {
    return NextResponse.json(
      { error: "El comentario no puede superar 2000 caracteres" },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // Verificar que el artículo existe y está publicado
  const { data: article } = await supabase
    .from("articles")
    .select("id")
    .eq("id", article_id)
    .eq("published", true)
    .single();

  if (!article) {
    return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 });
  }

  const { error } = await supabase.from("comments").insert({
    article_id: article_id.trim(),
    author_name: author_name.trim(),
    author_email: author_email.trim().toLowerCase(),
    content: content.trim(),
    approved: false,
  });

  if (error) {
    return NextResponse.json({ error: "Error al guardar el comentario" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
