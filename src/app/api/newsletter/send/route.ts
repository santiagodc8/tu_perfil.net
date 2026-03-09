import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateUnsubscribeToken } from "@/lib/newsletter";

const resend = new Resend(process.env.RESEND_API_KEY);

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildNewsletterHtml(
  subject: string,
  body: string,
  email: string
): string {
  const token = generateUnsubscribeToken(email);
  const unsubscribeUrl = `https://tuperfil.net/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;

  // Convert plain newlines to <br> for basic formatting
  const formattedBody = esc(body).replace(/\n/g, "<br />");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1A1A1A;padding:24px 32px;">
              <a href="https://tuperfil.net" style="text-decoration:none;">
                <p style="margin:0;color:#E30613;font-size:22px;font-weight:bold;letter-spacing:1px;">
                  TuPerfil.net
                </p>
                <p style="margin:4px 0 0;color:#cccccc;font-size:13px;">
                  Portal de noticias regional
                </p>
              </a>
            </td>
          </tr>

          <!-- Subject / Title -->
          <tr>
            <td style="padding:32px 32px 0;">
              <h1 style="margin:0;color:#1A1A1A;font-size:22px;line-height:1.3;">${esc(subject)}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:20px 32px 32px;">
              <div style="color:#333333;font-size:15px;line-height:1.7;">
                ${formattedBody}
              </div>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td>
                    <a href="https://tuperfil.net"
                       style="display:inline-block;background:#E30613;color:#ffffff;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:6px;text-decoration:none;">
                      Ver todas las noticias
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#f0f0f0;border-top:1px solid #e0e0e0;">
              <p style="margin:0;color:#999999;font-size:12px;line-height:1.6;">
                Recibís este email porque te suscribiste al newsletter de
                <a href="https://tuperfil.net" style="color:#E30613;text-decoration:none;">tuperfil.net</a>.
                <br />
                <a href="${unsubscribeUrl}" style="color:#999999;">Cancelar suscripción</a>
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
  // Verify the user is authenticated
  const serverClient = createClient();
  const {
    data: { session },
  } = await serverClient.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let subject = "";
  let body = "";

  try {
    const data = await request.json();
    subject = (data.subject ?? "").trim();
    body = (data.body ?? "").trim();
  } catch {
    return NextResponse.json(
      { error: "Formato de solicitud inválido." },
      { status: 400 }
    );
  }

  if (!subject || !body) {
    return NextResponse.json(
      { error: "El asunto y el cuerpo son obligatorios." },
      { status: 400 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "El servicio de email no está configurado." },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();

  // Fetch all active subscribers
  const { data: subscribers, error: fetchError } = await supabase
    .from("subscribers")
    .select("email, name")
    .eq("active", true);

  if (fetchError) {
    console.error("[newsletter/send] Fetch subscribers error:", fetchError);
    return NextResponse.json(
      { error: "Error al obtener los suscriptores." },
      { status: 500 }
    );
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json(
      { error: "No hay suscriptores activos." },
      { status: 400 }
    );
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "TuPerfil.net <noticias@tuperfil.net>";

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // Send in batches of 10 to respect rate limits
  const batchSize = 10;
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (sub) => {
        try {
          const { error: emailError } = await resend.emails.send({
            from: fromEmail,
            to: sub.email,
            subject,
            html: buildNewsletterHtml(subject, body, sub.email),
          });

          if (emailError) {
            console.error(
              `[newsletter/send] Resend error for ${sub.email}:`,
              emailError
            );
            failed++;
            errors.push(sub.email);
          } else {
            sent++;
          }
        } catch (err) {
          console.error(
            `[newsletter/send] Unexpected error for ${sub.email}:`,
            err
          );
          failed++;
          errors.push(sub.email);
        }
      })
    );

    // Small pause between batches to be gentle on the API
    if (i + batchSize < subscribers.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    failed,
    total: subscribers.length,
  });
}
