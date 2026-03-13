import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  let adId = "";
  let eventType = "";

  try {
    const body = await request.json();
    adId = (body.adId ?? "").trim();
    eventType = (body.eventType ?? "").trim();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!adId || !["impression", "click"].includes(eventType)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const supabase = createAdminClient();
  await supabase.from("ad_events").insert({ ad_id: adId, event_type: eventType });

  return NextResponse.json({ ok: true });
}
