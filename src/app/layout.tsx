import type { Metadata } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/public/ServiceWorkerRegister";
import CookieBanner from "@/components/public/CookieBanner";
import Analytics from "@/components/public/Analytics";

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
    icon: "/favicon_new.png",
    apple: "/favicon_new.png",
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
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(t==null&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
