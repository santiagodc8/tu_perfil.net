import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

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

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "...";
}
