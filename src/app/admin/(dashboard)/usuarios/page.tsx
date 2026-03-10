import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import UsuariosClient from "./UsuariosClient";
import AdminHeader from "@/components/admin/AdminHeader";
import type { Profile } from "@/types";

export default async function UsuariosPage() {
  await requireAdmin();

  const adminClient = createAdminClient();

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })
    .returns<Profile[]>();

  return (
    <div>
      <AdminHeader title="Usuarios" />
      <UsuariosClient initialProfiles={profiles ?? []} />
    </div>
  );
}
