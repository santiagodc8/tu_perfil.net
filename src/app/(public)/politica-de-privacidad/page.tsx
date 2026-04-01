import type { Metadata } from "next";
import Breadcrumbs from "@/components/public/Breadcrumbs";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de TuPerfil.net",
};

export default function PoliticaDePrivacidadPage() {
  return (
    <div className="container-custom py-4 sm:py-6">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Política de Privacidad" }]} />
      </div>

      <article className="prose prose-lg max-w-3xl mx-auto">
        <h1>Política de Privacidad</h1>
        <p>
          <strong>Última actualización:</strong> marzo de 2026
        </p>

        <h2>1. Información que recopilamos</h2>
        <p>
          En <strong>TuPerfil.net</strong> recopilamos la siguiente información:
        </p>
        <ul>
          <li>
            <strong>Datos de contacto:</strong> nombre, email y mensaje cuando
            usás el formulario de contacto.
          </li>
          <li>
            <strong>Suscripción al newsletter:</strong> email y nombre
            (opcional) al suscribirte.
          </li>
          <li>
            <strong>Comentarios:</strong> nombre, email y contenido del
            comentario en artículos.
          </li>
          <li>
            <strong>Datos de navegación:</strong> páginas visitadas, fuente de
            tráfico (referrer) y fecha de visita para estadísticas internas.
          </li>
          <li>
            <strong>Cookies:</strong> utilizamos cookies técnicas necesarias para
            el funcionamiento del sitio y, con tu consentimiento, cookies de
            analítica.
          </li>
        </ul>

        <h2>2. Uso de la información</h2>
        <p>Usamos tu información para:</p>
        <ul>
          <li>Responder a tus consultas de contacto.</li>
          <li>Enviarte el newsletter si te suscribiste.</li>
          <li>Moderar y publicar comentarios.</li>
          <li>Mejorar el contenido y la experiencia del sitio.</li>
          <li>Generar estadísticas de tráfico anónimas.</li>
        </ul>

        <h2>3. Compartir información</h2>
        <p>
          No vendemos, alquilamos ni compartimos tu información personal con
          terceros, salvo cuando sea necesario para proveer nuestros servicios
          (envío de emails a través de proveedores de confianza).
        </p>

        <h2>4. Cookies</h2>
        <p>
          Puedes aceptar o rechazar las cookies no esenciales a través del banner
          que aparece al visitar el sitio. Las cookies técnicas son necesarias
          para el funcionamiento y no requieren consentimiento.
        </p>

        <h2>5. Tus derechos</h2>
        <p>Tienes derecho a:</p>
        <ul>
          <li>Acceder a tus datos personales que tengamos almacenados.</li>
          <li>Solicitar la corrección o eliminación de tus datos.</li>
          <li>
            Cancelar tu suscripción al newsletter en cualquier momento usando el
            enlace en cada email.
          </li>
        </ul>

        <h2>6. Contacto</h2>
        <p>
          Para cualquier consulta sobre privacidad, puedes escribirnos a través
          de la{" "}
          <a href="/contacto" className="text-primary hover:underline">
            página de contacto
          </a>
          .
        </p>
      </article>
    </div>
  );
}
