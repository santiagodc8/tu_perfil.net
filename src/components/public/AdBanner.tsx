import Image from "next/image";
import type { Ad, AdPosition } from "@/types";
import { BLUR_DATA_URL } from "@/lib/utils";

interface AdBannerProps {
  ad: Ad;
  className?: string;
}

const SIZES_BY_POSITION: Record<AdPosition, string> = {
  header: "(max-width: 768px) 100vw, 1200px",
  between_articles: "(max-width: 768px) 100vw, 800px",
  sidebar: "(max-width: 1024px) 100vw, 300px",
};

export default function AdBanner({ ad, className = "" }: AdBannerProps) {
  const content = (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-gray-100 ${className}`}
    >
      <Image
        src={ad.image_url}
        alt={ad.title}
        width={0}
        height={0}
        sizes={SIZES_BY_POSITION[ad.position]}
        className="w-full h-auto rounded-xl"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
      />
      <span className="absolute bottom-1 right-2 text-[9px] text-white/60 bg-black/30 px-1.5 py-0.5 rounded">
        Publicidad
      </span>
    </div>
  );

  if (ad.link_url) {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="block hover:opacity-90 transition"
      >
        {content}
      </a>
    );
  }

  return content;
}
