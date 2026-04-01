import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function classifyReferrer(referrer: string): string {
  if (!referrer) return "direct";
  const r = referrer.toLowerCase();
  if (r.includes("google.") || r.includes("bing.") || r.includes("yahoo.") || r.includes("duckduckgo.")) return "google";
  if (r.includes("facebook.com") || r.includes("fb.com") || r.includes("fbclid")) return "facebook";
  if (r.includes("twitter.com") || r.includes("x.com") || r.includes("t.co")) return "twitter";
  if (r.includes("whatsapp.") || r.includes("wa.me")) return "whatsapp";
  if (r.includes("instagram.com")) return "instagram";
  if (r.includes("tiktok.com")) return "tiktok";
  if (r.includes("telegram.") || r.includes("t.me")) return "telegram";
  return "other";
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();

  let referrer = "";
  try {
    const body = await request.json();
    referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 2000) : "";
  } catch {
    // No body or invalid JSON — that's fine
  }

  const referrerSource = classifyReferrer(referrer);

  const { error } = await supabase.rpc("increment_views", {
    article_id: params.id,
    p_referrer: referrer || null,
    p_referrer_source: referrerSource,
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
