"use client";

import { useState, useCallback } from "react";
import ReadingControls from "@/components/public/ReadingControls";

interface ArticleBodyProps {
  content: string;
  /** Initial prose class string — passed from the server so SSR matches */
  initialProseClass: string;
}

export default function ArticleBody({ content, initialProseClass }: ArticleBodyProps) {
  const [proseClass, setProseClass] = useState(initialProseClass);

  const handleSizeChange = useCallback((next: string) => {
    setProseClass(next);
  }, []);

  return (
    <>
      {/* Reading controls — inline, above the body text */}
      <div className="mb-4 sm:mb-5">
        <ReadingControls onSizeChange={handleSizeChange} />
      </div>

      {/* Article body */}
      <div
        className={`${proseClass} max-w-none prose-headings:text-heading prose-a:text-primary hover:prose-a:text-primary-hover prose-img:rounded-lg prose-table:overflow-x-auto transition-[font-size] duration-200`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}
