import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildEmailHtml(
  name: string,
  email: string,
  message: string,
  receivedAt: string
): string {
  // Escape HTML to prevent injection from user input
  const esc = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuevo mensaje de contacto</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1A1A1A;padding:24px 32px;">
              <p style="margin:0;color:#E30613;font-size:20px;font-weight:bold;letter-spacing:1px;">
                TuPerfil.net
              </p>
              <p style="margin:4px 0 0;color:#cccccc;font-size:13px;">
                Nuevo mensaje de contacto
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 24px;color:#333333;font-size:15px;line-height:1.5;">
                Recibiste un nuevo mensaje a través del formulario de contacto de
                <a href="https://tuperfil.net" style="color:#E30613;text-decoration:none;">tuperfil.net</a>.
              </p>

              <!-- Sender info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:12px 16px;background:#f5f5f5;border-left:4px solid #E30613;border-radius:0 4px 4px 0;">
                    <p style="margin:0 0 6px;color:#666666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Nombre</p>
                    <p style="margin:0;color:#1A1A1A;font-size:16px;font-weight:bold;">${esc(name)}</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#f5f5f5;border-left:4px solid #E30613;border-radius:0 4px 4px 0;">
                    <p style="margin:0 0 6px;color:#666666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Email</p>
                    <p style="margin:0;">
                      <a href="mailto:${esc(email)}" style="color:#E30613;font-size:15px;text-decoration:none;">${esc(email)}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <p style="margin:0 0 8px;color:#666666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Mensaje</p>
              <div style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:6px;padding:16px 20px;">
                <p style="margin:0;color:#333333;font-size:15px;line-height:1.7;white-space:pre-wrap;">${esc(message)}</p>
              </div>

              <!-- Reply CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td>
                    <a href="mailto:${esc(email)}?subject=Re:%20Tu%20consulta%20en%20TuPerfil.net"
                       style="display:inline-block;background:#E30613;color:#ffffff;font-size:14px;font-weight:bold;padding:12px 24px;border-radius:6px;text-decoration:none;">
                      Responder a ${esc(name)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;background:#f0f0f0;border-top:1px solid #e0e0e0;">
              <p style="margin:0;color:#999999;font-size:12px;">
                Recibido el ${esc(receivedAt)} &mdash;
                <a href="https://tuperfil.net/admin/mensajes" style="color:#E30613;text-decoration:none;">
                  Ver todos los mensajes en el panel
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  const { allowed } = checkRateLimit(getClientIp(request), "contact", {
    limit: 5,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados mensajes. Intenta de nuevo más tarde." },
      { status: 429 }
    );
  }

  let name = "";
  let email = "";
  let message = "";

  try {
    const body = await request.json();
    name = (body.name ?? "").trim();
    email = (body.email ?? "").trim();
    message = (body.message ?? "").trim();
  } catch {
    return NextResponse.json(
      { error: "Formato de solicitud inválido." },
      { status: 400 }
    );
  }

  // Basic server-side validation
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Todos los campos son obligatorios." },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "El email no es válido." },
      { status: 400 }
    );
  }

  if (message.length > 5000) {
    return NextResponse.json(
      { error: "El mensaje es demasiado largo (máximo 5000 caracteres)." },
      { status: 400 }
    );
  }

  // 1. Save to Supabase — this is the critical step
  const supabase = createAdminClient();
  const { error: dbError } = await supabase
    .from("contacts")
    .insert({ name, email, message });

  if (dbError) {
    console.error("[contact] Supabase insert error:", dbError);
    return NextResponse.json(
      { error: "Error al guardar el mensaje. Intenta de nuevo." },
      { status: 500 }
    );
  }

  // 2. Send email notification — non-blocking, failure does not break the flow
  const adminEmail = process.env.ADMIN_EMAIL;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!adminEmail || !resendApiKey) {
    // Email not configured — message already saved, return success
    console.warn(
      "[contact] ADMIN_EMAIL or RESEND_API_KEY not set — skipping email notification."
    );
    return NextResponse.json({ ok: true });
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "TuPerfil.net <noticias@tuperfil.net>";

  const now = new Date();
  const receivedAt = now.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  try {
    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: "Nuevo mensaje de contacto — TuPerfil.net",
      html: buildEmailHtml(name, email, message, receivedAt),
    });

    if (emailError) {
      // Log but do not fail — the record is already in the DB
      console.error("[contact] Resend error:", emailError);
    }
  } catch (emailException) {
    console.error("[contact] Unexpected email error:", emailException);
  }

  return NextResponse.json({ ok: true });
}
