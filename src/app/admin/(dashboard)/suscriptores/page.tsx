import { requireAdmin } from "@/lib/require-admin";
import SuscriptoresClient from "./SuscriptoresClient";

export default async function SuscriptoresPage() {
  await requireAdmin();
  return <SuscriptoresClient />;
}
