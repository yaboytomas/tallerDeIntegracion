import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/productos", label: "Productos" },
  { to: "/quienes-somos", label: "Quiénes Somos" },
  { to: "/politicas", label: "Políticas" },
  { to: "/contacto", label: "Contacto" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
              JSP
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold text-neutral-900">
                JSP Detailing
              </span>
              <span className="text-xs text-neutral-500">
                Cuidado automotriz profesional
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-neutral-600",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="rounded-full border border-purple-200 px-4 py-2 text-sm font-medium text-purple-700 hover:border-purple-300 hover:bg-purple-50"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/cuenta"
                className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-primary hover:text-primary"
              >
                {user?.firstName}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-primary hover:text-primary"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-primary hover:text-primary"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
              >
                Crear cuenta
              </Link>
            </>
          )}
          <Link
            to="/carro"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary"
            aria-label="Ver carrito"
          >
            <span className="text-lg">🛒</span>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-secondary text-xs font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary lg:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <span className="sr-only">Abrir menú</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 5.25h16.5M3.75 12h16.5M3.75 18.75h16.5"
            />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden"
        >
          <nav className="space-y-1 border-t border-neutral-200 bg-white px-4 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-neutral-700 hover:bg-neutral-100",
                  ].join(" ")
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            <div className="flex flex-col gap-2 pt-2">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="rounded-full border border-purple-200 px-4 py-2 text-center text-sm font-medium text-purple-700 hover:border-purple-300 hover:bg-purple-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Panel Admin
                    </Link>
                  )}
                  <Link
                    to="/cuenta"
                    className="rounded-full border border-neutral-200 px-4 py-2 text-center text-sm font-medium text-neutral-700 hover:border-primary hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi Cuenta
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="rounded-full border border-neutral-200 px-4 py-2 text-center text-sm font-medium text-neutral-700 hover:border-primary hover:text-primary"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full border border-neutral-200 px-4 py-2 text-center text-sm font-medium text-neutral-700 hover:border-primary hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
              <Link
                to="/carro"
                className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-primary hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>🛒</span>
                <span>Carro</span>
                {itemCount > 0 && (
                  <span className="ml-auto inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

