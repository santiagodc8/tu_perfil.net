"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const MAX_WIDTH = 1600;
const QUALITY = 0.82;

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
        "image/webp",
        QUALITY
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

interface GalleryUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function GalleryUpload({ images, onChange }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const uploadFiles = useCallback(
    async (files: FileList) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length === 0) return;

      setUploading(true);
      const newUrls: string[] = [];

      for (const file of imageFiles) {
        try {
          const compressed = await compressImage(file);
          const fileName = `gallery-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

          const { error } = await supabase.storage
            .from("article-images")
            .upload(fileName, compressed, { contentType: "image/webp" });

          if (!error) {
            const {
              data: { publicUrl },
            } = supabase.storage.from("article-images").getPublicUrl(fileName);
            newUrls.push(publicUrl);
          }
        } catch {
          // skip failed uploads
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }
      setUploading(false);
    },
    [supabase, images, onChange]
  );

  function handleRemove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const updated = [...images];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {/* Grid de imágenes existentes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, i) => (
            <div key={url} className="relative group rounded-lg overflow-hidden border border-surface-border">
              <div className="relative aspect-video">
                <Image
                  src={url}
                  alt={`Galería ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
              {/* Controles */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMove(i, -1)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow hover:bg-gray-100"
                    title="Mover antes"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm shadow hover:bg-red-600"
                  title="Eliminar"
                >
                  ✕
                </button>
                {i < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMove(i, 1)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow hover:bg-gray-100"
                    title="Mover después"
                  >
                    →
                  </button>
                )}
              </div>
              {/* Número */}
              <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Botón para agregar */}
      <div className="relative border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg transition cursor-pointer">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <div className="py-6 text-center">
          {uploading ? (
            <p className="text-gray-500 text-sm">Subiendo imágenes...</p>
          ) : (
            <>
              <p className="text-gray-500 text-sm">
                Haz click o arrastra imágenes para agregar a la galería
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Puedes seleccionar varias a la vez
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
