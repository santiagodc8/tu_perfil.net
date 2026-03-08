import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();

  // Incremento atómico via RPC
  const { error } = await supabase.rpc("increment_views", {
    article_id: params.id,
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
