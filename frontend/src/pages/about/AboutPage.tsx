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
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-black shadow-md group-hover:scale-110 transition-transform">
                  f
                </div>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-neutral-900 hover:text-gradient transition-all"
                >
                  @jspdetailing
                </a>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-all group">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white font-black text-xs shadow-md group-hover:scale-110 transition-transform">
                  IG
                </div>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-neutral-900 hover:text-gradient transition-all"
                >
                  @jspdetailing
                </a>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-all group">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white font-black text-xs shadow-md group-hover:scale-110 transition-transform">
                  TT
                </div>
                <a
                  href="https://www.tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-neutral-900 hover:text-gradient transition-all"
                >
                  @jspdetailing.cl
                </a>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-all group">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white font-black text-xs shadow-md group-hover:scale-110 transition-transform">
                  YT
                </div>
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-neutral-900 hover:text-gradient transition-all"
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

