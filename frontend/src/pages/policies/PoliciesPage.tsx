import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../services/api";
import type { ContentPage } from "../../types";

// Definición de políticas con sus slugs
const policySlugs = [
  { id: "envios", slug: "shipping-policy", title: "Política de envíos", defaultContent: "Realizamos despachos a todo Chile mediante Chilexpress, Starken, Bluexpress y Correos Chile." },
  { id: "devoluciones", slug: "return-policy", title: "Cambios y devoluciones", defaultContent: "Tienes 10 días corridos desde la recepción para solicitar cambios o devoluciones." },
  { id: "garantia", slug: "warranty-policy", title: "Garantía legal", defaultContent: "Todos los productos cuentan con 3 meses de garantía legal según Ley 19.496." },
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
        <p className="text-neutral-600">Cargando políticas...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="space-y-4 text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Políticas JSP Detailing</h1>
        <p className="text-neutral-600">
          Transparencia y cumplimiento para asegurar tu confianza en cada compra.
        </p>
      </header>

      <div className="mt-12 space-y-8">
        {policySlugs.map((policyDef) => {
          const policy = policies[policyDef.id];
          
          return (
            <article
              key={policyDef.id}
              id={policyDef.id}
              className="scroll-mt-24 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm lg:p-8"
            >
              <h2 className="text-xl font-semibold text-neutral-900">
                {policy?.title || policyDef.title}
              </h2>
              
              {/* Si hay contenido desde la BD, usarlo */}
              {policy && policy.content ? (
                <div 
                  className="prose prose-neutral mt-4 max-w-none text-sm text-neutral-600"
                  dangerouslySetInnerHTML={{ __html: policy.content }}
                />
              ) : (
                /* Fallback: contenido por defecto */
                <div className="mt-4 text-sm text-neutral-600">
                  <p>{policyDef.defaultContent}</p>
                  <p className="mt-3 italic text-neutral-500">
                    Esta sección está pendiente de ser editada por el administrador.
                  </p>
                </div>
              )}
              
              {policy && policy.updatedAt && (
                <p className="mt-4 text-xs text-neutral-400">
                  Última actualización: {new Date(policy.updatedAt).toLocaleDateString("es-CL")}
                </p>
              )}
            </article>
          );
        })}
      </div>

      <aside className="mt-12 rounded-3xl border border-primary/30 bg-primary/5 p-6 text-sm text-neutral-700">
        <p>
          ¿Tienes dudas? Escríbenos a{" "}
          <a
            href="mailto:postventa@jspdetailing.cl"
            className="font-semibold text-primary hover:underline"
          >
            postventa@jspdetailing.cl
          </a>{" "}
          o llámanos al <span className="font-semibold">+56 9 1234 5678</span>.
        </p>
      </aside>
    </section>
  );
}
