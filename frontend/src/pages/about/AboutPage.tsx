import { useEffect, useState } from "react";
import { api } from "../../services/api";

export function AboutPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const data = await api.getContentPagePublic("about");
      setContent(data);
    } catch (error) {
      console.error("Error loading about page:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-neutral-600">Cargando...</p>
      </section>
    );
  }

  // Si hay contenido dinámico desde la DB, mostrarlo
  if (content && content.content) {
    return (
      <section className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <header className="space-y-4 text-center">
          <h1 className="text-3xl font-bold text-neutral-900">
            {content.title}
          </h1>
        </header>

        <article className="prose prose-neutral max-w-none rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm lg:p-10">
          <div dangerouslySetInnerHTML={{ __html: content.content }} />
        </article>

        {/* Datos legales y redes sociales (estáticos) */}
        <article className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-900">Datos legales</h2>
            <dl className="mt-4 space-y-3 text-sm text-neutral-600">
              <div>
                <dt className="font-medium text-neutral-700">Razón social</dt>
                <dd>JSP Detailing SpA</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-700">RUT</dt>
                <dd>76.123.456-7</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-700">Dirección comercial</dt>
                <dd>Av. Las Palmeras 1234, Huechuraba, Santiago</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-700">Teléfono</dt>
                <dd>+56 9 1234 5678</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-700">Correo electrónico</dt>
                <dd>contacto@jspdetailing.cl</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-900">Síguenos</h2>
            <p className="mt-3 text-sm text-neutral-600">
              Comparte tu pasión por el detailing con nuestra comunidad.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600">
              <li>
                Facebook:{" "}
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  @jspdetailing
                </a>
              </li>
              <li>
                Instagram:{" "}
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  @jspdetailing
                </a>
              </li>
              <li>
                TikTok:{" "}
                <a
                  href="https://www.tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  @jspdetailing.cl
                </a>
              </li>
              <li>
                YouTube:{" "}
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  JSP Detailing Chile
                </a>
              </li>
            </ul>
          </div>
        </article>
      </section>
    );
  }

  // Fallback: contenido estático si no hay datos en la DB
  return (
    <section className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="space-y-4 text-center">
        <h1 className="text-3xl font-bold text-neutral-900">
          Conoce JSP Detailing
        </h1>
        <p className="text-neutral-600">
          Somos una empresa chilena comprometida con el cuidado automotriz de
          alto nivel, brindando soluciones integrales para profesionales y
          entusiastas del detailing.
        </p>
      </header>

      <article className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm lg:p-10">
        <section>
          <h2 className="text-xl font-semibold text-neutral-900">Nuestra historia</h2>
          <p className="mt-3 text-neutral-600">
            JSP Detailing nació en 2016 en Santiago con la misión de acercar
            productos de alto desempeño a los detalladores chilenos. Desde
            entonces hemos ampliado nuestro catálogo a más de 300 SKU, con
            atención personalizada, capacitaciones y envíos a todo Chile.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900">Misión</h2>
          <p className="mt-3 text-neutral-600">
            Entregar soluciones profesionales de detailing con asesoría
            experta, disponibilidad inmediata y precios competitivos, cuidando
            cada vehículo como si fuera propio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900">Visión</h2>
          <p className="mt-3 text-neutral-600">
            Ser la tienda referente en Chile para el cuidado estético
            automotriz, destacando por la excelencia en servicio, innovación y
            cumplimiento normativo.
          </p>
        </section>
      </article>

      <article className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">Datos legales</h2>
          <dl className="mt-4 space-y-3 text-sm text-neutral-600">
            <div>
              <dt className="font-medium text-neutral-700">Razón social</dt>
              <dd>JSP Detailing SpA</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-700">RUT</dt>
              <dd>76.123.456-7</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-700">Dirección comercial</dt>
              <dd>Av. Las Palmeras 1234, Huechuraba, Santiago</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-700">Teléfono</dt>
              <dd>+56 9 1234 5678</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-700">Correo electrónico</dt>
              <dd>contacto@jspdetailing.cl</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">Síguenos</h2>
          <p className="mt-3 text-sm text-neutral-600">
            Comparte tu pasión por el detailing con nuestra comunidad.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-neutral-600">
            <li>
              Facebook:{" "}
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                @jspdetailing
              </a>
            </li>
            <li>
              Instagram:{" "}
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                @jspdetailing
              </a>
            </li>
            <li>
              TikTok:{" "}
              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                @jspdetailing.cl
              </a>
            </li>
            <li>
              YouTube:{" "}
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                JSP Detailing Chile
              </a>
            </li>
          </ul>
        </div>
      </article>
    </section>
  );
}

