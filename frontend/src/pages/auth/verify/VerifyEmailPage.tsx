import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../../services/api";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no encontrado");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      await api.verifyEmail(token);
      setStatus("success");
      setMessage("¡Email verificado exitosamente!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.response?.data?.error || "Error al verificar email");
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Verificando tu email...
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Por favor espera un momento
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600">
              ¡Email Verificado!
            </h1>
            <p className="mt-2 text-sm text-neutral-600">{message}</p>
            <p className="mt-4 text-sm text-neutral-500">
              Redirigiendo al login...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="mt-2 text-sm text-neutral-600">{message}</p>
            <div className="mt-6 space-y-3">
              <Link
                to="/login"
                className="block w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Ir al Login
              </Link>
              <Link
                to="/"
                className="block text-sm text-primary hover:text-primary-dark"
              >
                Volver al inicio
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

