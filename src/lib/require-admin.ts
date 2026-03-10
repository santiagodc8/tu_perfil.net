import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/auth";

/**
 * Llama esto al inicio de una Server Page o Server Action
 * que solo debe ser accesible por admins.
 * Si el usuario no es admin, redirige a /admin.
 */
export async function requireAdmin() {
  const role = await getCurrentUserRole();
  if (role !== "admin") {
    redirect("/admin");
  }
}
