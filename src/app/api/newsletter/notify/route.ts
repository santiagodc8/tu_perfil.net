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

function buildNotifyHtml(
  title: string,
  excerpt: string,
  slug: string,
  imageUrl: string | null,
  categoryName: string,
  email: string
): string {
  const token = generateUnsubscribeToken(email);
  const unsubscribeUrl = `https://tuperfil.net/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
  const articleUrl = `https://tuperfil.net/noticia/${slug}`;

  const imageBlock = imageUrl
    ? `<tr>
        <td style="padding:0;">
          <img src="${esc(imageUrl)}" alt="${esc(title)}" width="600" style="display:block;width:100%;height:auto;border-radius:0;" />
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
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
                  Nueva noticia publicada
                </p>
              </a>
            </td>
          </tr>

          <!-- Image -->
          ${imageBlock}

          <!-- Content -->
          <tr>
            <td style="padding:28px 32px;">
              ${categoryName ? `<p style="margin:0 0 8px;color:#E30613;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">${esc(categoryName)}</p>` : ""}
              <h1 style="margin:0 0 12px;color:#1A1A1A;font-size:22px;line-height:1.3;">
                <a href="${articleUrl}" style="color:#1A1A1A;text-decoration:none;">${esc(title)}</a>
              </h1>
              <p style="margin:0 0 24px;color:#555555;font-size:15px;line-height:1.6;">${esc(excerpt)}</p>

              <!-- CTA -->
              <a href="${articleUrl}"
                 style="display:inline-block;background:#E30613;color:#ffffff;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:6px;text-decoration:none;">
                Leer noticia completa
              </a>
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
  // Verify the user is authenticated (admin/editor)
  const serverClient = createClient();
  const {
    data: { session },
  } = await serverClient.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let title = "";
  let slug = "";
  let excerpt = "";
  let imageUrl: string | null = null;
  let categoryName = "";

  try {
    const data = await request.json();
    title = (data.title ?? "").trim();
    slug = (data.slug ?? "").trim();
    excerpt = (data.excerpt ?? "").trim();
    imageUrl = data.imageUrl || null;
    categoryName = (data.categoryName ?? "").trim();
  } catch {
    return NextResponse.json(
      { error: "Formato de solicitud inválido." },
      { status: 400 }
    );
  }

  if (!title || !slug) {
    return NextResponse.json(
      { error: "Título y slug son obligatorios." },
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

  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("email")
    .eq("active", true);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "TuPerfil.net <noticias@tuperfil.net>";

  let sent = 0;

  // Send in batches of 10
  const batchSize = 10;
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (sub) => {
        try {
          const { error: emailError } = await resend.emails.send({
            from: fromEmail,
            to: sub.email,
            subject: `Nueva noticia: ${title}`,
            html: buildNotifyHtml(
              title,
              excerpt,
              slug,
              imageUrl,
              categoryName,
              sub.email
            ),
          });
          if (!emailError) sent++;
        } catch {
          // Non-critical: continue with other subscribers
        }
      })
    );

    if (i + batchSize < subscribers.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return NextResponse.json({ ok: true, sent, total: subscribers.length });
}
