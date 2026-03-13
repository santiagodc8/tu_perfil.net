"use client";

import { useEffect } from "react";

export default function ViewCounter({ articleId }: { articleId: string }) {
  useEffect(() => {
    const referrer = document.referrer || "";
    fetch(`/api/views/${articleId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrer }),
    });
  }, [articleId]);

  return null;
}
