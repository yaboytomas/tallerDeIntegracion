import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold text-neutral-900">404</h1>
      <p className="mt-4 text-lg text-neutral-600">
        Lo sentimos, la página que buscas no está disponible o fue movida.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
      >
        Volver al inicio
      </Link>
    </section>
  );
}

