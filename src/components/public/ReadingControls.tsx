"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "tuperfil_font_size";

type FontSize = "normal" | "grande" | "muy-grande";

const SIZE_CONFIG: Record<
  FontSize,
  { label: string; proseClass: string; next: FontSize | null; prev: FontSize | null }
> = {
  normal: {
    label: "Normal",
    proseClass: "prose prose-sm sm:prose-lg",
    next: "grande",
    prev: null,
  },
  grande: {
    label: "Grande",
    proseClass: "prose prose-lg sm:prose-xl",
    next: "muy-grande",
    prev: "normal",
  },
  "muy-grande": {
    label: "Muy grande",
    proseClass: "prose prose-xl sm:prose-2xl",
    next: null,
    prev: "grande",
  },
};

interface ReadingControlsProps {
  /** Callback to notify parent of the current prose class string */
  onSizeChange: (proseClass: string) => void;
}

export default function ReadingControls({ onSizeChange }: ReadingControlsProps) {
  const [size, setSize] = useState<FontSize>("normal");
  const [mounted, setMounted] = useState(false);

  // Read persisted preference once on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as FontSize | null;
      if (stored && stored in SIZE_CONFIG) {
        setSize(stored);
        onSizeChange(SIZE_CONFIG[stored].proseClass);
      }
    } catch {
      // localStorage unavailable — keep default
    }
  // onSizeChange intentionally excluded: it's a stable prop ref and we only
  // want this to run once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeSize = useCallback(
    (next: FontSize) => {
      setSize(next);
      onSizeChange(SIZE_CONFIG[next].proseClass);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
    },
    [onSizeChange]
  );

  const config = SIZE_CONFIG[size];

  // Avoid hydration mismatch — render nothing until mounted
  if (!mounted) return null;

  return (
    <div
      className="flex items-center gap-2 py-1.5 px-3 bg-gray-100 rounded-lg w-fit"
      role="group"
      aria-label="Tamaño del texto"
    >
      <span className="text-[11px] text-gray-500 font-medium select-none hidden sm:inline">
        Texto:
      </span>

      <button
        onClick={() => config.prev && changeSize(config.prev)}
        disabled={config.prev === null}
        aria-label="Reducir tamaño de texto"
        className="w-7 h-7 flex items-center justify-center rounded-md text-sm font-bold text-gray-600 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        A<sup className="text-[9px] leading-none">−</sup>
      </button>

      <span className="text-[11px] font-medium text-gray-500 select-none min-w-[56px] text-center">
        {config.label}
      </span>

      <button
        onClick={() => config.next && changeSize(config.next)}
        disabled={config.next === null}
        aria-label="Aumentar tamaño de texto"
        className="w-7 h-7 flex items-center justify-center rounded-md text-base font-bold text-gray-600 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        A<sup className="text-[9px] leading-none">+</sup>
      </button>
    </div>
  );
}

// Re-export the helper so the article page can get the initial prose class
// without importing the full config object.
export function getInitialProseClass(): string {
  try {
    const stored =
      typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEY) as FontSize | null)
        : null;
    if (stored && stored in SIZE_CONFIG) return SIZE_CONFIG[stored].proseClass;
  } catch {
    // ignore
  }
  return SIZE_CONFIG.normal.proseClass;
}
