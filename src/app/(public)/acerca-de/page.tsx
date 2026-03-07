import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca de",
  description: "Conoce más sobre TuPerfil.net, portal de noticias regional.",
};

export default function AcercaDePage() {
  return (
    <div className="container-custom py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          Acerca de TuPerfil.net
        </h1>

        <div className="prose prose-lg max-w-none prose-headings:text-gray-900">
          <p>
            <strong>TuPerfil.net</strong> es un portal de noticias dedicado a
            informar con veracidad y oportunidad sobre los acontecimientos más
            relevantes de nuestra región y el mundo.
          </p>

          <h2>Nuestra misión</h2>
          <p>
            Brindar información confiable, oportuna y de calidad a nuestra
            comunidad, cubriendo los temas que más impactan la vida de nuestros
            lectores: política, justicia, salud, deportes y más.
          </p>

          <h2>Nuestros valores</h2>
          <ul>
            <li>
              <strong>Veracidad:</strong> Nos comprometemos con la verdad y la
              precisión en cada nota que publicamos.
            </li>
            <li>
              <strong>Oportunidad:</strong> Trabajamos para llevar la noticia a
              nuestros lectores en el menor tiempo posible.
            </li>
            <li>
              <strong>Responsabilidad:</strong> Entendemos el impacto que la
              información tiene en la sociedad y actuamos con responsabilidad.
            </li>
          </ul>

          <h2>Contacto</h2>
          <p>
            ¿Tienes información que compartir o deseas comunicarte con nuestro
            equipo? Visita nuestra{" "}
            <a href="/contacto">página de contacto</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
