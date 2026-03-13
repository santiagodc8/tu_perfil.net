"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { smartDate, BLUR_DATA_URL } from "@/lib/utils";

interface HeroSlide {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string; slug: string } | null;
}

const INTERVAL_MS = 6000;

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, next, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative rounded-xl overflow-hidden bg-surface-header aspect-[4/3] sm:aspect-[16/9] md:aspect-[19/9]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <Link
          key={slide.slug}
          href={`/noticia/${slide.slug}`}
          className={`group absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          aria-hidden={i !== current}
          tabIndex={i === current ? 0 : -1}
        >
          {slide.image_url ? (
            <Image
              src={slide.image_url}
              alt={slide.title}
              fill
              className="object-cover group-hover:scale-105 transition duration-500"
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1280px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-header to-heading" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
            {slide.category && (
              <span
                className="inline-block text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full text-white mb-2 sm:mb-3"
                style={{ backgroundColor: slide.category.color }}
              >
                {slide.category.name}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white leading-tight mb-1 sm:mb-2 group-hover:text-primary transition line-clamp-3 sm:line-clamp-2">
              {slide.title}
            </h2>
            <p className="text-gray-300 text-sm line-clamp-2 max-w-2xl hidden sm:block">
              {slide.excerpt}
            </p>
            <time className="text-xs text-gray-400 mt-2 sm:mt-3 block">
              {smartDate(slide.created_at)}
            </time>
          </div>
        </Link>
      ))}

      {/* Flechas - ocultas en mobile, visibles en hover en desktop */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition active:bg-black/70"
            aria-label="Anterior"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition active:bg-black/70"
            aria-label="Siguiente"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicadores */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 right-4 sm:right-6 md:right-8 z-20 flex items-center gap-1.5 sm:gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); setCurrent(i); }}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-5 sm:w-6 bg-primary" : "w-2.5 sm:w-3 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Ir a noticia ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Barra de progreso */}
      {slides.length > 1 && !paused && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
          <div
            className="h-full bg-primary"
            style={{
              animation: `progress ${INTERVAL_MS}ms linear`,
              animationIterationCount: 1,
            }}
            key={current}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
