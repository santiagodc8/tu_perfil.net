"use client";

import Link from "next/link";
import { useState } from "react";

interface BreakingNewsBannerProps {
  text: string;
  link: string | null;
}

export default function BreakingNewsBanner({ text, link }: BreakingNewsBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const content = (
    <span className="flex items-center gap-2 justify-center text-center">
      <span className="font-black text-xs uppercase tracking-wider bg-white text-red-600 px-2 py-0.5 rounded flex-shrink-0">
        Última Hora
      </span>
      <span className="text-sm font-medium truncate">{text}</span>
    </span>
  );

  return (
    <div className="bg-red-600 text-white relative">
      <div className="container-custom py-2 pr-8">
        {link ? (
          <Link href={link} className="hover:underline block">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition"
        aria-label="Cerrar"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
