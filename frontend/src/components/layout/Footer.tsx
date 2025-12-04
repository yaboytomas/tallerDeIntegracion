import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t-4 border-transparent bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 20%, #fff 50%, #ffeef8 80%, #f5f7fa 100%) padding-box, linear-gradient(90deg, #667eea, #764ba2, #f093fb) border-box`,
        backgroundSize: '300% 100%',
        animation: 'gradientShift 8s ease infinite'
      }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-pink-500 rounded-full blur-3xl"></div>
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="animate-fade-in">
          <div className="mb-6 flex items-center gap-3">
            <img 
              src="/jsp.jpg" 
              alt="JSP Detailing" 
              className="h-16 w-auto object-contain transition-transform duration-500 hover:scale-110 hover:rotate-3 drop-shadow-2xl"
            />
            <div className="flex flex-col leading-none">
              <span className="text-base font-black text-gradient">
                JSP Detailing
              </span>
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                Premium
              </span>
            </div>
          </div>
          <p className="text-sm text-neutral-700 font-medium leading-relaxed">
            ✨ Productos y servicios profesionales para el cuidado automotriz en Chile.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-neutral-600">
            <li className="flex items-center gap-2">
              <span className="text-purple-600">📍</span>
              <a 
                href="https://maps.google.com/?q=Adelaida+4042,+Maipú,+Chile" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-purple-600 transition-colors"
              >
                Adelaida 4042, Maipú
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-600">📞</span>
              <a 
                href="tel:+56930828558" 
                className="hover:text-purple-600 transition-colors"
              >
                +56930828558
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-600">📧</span>
              <a 
                href="mailto:jspdetailing627@gmail.com" 
                className="hover:text-purple-600 transition-colors"
              >
                jspdetailing627@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <div className="animate-fade-in" style={{animationDelay: '100ms'}}>
          <h3 className="text-base font-black text-gradient mb-6">
            ⚖️ Información Legal
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-neutral-700">
            <li>
              <Link
                to="/politicas#envios"
                className="link-underline transition-all hover:text-purple-600 hover:translate-x-2 inline-block font-semibold"
              >
                Política de envíos
              </Link>
            </li>
            <li>
              <Link
                to="/politicas#devoluciones"
                className="link-underline transition-all hover:text-purple-600 hover:translate-x-2 inline-block font-semibold"
              >
                Cambios y devoluciones
              </Link>
            </li>
            <li>
              <Link
                to="/politicas#privacidad"
                className="link-underline transition-all hover:text-purple-600 hover:translate-x-2 inline-block font-semibold"
              >
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link
                to="/politicas#terminos"
                className="link-underline transition-all hover:text-purple-600 hover:translate-x-2 inline-block font-semibold"
              >
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link
                to="/politicas#cookies"
                className="link-underline transition-all hover:text-purple-600 hover:translate-x-2 inline-block font-semibold"
              >
                Preferencias de cookies
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Atención al Cliente
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li>
              <Link
                to="/contacto"
                className="transition-colors hover:text-primary"
              >
                Contáctanos
              </Link>
            </li>
            <li>
              <Link
                to="/cuenta"
                className="transition-colors hover:text-primary"
              >
                Mi cuenta
              </Link>
            </li>
            <li>
              <Link
                to="/carro"
                className="transition-colors hover:text-primary"
              >
                Carro de compras
              </Link>
            </li>
            <li>
              <Link
                to="/politicas#garantia"
                className="transition-colors hover:text-primary"
              >
                Garantía legal
              </Link>
            </li>
          </ul>
        </div>

        <div className="animate-fade-in" style={{animationDelay: '200ms'}}>
          <h3 className="text-base font-black text-gradient mb-6">
            🌟 Síguenos
          </h3>
          <p className="mt-4 text-sm text-neutral-700 font-medium leading-relaxed">
            Mantente al día con nuevos productos, promociones y tips de detailing profesional.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-black text-lg shadow-xl transition-all duration-300 hover:scale-125 hover:rotate-12 hover:shadow-2xl"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white font-black text-sm shadow-xl transition-all duration-300 hover:scale-125 hover:rotate-12 hover:shadow-2xl"
              aria-label="Instagram"
            >
              IG
            </a>
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white font-black text-sm shadow-xl transition-all duration-300 hover:scale-125 hover:rotate-12 hover:shadow-2xl"
              aria-label="TikTok"
            >
              TT
            </a>
          </div>
        </div>
      </div>
      <div className="relative border-t-2 border-transparent bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 py-6"
        style={{
          background: `linear-gradient(90deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1), rgba(240, 147, 251, 0.1)) padding-box, linear-gradient(90deg, #667eea, #764ba2, #f093fb) border-box`
        }}
      >
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center text-sm font-semibold sm:flex-row sm:px-6 lg:px-8">
          <p className="text-neutral-700">
            © {new Date().getFullYear()} <span className="text-gradient">JSP Detailing</span>. Todos los derechos reservados.
          </p>
          <p className="text-neutral-600 text-xs">
            🔒 Sitio protegido con cifrado SSL • Precios incluyen IVA (19%)
          </p>
        </div>
      </div>
    </footer>
  );
}

