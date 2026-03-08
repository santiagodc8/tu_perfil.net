import Link from "next/link";
import Image from "next/image";
import { smartDate, BLUR_DATA_URL } from "@/lib/utils";

interface HeroArticleProps {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string; slug: string } | null;
}

export default function HeroArticle({ title, slug, excerpt, image_url, created_at, category }: HeroArticleProps) {
  return (
    <Link href={`/noticia/${slug}`} className="group block">
      <article className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[16/9] md:aspect-[21/9]">
        {image_url ? (
          <Image
            src={image_url}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition duration-500"
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          {category && (
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white mb-3"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          )}
          <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-2 group-hover:text-accent transition">
            {title}
          </h2>
          <p className="text-gray-300 text-sm md:text-base line-clamp-2 max-w-2xl">
            {excerpt}
          </p>
          <time className="text-xs text-gray-400 mt-3 block">
            {smartDate(created_at)}
          </time>
        </div>
      </article>
    </Link>
  );
}
