"use client";

import { useEffect } from "react";

export default function ViewCounter({ articleId }: { articleId: string }) {
  useEffect(() => {
    fetch(`/api/views/${articleId}`, { method: "POST" });
  }, [articleId]);

  return null;
}
