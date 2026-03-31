import { format, formatDistanceToNow, differenceInHours } from "date-fns";
import { es } from "date-fns/locale";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDate(date: string): string {
  return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });
}

export function formatDateShort(date: string): string {
  return format(new Date(date), "d MMM yyyy", { locale: es });
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

/**
 * Fecha inteligente: relativa si es reciente (< 48h), completa si es antigua.
 * "Hace 2 horas" / "Hace 1 día" / "7 de marzo, 2026"
 */
export function smartDate(date: string): string {
  const d = new Date(date);
  const hours = differenceInHours(new Date(), d);
  if (hours < 48) {
    return formatDistanceToNow(d, { addSuffix: true, locale: es });
  }
  return format(d, "d 'de' MMMM, yyyy", { locale: es });
}

/**
 * Fecha inteligente corta para cards.
 * "Hace 3 horas" / "Ayer" / "7 mar 2026"
 */
export function smartDateShort(date: string): string {
  const d = new Date(date);
  const hours = differenceInHours(new Date(), d);
  if (hours < 24) {
    return formatDistanceToNow(d, { addSuffix: true, locale: es });
  }
  if (hours < 48) {
    return "Ayer";
  }
  return format(d, "d MMM yyyy", { locale: es });
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "...";
}

export function readingTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, "").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min de lectura`;
}

// Placeholder blur SVG para imágenes remotas (evita layout shift)
const shimmer = `<svg width="16" height="9" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="9" fill="#e5e7eb"/><rect width="16" height="9" fill="url(#g)"/><defs><linearGradient id="g"><stop offset="20%" stop-color="#e5e7eb"/><stop offset="50%" stop-color="#f3f4f6"/><stop offset="80%" stop-color="#e5e7eb"/></linearGradient></defs></svg>`;

export const BLUR_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(shimmer).toString("base64")}`;
