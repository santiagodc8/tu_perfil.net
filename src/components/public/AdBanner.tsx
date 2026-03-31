"use client";

import { useEffect, useRef, useCallback } from "react";
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

function trackEvent(adId: string, eventType: "impression" | "click") {
  // Use sendBeacon for non-blocking, or fetch as fallback
  const body = JSON.stringify({ adId, eventType });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/ads/track", new Blob([body], { type: "application/json" }));
  } else {
    fetch("/api/ads/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
  }
}

export default function AdBanner({ ad, className = "" }: AdBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  // Track impression when ad enters viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackEvent(ad.id, "impression");
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ad.id]);

  const handleClick = useCallback(() => {
    trackEvent(ad.id, "click");
  }, [ad.id]);

  const content = (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden rounded-xl bg-surface ${className}`}
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
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  return content;
}
