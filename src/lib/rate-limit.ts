/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests per IP with a sliding window.
 * Suitable for single-instance deployments (Vercel serverless resets on cold start).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  });
}, 5 * 60 * 1000);

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit?: number;
  /** Window duration in seconds */
  windowSeconds?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export function checkRateLimit(
  ip: string,
  prefix: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { limit = 5, windowSeconds = 3600 } = options;
  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

export function getClientIp(request: Request): string {
  const forwarded = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  return forwarded || "unknown";
}
