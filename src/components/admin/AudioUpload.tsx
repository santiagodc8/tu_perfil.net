"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface AudioUploadProps {
  audioUrl: string | null;
  onUpload: (url: string | null) => void;
}

export default function AudioUpload({ audioUrl, onUpload }: AudioUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(audioUrl);
  const [dragOver, setDragOver] = useState(false);
  const supabase = createClient();

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("audio/")) {
        alert("Solo se permiten archivos de audio");
        return;
      }

      // Límite de 50MB
      if (file.size > 50 * 1024 * 1024) {
        alert("El archivo es muy grande. Máximo 50MB.");
        return;
      }

      setUploading(true);

      try {
        const ext = file.name.split(".").pop() || "mp3";
        const fileName = `audio-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from("article-images")
          .upload(fileName, file, { contentType: file.type });

        if (error) {
          alert("Error al subir el audio");
          setUploading(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("article-images").getPublicUrl(fileName);

        setCurrentUrl(publicUrl);
        onUpload(publicUrl);
      } catch {
        alert("Error al subir el audio");
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

  return (
    <div>
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
          accept="audio/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {currentUrl ? (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <span className="text-sm font-medium text-body truncate">Audio cargado</span>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio controls className="w-full" src={currentUrl} preload="metadata" />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <span className="text-white font-medium">Subiendo...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center">
            {uploading ? (
              <p className="text-muted">Subiendo audio...</p>
            ) : (
              <>
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <p className="text-muted text-sm">
                  Arrastra un archivo de audio o haz click para seleccionar
                </p>
                <p className="text-muted text-xs mt-1">MP3, WAV, OGG, M4A (máx. 50MB)</p>
              </>
            )}
          </div>
        )}
      </div>

      {currentUrl && !uploading && (
        <button
          type="button"
          onClick={() => {
            setCurrentUrl(null);
            onUpload(null);
          }}
          className="mt-2 text-sm text-red-500 hover:text-red-700 transition"
        >
          Quitar audio
        </button>
      )}
    </div>
  );
}
