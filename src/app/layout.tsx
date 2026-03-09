import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TuPerfil.net — Portal de Noticias",
    template: "%s | TuPerfil.net",
  },
  description:
    "Portal de noticias regional. Política, judicial, salud, deportes, regional e internacional.",
  metadataBase: new URL("https://tuperfil.net"),
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "TuPerfil.net",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TuPerfil.net — Portal de Noticias",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    types: {
      "application/rss+xml": "https://tuperfil.net/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
