"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, smartDateShort } from "@/lib/utils";

interface HeroSlide {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string; slug: string } | null;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  className?: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=640&h=480&fit=crop";

const AUTO_SCROLL_MS = 4000;

export default function HeroCarousel({ slides, className }: HeroCarouselProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [paused, setPaused] = React.useState(false);

  const checkScrollability = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollability();
      container.addEventListener("scroll", checkScrollability);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollability);
      }
    };
  }, [slides, checkScrollability]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Auto-scroll
  React.useEffect(() => {
    if (paused || slides.length <= 1) return;

    const timer = setInterval(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const atEnd = scrollLeft >= scrollWidth - clientWidth - 1;

      if (atEnd) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const cardWidth = container.firstElementChild
          ? container.firstElementChild.getBoundingClientRect().width +
            parseFloat(getComputedStyle(container).gap || "16")
          : clientWidth * 0.8;
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, AUTO_SCROLL_MS);

    return () => clearInterval(timer);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className={cn("w-full max-w-7xl mx-auto animate-fade-in", className)}
      aria-label="Noticias destacadas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-display-sm sm:text-display-md text-heading">
          Destacadas
        </h2>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Anterior"
            className="pressable p-2 rounded-full border border-surface-border bg-white text-heading transition-opacity duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Siguiente"
            className="pressable p-2 rounded-full border border-surface-border bg-white text-heading transition-opacity duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 md:gap-5 pb-2 scrollbar-hide"
      >
        {slides.map((slide, i) => (
          <Link
            key={slide.slug}
            href={`/noticia/${slide.slug}`}
            className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px] snap-start group"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="relative overflow-hidden rounded-card bg-white border border-surface-border/50 shadow-card card-hover">
              <div className="relative w-full h-[320px] sm:h-[380px] md:h-[400px] overflow-hidden">
                <img
                  src={slide.image_url || FALLBACK_IMAGE}
                  alt={slide.title}
                  className="w-full h-full object-cover transition-transform duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{ transform: "scale(1)" }}
                  loading={i < 2 ? "eager" : "lazy"}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between text-white">
                  <div>
                    {slide.category && (
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white backdrop-blur-[2px] shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-active:scale-95"
                        style={{ backgroundColor: slide.category.color }}
                      >
                        {slide.category.name}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl leading-snug text-white line-clamp-3 mb-2 transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:text-primary-hover">
                      {slide.title}
                    </h3>
                    <time className="text-[11px] text-white/60">
                      {smartDateShort(slide.created_at)}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
