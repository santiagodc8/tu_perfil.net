import type { Metadata } from "next";
import Breadcrumbs from "@/components/public/Breadcrumbs";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de TuPerfil.net",
};

export default function TerminosPage() {
  return (
    <div className="container-custom py-4 sm:py-6">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Términos y Condiciones" }]} />
      </div>

      <article className="prose prose-lg max-w-3xl mx-auto">
        <h1>Términos y Condiciones</h1>
        <p>
          <strong>Última actualización:</strong> marzo de 2026
        </p>

        <h2>1. Aceptación de los términos</h2>
        <p>
          Al acceder y utilizar <strong>TuPerfil.net</strong>, aceptás estos
          términos y condiciones de uso. Si no estás de acuerdo, te pedimos que
          no utilices el sitio.
        </p>

        <h2>2. Contenido del sitio</h2>
        <p>
          El contenido publicado en TuPerfil.net tiene fines informativos. Nos
          esforzamos por brindar información precisa y actualizada, pero no
          garantizamos la exactitud de toda la información publicada.
        </p>

        <h2>3. Propiedad intelectual</h2>
        <p>
          Todo el contenido del sitio (textos, imágenes, diseño, logotipos) es
          propiedad de TuPerfil.net o de sus autores, y está protegido por las
          leyes de propiedad intelectual. No se permite la reproducción total o
          parcial sin autorización previa.
        </p>

        <h2>4. Comentarios de usuarios</h2>
        <p>
          Los comentarios publicados por los usuarios son responsabilidad de
          quienes los escriben. Nos reservamos el derecho de moderar, editar o
          eliminar comentarios que:
        </p>
        <ul>
          <li>Contengan lenguaje ofensivo o discriminatorio.</li>
          <li>Incluyan spam o publicidad no solicitada.</li>
          <li>Violen derechos de terceros.</li>
          <li>Sean falsos o malintencionados.</li>
        </ul>

        <h2>5. Enlaces externos</h2>
        <p>
          El sitio puede contener enlaces a sitios de terceros. No nos hacemos
          responsables del contenido, políticas de privacidad o prácticas de
          otros sitios web.
        </p>

        <h2>6. Limitación de responsabilidad</h2>
        <p>
          TuPerfil.net no será responsable por daños directos o indirectos que
          puedan derivarse del uso o la imposibilidad de uso del sitio.
        </p>

        <h2>7. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier
          momento. Los cambios se publicarán en esta página con la fecha de
          actualización.
        </p>

        <h2>8. Contacto</h2>
        <p>
          Para consultas sobre estos términos, escribinos a través de la{" "}
          <a href="/contacto" className="text-primary hover:underline">
            página de contacto
          </a>
          .
        </p>
      </article>
    </div>
  );
}
