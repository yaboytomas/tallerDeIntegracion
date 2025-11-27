import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { SearchAutocomplete } from "../search/SearchAutocomplete";

const navItems = [
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
    <header className="sticky top-0 z-50 glass shadow-lg transition-all duration-300 border-b-4 border-transparent" style={{
      background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea) border-box',
      backgroundSize: '300% 100%',
      animation: 'gradientShift 6s ease infinite'
    }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 animate-fade-in">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/jsp.jpg" 
              alt="JSP Detailing" 
              className="h-14 w-auto object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-2xl"
            />
            <div className="flex flex-col leading-none">
              <span className="text-base font-black text-gradient transition-all">
                JSP Detailing
              </span>
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                Premium
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "link-underline text-sm font-medium transition-all duration-300 hover:text-blue-600 animate-fade-in",
                  isActive ? "text-blue-600 font-semibold" : "text-neutral-700",
                ].join(" ")
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:block flex-1 max-w-lg mx-6">
          <SearchAutocomplete placeholder="Buscar productos..." />
        </div>

        <div className="hidden items-center gap-3 lg:flex animate-fade-in">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="group relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-purple-300 bg-gradient-to-br from-purple-100 to-purple-200 text-lg hover:border-purple-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:rotate-12"
                  title="Admin Dashboard"
                >
                  ⚙️
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-purple-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 pointer-events-none">
                    Admin
                  </span>
                </Link>
              )}
              <Link
                to="/cuenta"
                className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:-translate-y-0.5"
              >
                {user?.firstName}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 hover:-translate-y-0.5"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-300 bg-white text-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 hover:-translate-y-0.5 hover:scale-110"
                title="Iniciar sesión"
              >
                👤
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 pointer-events-none">
                  Iniciar sesión
                </span>
              </Link>
              <Link
                to="/registro"
                className="btn-premium rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:scale-105 border border-white/20"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'gradientShift 3s ease infinite'
                }}
              >
                ✨ Crear cuenta
              </Link>
            </>
          )}
          <Link
            to="/carro"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all duration-300"
            aria-label="Ver carrito"
          >
            <span className="text-lg">🛒</span>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-semibold text-white shadow-md animate-pulse-soft">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 hover:rotate-90 lg:hidden transition-all duration-300"
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
            className={`h-6 w-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}
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
          className="lg:hidden animate-slide-in-right"
        >
          <nav className="space-y-1 border-t border-neutral-200 bg-white px-4 py-4 shadow-lg">
            {/* Mobile Search */}
            <div className="pb-4 border-b border-neutral-200 mb-2">
              <SearchAutocomplete 
                placeholder="Buscar productos..." 
                onSearch={(query) => {
                  navigate(`/productos?search=${encodeURIComponent(query)}`);
                  setIsMenuOpen(false);
                }}
              />
            </div>
            
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
                      className="rounded-full border-2 border-purple-300 bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 text-center text-sm font-bold text-purple-700 hover:border-purple-400 hover:bg-purple-300 flex items-center justify-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-lg">⚙️</span>
                      <span>Admin Dashboard</span>
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

