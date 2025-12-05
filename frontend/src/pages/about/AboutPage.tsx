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
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
        <p className="mt-6 text-lg font-semibold text-gradient">Cargando...</p>
      </section>
    );
  }

  // Si hay contenido dinámico desde la DB, mostrarlo
  if (content && content.content) {
    return (
      <section className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
        <header className="space-y-6 text-center">
          <div className="inline-block text-6xl mb-4 animate-float">🚗</div>
          <h1 className="heading-artistic">
            {content.title}
          </h1>
        </header>

        <article className="card-premium prose prose-neutral prose-headings:text-gradient prose-headings:font-black prose-p:text-neutral-700 prose-p:leading-relaxed max-w-none rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl lg:p-12"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: content.content }} />
        </article>

        {/* Datos legales y redes sociales (estáticos) */}
        <article className="grid gap-8 lg:grid-cols-2">
          <div className="card-premium rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl animate-scale-in"
            style={{
              background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`,
              animationDelay: '100ms'
            }}
          >
            <div className="badge-artistic inline-block mb-4">⚖️ Datos Legales</div>
            <dl className="mt-6 space-y-4 text-sm text-neutral-700">
              <div className="p-3 rounded-xl hover:bg-purple-50 transition-all">
                <dt className="font-black text-purple-900 text-xs uppercase tracking-wide">🏢 Razón social</dt>
                <dd className="mt-1 font-semibold">JSP Detailing SpA</dd>
              </div>
              <div className="p-3 rounded-xl hover:bg-purple-50 transition-all">
                <dt className="font-black text-purple-900 text-xs uppercase tracking-wide">📋 RUT</dt>
                <dd className="mt-1 font-semibold">76.123.456-7</dd>
              </div>
              <div className="p-3 rounded-xl hover:bg-purple-50 transition-all">
                <dt className="font-black text-purple-900 text-xs uppercase tracking-wide">📍 Dirección</dt>
                <dd className="mt-1 font-semibold">Adelaida 4042, Maipú</dd>
              </div>
              <div className="p-3 rounded-xl hover:bg-purple-50 transition-all">
                <dt className="font-black text-purple-900 text-xs uppercase tracking-wide">📞 Teléfono</dt>
                <dd className="mt-1 font-semibold">+56930828558</dd>
              </div>
              <div className="p-3 rounded-xl hover:bg-purple-50 transition-all">
                <dt className="font-black text-purple-900 text-xs uppercase tracking-wide">📧 Email</dt>
                <dd className="mt-1 font-semibold">jspdetailing627@gmail.com</dd>
              </div>
            </dl>
          </div>

          <div className="card-premium rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl animate-scale-in"
            style={{
              background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #f093fb, #f5576c) border-box`,
              animationDelay: '200ms'
            }}
          >
            <div className="badge-artistic inline-block mb-4">🌟 Síguenos</div>
            <p className="mt-4 text-sm text-neutral-700 font-medium leading-relaxed">
              Comparte tu pasión por el detailing con nuestra comunidad.
            </p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-all group">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md group-hover:scale-110 transition-transform">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <a
                  href="https://www.facebook.com/p/JSP-Detailing-100070133617182/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-neutral-900 hover:text-gradient transition-all"
                >
                  @jspdetailing
                </a>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-all group">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md group-hover:scale-110 transition-transform">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <a
                  href="https://www.instagram.com/jsp.detailing/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-neutral-900 hover:text-gradient transition-all"
                >
                  @jspdetailing
                </a>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-all group">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-md group-hover:scale-110 transition-transform">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
                <a
                  href="https://www.tiktok.com/@jsp.detailing"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-neutral-900 hover:text-gradient transition-all"
                >
                  @jspdetailing.cl
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
    <section className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <header className="space-y-6 text-center">
        <div className="inline-block text-6xl mb-4 animate-float">🚗</div>
        <h1 className="heading-artistic">
          Conoce JSP Detailing
        </h1>
        <p className="text-lg text-neutral-700 max-w-2xl mx-auto leading-relaxed">
          ✨ Somos una empresa chilena comprometida con el cuidado automotriz de
          alto nivel, brindando soluciones integrales para profesionales y
          entusiastas del detailing.
        </p>
      </header>

      <article className="card-premium space-y-8 rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl lg:p-12"
        style={{
          background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`
        }}
      >
        <section className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-white">
          <div className="badge-artistic inline-block mb-3">📖 Nuestra Historia</div>
          <p className="mt-4 text-neutral-700 leading-relaxed">
            JSP Detailing nació en 2016 en Santiago con la misión de acercar
            productos de alto desempeño a los detalladores chilenos. Desde
            entonces hemos ampliado nuestro catálogo a más de 300 SKU, con
            atención personalizada, capacitaciones y envíos a todo Chile.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white">
          <div className="badge-artistic inline-block mb-3" style={{background: 'linear-gradient(135deg, #4facfe, #00f2fe)'}}>
            🎯 Misión
          </div>
          <p className="mt-4 text-neutral-700 leading-relaxed">
            Entregar soluciones profesionales de detailing con asesoría
            experta, disponibilidad inmediata y precios competitivos, cuidando
            cada vehículo como si fuera propio.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-white">
          <div className="badge-artistic inline-block mb-3" style={{background: 'linear-gradient(135deg, #fa709a, #fee140)'}}>
            🔭 Visión
          </div>
          <p className="mt-4 text-neutral-700 leading-relaxed">
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
              <dd>Adelaida 4042, Maipú</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-700">Teléfono</dt>
              <dd>+56930828558</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-700">Correo electrónico</dt>
              <dd>jspdetailing627@gmail.com</dd>
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
                href="https://www.facebook.com/p/JSP-Detailing-100070133617182/"
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
                href="https://www.instagram.com/jsp.detailing/"
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
                href="https://www.tiktok.com/@jsp.detailing"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                @jspdetailing.cl
              </a>
            </li>
          </ul>
        </div>
      </article>
    </section>
  );
}

