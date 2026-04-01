import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUnsubscribeToken } from "@/lib/newsletter";

function buildHtmlPage(title: string, message: string, isError = false): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — TuPerfil.net</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #fff; border-radius: 12px; padding: 40px 32px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; color: #1A1A1A; margin-bottom: 12px; }
    p { font-size: 15px; color: #666; line-height: 1.6; margin-bottom: 24px; }
    a { display: inline-block; background: ${isError ? "#666" : "#E30613"}; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; }
    .brand { margin-top: 32px; font-size: 13px; color: #999; }
    .brand span { color: #E30613; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isError ? "⚠️" : "✅"}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://tuperfil.net">Volver al inicio</a>
    <p class="brand">Portal de noticias <span>TuPerfil.net</span></p>
  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();
  const token = searchParams.get("token") ?? "";

  if (!email || !token) {
    return new NextResponse(
      buildHtmlPage(
        "Enlace inválido",
        "El enlace de desuscripción no es válido. Por favor contáctanos si quieres darte de baja.",
        true
      ),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Verify HMAC token
  const expectedToken = generateUnsubscribeToken(email);
  if (token !== expectedToken) {
    return new NextResponse(
      buildHtmlPage(
        "Enlace inválido",
        "El enlace de desuscripción no es válido o ya expiró. Por favor contáctanos si quieres darte de baja.",
        true
      ),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("subscribers")
    .update({ active: false, unsubscribed_at: new Date().toISOString() })
    .eq("email", email);

  if (error) {
    console.error("[newsletter/unsubscribe] Supabase error:", error);
    return new NextResponse(
      buildHtmlPage(
        "Error al procesar",
        "Ocurrió un error al procesar tu desuscripción. Por favor intentá de nuevo más tarde.",
        true
      ),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  return new NextResponse(
    buildHtmlPage(
      "Te desuscribiste correctamente",
      "Tu email fue eliminado de nuestra lista de newsletter. Ya no recibirás más correos de TuPerfil.net."
    ),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
