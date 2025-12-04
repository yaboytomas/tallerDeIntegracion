import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../services/api";
import type { ContentPage } from "../../types";

// Definición de políticas con sus slugs
const policySlugs = [
  { id: "envios", slug: "shipping-policy", title: "Política de envíos", defaultContent: "Realizamos despachos a todo Chile mediante Chilexpress, Starken, Bluexpress y Correos Chile." },
  { id: "devoluciones", slug: "return-policy", title: "Cambios y devoluciones", defaultContent: "Tienes 10 días corridos desde la recepción para solicitar cambios o devoluciones." },
  { id: "garantia", slug: "warranty-policy", title: "Garantía legal", defaultContent: "En JSP Detailing garantizamos plenamente tus derechos como consumidor en conformidad con la legislación chilena vigente (Ley N° 21.398), por lo que si alguno de los productos adquiridos en nuestra tienda presenta fallas de fabricación, defectos de materiales o no es apto para el uso al que está destinado dentro de los 6 meses siguientes a la fecha de recepción, tienes la libertad de ejercer tu derecho a la garantía legal eligiendo entre tres opciones: la reparación gratuita del producto, el cambio por uno nuevo o la devolución íntegra del dinero, siempre y cuando la falla no se deba a un uso indebido o descuido por parte del usuario; para hacer efectivo este beneficio, es indispensable que te comuniques directamente con nosotros a través de nuestro formulario de contacto o correo electrónico oficial presentando tu comprobante de compra (boleta o factura), tras lo cual coordinaremos la recepción del producto para su evaluación técnica y la ejecución de la solución que hayas seleccionado." },
  { id: "privacidad", slug: "privacy-policy", title: "Política de privacidad", defaultContent: "JSP Detailing cumple con la Ley 19.628 sobre protección de datos personales." },
  { id: "terminos", slug: "terms-conditions", title: "Términos y condiciones", defaultContent: "Al comprar en nuestro sitio aceptas los presentes términos y condiciones." },
  { id: "cookies", slug: "cookie-policy", title: "Preferencias de cookies", defaultContent: "Utilizamos cookies esenciales para el funcionamiento del sitio." },
];

export function PoliciesPage() {
  const location = useLocation();
  const [policies, setPolicies] = useState<Record<string, ContentPage | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const loadedPolicies: Record<string, ContentPage | null> = {};
      
      // Cargar todas las políticas desde la BD
      for (const policy of policySlugs) {
        try {
          const data = await api.getContentPagePublic(policy.slug);
          loadedPolicies[policy.id] = data;
        } catch (error) {
          // Si no existe en BD, usar null (mostrará contenido por defecto)
          loadedPolicies[policy.id] = null;
        }
      }
      
      setPolicies(loadedPolicies);
    } catch (error) {
      console.error("Error loading policies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Scroll al hash si existe (ej: #envios)
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash, loading]);

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 text-center">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
        <p className="mt-6 text-lg font-semibold text-gradient">Cargando políticas...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <header className="space-y-6 text-center mb-16">
        <div className="inline-block text-6xl mb-4 animate-float">📜</div>
        <h1 className="heading-artistic">Políticas JSP Detailing</h1>
        <p className="text-lg text-neutral-700 max-w-2xl mx-auto leading-relaxed">
          ✨ Transparencia y cumplimiento para asegurar tu confianza en cada compra.
        </p>
      </header>

      <div className="mt-12 space-y-8">
        {policySlugs.map((policyDef, index) => {
          const policy = policies[policyDef.id];
          
          // Different gradient colors for each policy
          const gradients = [
            '#667eea, #764ba2',
            '#f093fb, #f5576c',
            '#4facfe, #00f2fe',
            '#43e97b, #38f9d7',
            '#fa709a, #fee140',
            '#667eea, #f093fb'
          ];
          
          const emojiIcons = ['📦', '🔄', '✅', '🔒', '📋', '🍪'];
          
          return (
            <article
              key={policyDef.id}
              id={policyDef.id}
              className="card-premium scroll-mt-24 rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl lg:p-10 animate-fade-in"
              style={{
                background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, ${gradients[index]}) border-box`,
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl flex-shrink-0">{emojiIcons[index]}</div>
                <div>
                  <h2 className="text-2xl font-black text-gradient">
                    {policy?.title || policyDef.title}
                  </h2>
                </div>
              </div>
              
              {/* Si hay contenido desde la BD, usarlo (excepto para garantía que siempre usa el hardcoded) */}
              {policy && policy.content && policyDef.id !== 'garantia' ? (
                <div 
                  className="prose prose-neutral prose-headings:text-gradient prose-headings:font-bold prose-p:text-neutral-700 prose-p:leading-relaxed mt-6 max-w-none"
                  dangerouslySetInnerHTML={{ __html: policy.content }}
                />
              ) : policyDef.id === 'garantia' ? (
                /* Contenido hardcoded para garantía legal */
                <div className="mt-6">
                  <div 
                    className="prose prose-neutral prose-headings:text-gradient prose-headings:font-bold prose-p:text-neutral-700 prose-p:leading-relaxed max-w-none"
                    dangerouslySetInnerHTML={{ __html: `
                      <h2>Garantía Legal | JSP Detailing</h2>
                      <p>En JSP Detailing garantizamos plenamente tus derechos como consumidor en conformidad con la legislación chilena vigente (Ley N° 21.398), por lo que si alguno de los productos adquiridos en nuestra tienda presenta fallas de fabricación, defectos de materiales o no es apto para el uso al que está destinado dentro de los 6 meses siguientes a la fecha de recepción, tienes la libertad de ejercer tu derecho a la garantía legal eligiendo entre tres opciones: la reparación gratuita del producto, el cambio por uno nuevo o la devolución íntegra del dinero, siempre y cuando la falla no se deba a un uso indebido o descuido por parte del usuario; para hacer efectivo este beneficio, es indispensable que te comuniques directamente con nosotros a través de nuestro formulario de contacto o correo electrónico oficial presentando tu comprobante de compra (boleta o factura), tras lo cual coordinaremos la recepción del producto para su evaluación técnica y la ejecución de la solución que hayas seleccionado.</p>
                    ` }}
                  />
                </div>
              ) : (
                /* Fallback: contenido por defecto */
                <div className="mt-6">
                  <p className="text-neutral-700 leading-relaxed text-base">{policyDef.defaultContent}</p>
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-dashed border-purple-300">
                    <p className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                      <span>⚠️</span>
                      Esta sección está pendiente de ser editada por el administrador.
                    </p>
                  </div>
                </div>
              )}
              
              {policy && policy.updatedAt && (
                <p className="mt-6 text-xs text-neutral-500 font-medium">
                  📅 Última actualización: {new Date(policy.updatedAt).toLocaleDateString("es-CL")}
                </p>
              )}
            </article>
          );
        })}
      </div>

      <aside className="mt-12 card-premium rounded-3xl border-2 border-transparent bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8 shadow-2xl"
        style={{
          background: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 20%, #fff 50%, #ffeef8 80%, #f5f7fa 100%) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`
        }}
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl">💬</div>
          <div>
            <h3 className="font-black text-xl text-gradient mb-3">¿Tienes dudas?</h3>
            <p className="text-neutral-700 leading-relaxed">
              Escríbenos a{" "}
              <a
                href="mailto:postventa@jspdetailing.cl"
                className="link-underline font-bold text-purple-600 hover:text-gradient"
              >
                postventa@jspdetailing.cl
              </a>{" "}
              o llámanos al <span className="font-bold text-gradient">+56 9 1234 5678</span>.
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}
