import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/admin/Sidebar";
import type { UserRole } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role: UserRole = (profile?.role as UserRole) ?? "editor";

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar role={role} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
