import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "TuPerfil.net";

interface Props {
  params: { category: string };
}

// Mapa de íconos/descriptores por slug de categoría
const CATEGORY_DESCRIPTORS: Record<string, string> = {
  "perfil-politico": "Política regional y nacional",
  "perfil-judicial": "Noticias judiciales y legales",
  "perfil-salud": "Salud y bienestar",
  "perfil-deportivo": "Deportes locales e internacionales",
  "perfil-regional": "Noticias locales de la región",
  "perfil-internacional": "Noticias del mundo",
};

export default async function CategoryOgImage({ params }: Props) {
  const supabase = createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("name, color, slug")
    .eq("slug", params.category)
    .single();

  // Fallback si la categoría no existe
  if (!category) {
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

  const descriptor =
    CATEGORY_DESCRIPTORS[category.slug] ??
    `Noticias de ${category.name} en TuPerfil.net`;

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
        {/* Círculo decorativo grande en la derecha con el color de la categoría */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "540px",
            height: "540px",
            borderRadius: "50%",
            backgroundColor: category.color,
            opacity: 0.12,
          }}
        />

        {/* Círculo decorativo pequeño */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "-60px",
            right: "180px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            backgroundColor: category.color,
            opacity: 0.08,
          }}
        />

        {/* Barra lateral de color de categoría */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: "12px",
            height: "630px",
            backgroundColor: category.color,
          }}
        />

        {/* Contenido */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "52px 80px 48px 80px",
            width: "1200px",
            height: "630px",
            position: "relative",
          }}
        >
          {/* Logo */}
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

          {/* Categoría principal */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Badge / pill de categoría */}
            <div
              style={{
                display: "flex",
                width: "fit-content",
              }}
            >
              <div
                style={{
                  display: "flex",
                  backgroundColor: category.color,
                  color: "#FFFFFF",
                  fontSize: "20px",
                  fontWeight: 700,
                  padding: "10px 28px",
                  borderRadius: "100px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Sección
              </div>
            </div>

            {/* Nombre de la categoría */}
            <div
              style={{
                display: "flex",
                color: "#FFFFFF",
                fontSize: "76px",
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-2px",
              }}
            >
              {category.name}
            </div>

            {/* Descriptor */}
            <div
              style={{
                display: "flex",
                color: "#AAAAAA",
                fontSize: "26px",
                lineHeight: 1.4,
                maxWidth: "700px",
              }}
            >
              {descriptor}
            </div>
          </div>

          {/* Pie */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#888888",
                fontSize: "18px",
              }}
            >
              Portal de noticias regional
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
