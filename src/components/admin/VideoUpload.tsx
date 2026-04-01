"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface VideoUploadProps {
  videoUrl: string | null;
  onUpload: (url: string | null) => void;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function VideoUpload({ videoUrl, onUpload }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(videoUrl);
  const [dragOver, setDragOver] = useState(false);
  const [inputMode, setInputMode] = useState<"file" | "youtube">(
    currentUrl && getYouTubeId(currentUrl) ? "youtube" : "file"
  );
  const [youtubeInput, setYoutubeInput] = useState(
    currentUrl && getYouTubeId(currentUrl) ? currentUrl : ""
  );
  const supabase = createClient();

  const isYouTube = currentUrl ? !!getYouTubeId(currentUrl) : false;
  const youtubeId = currentUrl ? getYouTubeId(currentUrl) : null;

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) {
        alert("Solo se permiten archivos de video");
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        alert("El archivo es muy grande. Máximo 100MB.");
        return;
      }

      setUploading(true);

      try {
        const ext = file.name.split(".").pop() || "mp4";
        const fileName = `video-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from("article-images")
          .upload(fileName, file, { contentType: file.type });

        if (error) {
          alert("Error al subir el video");
          setUploading(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("article-images").getPublicUrl(fileName);

        setCurrentUrl(publicUrl);
        onUpload(publicUrl);
      } catch {
        alert("Error al subir el video");
      }
      setUploading(false);
    },
    [supabase, onUpload]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleYouTubeSubmit() {
    const id = getYouTubeId(youtubeInput);
    if (!id) {
      alert("URL de YouTube inválida");
      return;
    }
    const url = `https://www.youtube.com/watch?v=${id}`;
    setCurrentUrl(url);
    onUpload(url);
  }

  function handleRemove() {
    setCurrentUrl(null);
    setYoutubeInput("");
    onUpload(null);
  }

  return (
    <div>
      {/* Tabs: Archivo / YouTube */}
      {!currentUrl && (
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setInputMode("file")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              inputMode === "file"
                ? "bg-primary text-white"
                : "bg-surface border border-surface-border text-body hover:border-primary hover:text-primary"
            }`}
          >
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setInputMode("youtube")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              inputMode === "youtube"
                ? "bg-primary text-white"
                : "bg-surface border border-surface-border text-body hover:border-primary hover:text-primary"
            }`}
          >
            YouTube
          </button>
        </div>
      )}

      {currentUrl ? (
        <div className="rounded-lg border border-surface-border overflow-hidden bg-surface-card">
          {isYouTube && youtubeId ? (
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Video preview"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative aspect-video">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                controls
                className="w-full h-full object-contain bg-black"
                src={currentUrl}
                preload="metadata"
              />
            </div>
          )}
        </div>
      ) : inputMode === "youtube" ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 px-4 py-2.5 border border-surface-border rounded-lg bg-surface-card focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
          />
          <button
            type="button"
            onClick={handleYouTubeSubmit}
            className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium text-sm rounded-lg transition"
          >
            Agregar
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg transition cursor-pointer ${
            dragOver
              ? "border-accent bg-accent/5"
              : "border-surface-border hover:border-gray-400 dark:hover:border-gray-500"
          }`}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="py-10 text-center">
            {uploading ? (
              <p className="text-muted">Subiendo video...</p>
            ) : (
              <>
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <p className="text-muted text-sm">
                  Arrastra un video o haz click para seleccionar
                </p>
                <p className="text-muted text-xs mt-1">MP4, MOV, WebM (máx. 100MB)</p>
              </>
            )}
          </div>
        </div>
      )}

      {currentUrl && !uploading && (
        <button
          type="button"
          onClick={handleRemove}
          className="mt-2 text-sm text-red-500 hover:text-red-700 transition"
        >
          Quitar video
        </button>
      )}
    </div>
  );
}
