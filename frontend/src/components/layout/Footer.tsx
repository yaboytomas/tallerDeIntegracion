import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
              JSP
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold text-neutral-900">
                JSP Detailing
              </span>
              <span className="text-xs text-neutral-500">
                RUT: 76.123.456-7
              </span>
            </div>
          </div>
          <p className="text-sm text-neutral-600">
            Productos y servicios profesionales para el cuidado automotriz en
            Chile.
          </p>
          <ul className="mt-4 space-y-1 text-sm text-neutral-500">
            <li>Dirección: Av. Las Palmeras 1234, Santiago</li>
            <li>Teléfono: +56 9 1234 5678</li>
            <li>Email: contacto@jspdetailing.cl</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Información Legal
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li>
              <Link
                to="/politicas#envios"
                className="transition-colors hover:text-primary"
              >
                Política de envíos
              </Link>
            </li>
            <li>
              <Link
                to="/politicas#devoluciones"
                className="transition-colors hover:text-primary"
              >
                Cambios y devoluciones
              </Link>
            </li>
            <li>
              <Link
                to="/politicas#privacidad"
                className="transition-colors hover:text-primary"
              >
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link
                to="/politicas#terminos"
                className="transition-colors hover:text-primary"
              >
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link
                to="/politicas#cookies"
                className="transition-colors hover:text-primary"
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

        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Síguenos
          </h3>
          <p className="mt-4 text-sm text-neutral-600">
            Mantente al día con nuevos productos, promociones y tips de
            detailing profesional.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-primary hover:text-primary"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-primary hover:text-primary"
              aria-label="Instagram"
            >
              IG
            </a>
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-primary hover:text-primary"
              aria-label="TikTok"
            >
              TT
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-200 bg-neutral-50 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center text-xs text-neutral-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} JSP Detailing. Todos los derechos reservados.</p>
          <p>Sitio protegido con cifrado SSL • Precios incluyen IVA (19%).</p>
        </div>
      </div>
    </footer>
  );
}

