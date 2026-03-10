import { requireAdmin } from "@/lib/require-admin";
import NewsletterClient from "./NewsletterClient";

export default async function NewsletterPage() {
  await requireAdmin();
  return <NewsletterClient />;
}
