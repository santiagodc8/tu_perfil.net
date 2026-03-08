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

interface ImageUploadProps {
  imageUrl: string | null;
  onUpload: (url: string) => void;
}

export default function ImageUpload({ imageUrl, onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(imageUrl);
  const [dragOver, setDragOver] = useState(false);
  const supabase = createClient();

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Solo se permiten imágenes");
        return;
      }

      setUploading(true);

      try {
        const compressed = await compressImage(file);
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

        const { error } = await supabase.storage
          .from("article-images")
          .upload(fileName, compressed, { contentType: "image/webp" });

        if (error) {
          alert("Error al subir la imagen");
          setUploading(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("article-images").getPublicUrl(fileName);

        setPreview(publicUrl);
        onUpload(publicUrl);
      } catch {
        alert("Error al procesar la imagen");
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
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {preview ? (
          <div className="relative aspect-video">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <span className="text-white font-medium">Subiendo...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            {uploading ? (
              <p className="text-gray-500">Subiendo imagen...</p>
            ) : (
              <>
                <p className="text-gray-500 text-sm">
                  Arrastra una imagen aquí o haz click para seleccionar
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  JPG, PNG, WebP
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {preview && !uploading && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            onUpload("");
          }}
          className="mt-2 text-sm text-red-500 hover:text-red-700 transition"
        >
          Quitar imagen
        </button>
      )}
    </div>
  );
}
