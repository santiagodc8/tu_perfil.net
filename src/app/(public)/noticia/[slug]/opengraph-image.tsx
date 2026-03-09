import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "TuPerfil.net";

interface Props {
  params: { slug: string };
}

export default async function ArticleOgImage({ params }: Props) {
  const supabase = createClient();

  const { data: article } = await supabase
    .from("articles")
    .select(
      "title, excerpt, image_url, author_name, category:categories(name, color)"
    )
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  // Fallback cuando el artículo no existe
  if (!article) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "1200px",
            height: "630px",
            backgroundColor: "#1A1A1A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#E30613", fontSize: "48px", fontWeight: 700 }}>
            TuPerfil.net
          </span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Extraer categoría (Supabase puede devolver array o objeto)
  const category = Array.isArray(article.category)
    ? article.category[0]
    : article.category;

  const categoryName: string = category?.name ?? "";
  const categoryColor: string = category?.color ?? "#E30613";
  const authorName: string = article.author_name ?? "Redacción TuPerfil.net";

  // Acortar el título si es muy largo
  const title =
    article.title.length > 90
      ? article.title.slice(0, 87) + "..."
      : article.title;

  // Acortar el excerpt
  const excerpt =
    article.excerpt && article.excerpt.length > 130
      ? article.excerpt.slice(0, 127) + "..."
      : (article.excerpt ?? "");

  const hasImage = Boolean(article.image_url);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "630px",
          backgroundColor: "#1A1A1A",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Imagen de fondo desenfocada cuando existe */}
        {hasImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image_url!}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
              opacity: 0.18,
            }}
          />
        )}

        {/* Gradiente izquierda para legibilidad */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "630px",
            background:
              "linear-gradient(to right, rgba(26,26,26,0.97) 60%, rgba(26,26,26,0.75) 100%)",
          }}
        />

        {/* Barra de acento roja en el lado izquierdo */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: "8px",
            height: "630px",
            backgroundColor: "#E30613",
          }}
        />

        {/* Contenido principal */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "52px 64px 48px 72px",
            width: "1200px",
            height: "630px",
            position: "relative",
          }}
        >
          {/* Cabecera: logo + badge de categoría */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Logo / marca */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "10px",
                  height: "32px",
                  backgroundColor: "#E30613",
                  borderRadius: "2px",
                }}
              />
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: "26px",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                }}
              >
                TuPerfil
                <span style={{ color: "#E30613" }}>.net</span>
              </span>
            </div>

            {/* Badge de categoría */}
            {categoryName && (
              <div
                style={{
                  display: "flex",
                  backgroundColor: categoryColor,
                  color: "#FFFFFF",
                  fontSize: "18px",
                  fontWeight: 700,
                  padding: "8px 20px",
                  borderRadius: "100px",
                  letterSpacing: "0.3px",
                }}
              >
                {categoryName}
              </div>
            )}
          </div>

          {/* Título y excerpt */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                color: "#FFFFFF",
                fontSize: title.length > 60 ? "44px" : "52px",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-1px",
                maxWidth: "900px",
              }}
            >
              {title}
            </div>

            {excerpt && (
              <div
                style={{
                  display: "flex",
                  color: "#CCCCCC",
                  fontSize: "22px",
                  lineHeight: 1.45,
                  maxWidth: "820px",
                }}
              >
                {excerpt}
              </div>
            )}
          </div>

          {/* Pie: autor + dominio */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              paddingTop: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#AAAAAA",
                fontSize: "18px",
              }}
            >
              <span style={{ color: "#666666" }}>Por</span>
              <span style={{ color: "#FFFFFF", fontWeight: 600 }}>
                {authorName}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                color: "#666666",
                fontSize: "18px",
                letterSpacing: "0.5px",
              }}
            >
              tuperfil.net
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
