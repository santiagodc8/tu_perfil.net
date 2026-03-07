import Link from "next/link";
import Image from "next/image";
import { formatDateShort } from "@/lib/utils";

interface ArticleCardProps {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string } | null;
  size?: "default" | "small";
}

export default function ArticleCard({
  title,
  slug,
  excerpt,
  image_url,
  created_at,
  category,
  size = "default",
}: ArticleCardProps) {
  if (size === "small") {
    return (
      <Link href={`/noticia/${slug}`} className="group flex gap-3">
        <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          {image_url && (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-accent transition line-clamp-2 leading-snug">
            {title}
          </h4>
          <time className="text-xs text-gray-400 mt-1 block">
            {formatDateShort(created_at)}
          </time>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/noticia/${slug}`} className="group block">
      <article className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition">
        <div className="relative aspect-video bg-gray-100">
          {image_url ? (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100" />
          )}
        </div>
        <div className="p-4">
          {category && (
            <span
              className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full text-white mb-2"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          )}
          <h3 className="font-bold text-gray-900 group-hover:text-accent transition line-clamp-2 leading-snug">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{excerpt}</p>
          <time className="text-xs text-gray-400 mt-2 block">
            {formatDateShort(created_at)}
          </time>
        </div>
      </article>
    </Link>
  );
}
