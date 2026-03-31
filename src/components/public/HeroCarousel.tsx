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
      className="relative rounded-2xl overflow-hidden bg-surface-header aspect-[4/3] sm:aspect-[16/9] md:aspect-[19/9] shadow-xl animate-fade-in"
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
              className="object-cover group-hover:scale-[1.03] transition-transform duration-[800ms] ease-out"
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1280px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-header to-heading" />
          )}

          {/* Gradient overlay — more dramatic */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10">
            {slide.category && (
              <span
                className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded text-white mb-3 sm:mb-4"
                style={{ backgroundColor: slide.category.color }}
              >
                {slide.category.name}
              </span>
            )}
            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl text-white leading-[1.15] mb-2 sm:mb-3 group-hover:text-primary-hover transition-colors duration-300 line-clamp-3 sm:line-clamp-2 max-w-4xl">
              {slide.title}
            </h2>
            <p className="text-gray-300/90 text-sm sm:text-base line-clamp-2 max-w-2xl hidden sm:block leading-relaxed">
              {slide.excerpt}
            </p>
            <div className="flex items-center gap-3 mt-3 sm:mt-4">
              <time className="text-xs sm:text-sm text-gray-400">
                {smartDate(slide.created_at)}
              </time>
              <span className="text-xs sm:text-sm text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:inline-flex items-center gap-1">
                Leer más
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      ))}

      {/* Arrow buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:scale-95 border border-white/10"
            aria-label="Anterior"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:scale-95 border border-white/10"
            aria-label="Siguiente"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 right-5 sm:right-8 md:right-10 z-20 flex items-center gap-1.5 sm:gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); setCurrent(i); }}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 sm:w-7 h-2 bg-primary"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Ir a noticia ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {slides.length > 1 && !paused && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-hover"
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
