import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contáctanos en TuPerfil.net. Envíanos tus preguntas, sugerencias o información.",
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
