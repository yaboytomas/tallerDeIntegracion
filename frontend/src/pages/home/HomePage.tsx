import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { HomeBanner, Category } from "../../types";
import { getOptimizedImageUrl } from "../../utils/imageUrl";

export function HomePage() {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadHomeBanners();
    loadCategories();
  }, []);

  const loadHomeBanners = async () => {
    try {
      const data = await api.getHomeBanners();
      setBanners(data.filter((b: HomeBanner) => b.active));
    } catch (error) {
      console.error("Error loading banners:", error);
    } finally {
      setLoadingBanners(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Obtener solo las categorías destacadas
      const data = await api.getCategories({ featured: true });
      setCategories(data.filter((c: Category) => c.status === 'active'));
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section with Banners */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-gradient min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
        {loadingBanners ? (
          <div className="mx-auto max-w-7xl px-4 py-24 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-neutral-600">Cargando...</p>
          </div>
        ) : banners.length > 0 ? (
          // Mostrar primer banner activo
          <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:px-8 lg:py-24">
            <div className="w-full space-y-6 lg:w-1/2 animate-fade-in">
              <span className="badge-artistic inline-block">
                ✨ Detailing Profesional en Chile
              </span>
              <h1 className="heading-artistic">
                {banners[0].title}
              </h1>
              <p className="text-lg text-neutral-600 leading-relaxed">
                {banners[0].subtitle || "En JSP Detailing encontrarás soluciones especializadas para lavado, descontaminación y protección de tu auto."}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to={banners[0].ctaLink || "/productos"}
                  className="btn-premium group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                >
                  {banners[0].ctaText || "Comprar ahora"}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  to="/contacto"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-neutral-300 px-8 py-4 text-base font-semibold text-neutral-700 transition-all duration-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 hover:-translate-y-1"
                >
                  💬 Habla con un asesor
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-1/2 animate-fade-in" style={{animationDelay: '200ms'}}>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <img
                  src={getOptimizedImageUrl(banners[0].image, { width: 1200, quality: 85, format: 'auto' }) || "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=85"}
                  alt={banners[0].title}
                  width="1200"
                  height="900"
                  className="relative aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl lg:aspect-auto lg:h-[500px] transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="absolute bottom-4 left-4 rounded-2xl glass p-4 shadow-xl backdrop-blur-md animate-float">
                  <p className="text-xs font-semibold uppercase text-neutral-600">
                    ⭐ Confían en nosotros
                  </p>
                  <p className="text-lg font-bold text-gradient">
                    +5.000 detalladores en Chile
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Fallback si no hay banners
          <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:px-8 lg:py-24">
            <div className="w-full space-y-6 lg:w-1/2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Detailing profesional en Chile
              </span>
              <h1 className="text-4xl font-bold text-neutral-900 sm:text-5xl">
                Realza el brillo de tu vehículo con productos de alto desempeño.
              </h1>
              <p className="text-lg text-neutral-600">
                En JSP Detailing encontrarás soluciones especializadas para lavado,
                descontaminación y protección de tu auto, con precios en pesos
                chilenos y entrega a todo el país.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/productos"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-primary-dark"
                >
                  Comprar ahora
                </Link>
                <Link
                  to="/contacto"
                  className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary hover:text-primary"
                >
                  Habla con un asesor
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1000&q=80"
                  alt="Detalle automotriz profesional"
                  width="1000"
                  height="750"
                  className="aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl lg:aspect-auto lg:h-[500px]"
                  loading="lazy"
                />
                <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 p-3 shadow-xl sm:p-4">
                  <p className="text-xs font-semibold uppercase text-neutral-500">
                    Confían en nosotros
                  </p>
                  <p className="text-base font-bold text-neutral-900 sm:text-lg">
                    +5.000 detalladores en Chile
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row mb-12">
          <div className="text-center sm:text-left">
            <div className="inline-block text-4xl mb-3">🎯</div>
            <h2 className="text-4xl font-black text-gradient">
              Categorías Destacadas
            </h2>
            <p className="text-lg text-neutral-600 mt-3">
              ✨ Encuentra productos seleccionados para cada etapa del detailing
            </p>
          </div>
          <Link
            to="/productos"
            className="link-underline group inline-flex items-center gap-2 text-base font-bold text-gradient hover:scale-105 transition-all duration-300"
          >
            Ver todas las categorías
            <span className="transition-transform group-hover:translate-x-2">→</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {loadingCategories ? (
            <div className="col-span-3 py-20 text-center">
              <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
              <p className="mt-6 text-lg font-semibold text-gradient">Cargando categorías...</p>
            </div>
          ) : categories.length > 0 ? (
            categories.map((category, index) => {
              const gradients = [
                '#667eea, #764ba2',
                '#f093fb, #f5576c',
                '#4facfe, #00f2fe'
              ];
              return (
                <article
                  key={category._id}
                  className="card-premium group overflow-hidden rounded-3xl border-2 border-transparent bg-white shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.5)] transition-all duration-500 hover:-translate-y-3 animate-scale-in"
                  style={{
                    background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, ${gradients[index]}) border-box`,
                    animationDelay: `${index * 150}ms`
                  }}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img
                      src={category.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"}
                      alt={category.name}
                      width="800"
                      height="600"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 z-20 badge-artistic animate-float">
                      🔥 Popular
                    </div>
                  </div>
                  <div className="space-y-4 p-8">
                    <h3 className="text-2xl font-black text-neutral-900 group-hover:text-gradient transition-all">
                      {category.name}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                      {category.description || "Encuentra los mejores productos de esta categoría."}
                    </p>
                    <Link
                      to={`/productos?category=${category.slug}`}
                      className="btn-premium inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      Ver productos
                      <span aria-hidden className="transition-transform group-hover:translate-x-2">
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-3 rounded-3xl border-4 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 p-16 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl font-bold text-gradient">No hay categorías disponibles aún</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-pink-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            <div className="card-premium group rounded-2xl border-2 border-transparent bg-white p-8 text-center shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.5)] transition-all duration-500 hover:-translate-y-2 animate-scale-in"
              style={{
                background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`
              }}
            >
              <div className="text-5xl mb-4 inline-block animate-float">📦</div>
              <p className="text-xl font-black text-gradient mb-3">
                Envíos a todo Chile
              </p>
              <p className="text-sm text-neutral-600 leading-relaxed">Chilexpress, Starken, Bluexpress y más</p>
            </div>
            <div className="card-premium group rounded-2xl border-2 border-transparent bg-white p-8 text-center shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.5)] transition-all duration-500 hover:-translate-y-2 animate-scale-in"
              style={{
                background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #4facfe, #00f2fe) border-box`,
                animationDelay: '150ms'
              }}
            >
              <div className="text-5xl mb-4 inline-block animate-float" style={{animationDelay: '300ms'}}>💰</div>
              <p className="text-xl font-black text-gradient mb-3">
                IVA Incluido
              </p>
              <p className="text-sm text-neutral-600 leading-relaxed">Precios finales en pesos chilenos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block text-5xl mb-4">💳</div>
            <h2 className="text-4xl font-black text-gradient mb-4">
              Métodos de Pago y Seguridad
            </h2>
            <p className="text-lg text-neutral-600">
              ✨ Compra con confianza usando tus medios favoritos
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 max-w-2xl mx-auto">
            {[
              { title: "Transferencia", description: "Pagos directos a cuenta JSP Detailing.", emoji: "🏦", gradient: "#f093fb, #f5576c" },
              { title: "SERNAC", description: "Cumplimos normativa Ley 21.398 y SERNAC.", emoji: "✅", gradient: "#43e97b, #38f9d7" },
            ].map((item, index) => (
              <div
                key={item.title}
                className="card-premium group rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.5)] transition-all duration-500 hover:-translate-y-3 animate-scale-in"
                style={{
                  background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, ${item.gradient}) border-box`,
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="text-5xl mb-6 inline-block animate-float" style={{animationDelay: `${index * 200}ms`}}>{item.emoji}</div>
                <h3 className="text-xl font-black text-neutral-900 group-hover:text-gradient transition-all mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
