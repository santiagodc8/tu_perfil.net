import { createHmac } from "crypto";

export function getNewsletterSecret(): string {
  return (
    process.env.NEWSLETTER_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "fallback-secret"
  );
}

export function generateUnsubscribeToken(email: string): string {
  return createHmac("sha256", getNewsletterSecret()).update(email).digest("hex");
}
