import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      setError(null);
      
      await login(data.email, data.password, data.remember || false);
      await refreshUser();
      
      // Redirect to previous page or home
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error || 
        err.message || 
        "Credenciales inválidas. Por favor intenta nuevamente."
      );
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-4xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full space-y-6">
        {location.state?.message && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
            <p className="font-medium">✓ Registro exitoso</p>
            <p className="text-sm mt-1">{location.state.message}</p>
          </div>
        )}

        <div className="grid w-full gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-neutral-900">
              Inicia sesión en tu cuenta
            </h1>
            <p className="text-sm text-neutral-600">
              Accede a tus pedidos, administra direcciones y sincroniza tu carro de compras.
            </p>
            <div className="rounded-3xl bg-primary/5 p-6 text-sm text-neutral-700">
              <p className="font-semibold text-primary">¿Nuevo en JSP Detailing?</p>
              <p className="mt-2">
                Crea tu cuenta y recibe consejos exclusivos de detailing, novedades y promociones especiales.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
                <p className="font-medium">Error al iniciar sesión</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            <form
              className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700" htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="tu.correo@ejemplo.cl"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-neutral-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary/30"
                    {...register("remember")}
                  />
                  Recuérdame
                </label>
                <Link
                  to="/recuperar-password"
                  className="font-semibold text-primary hover:text-primary-dark"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </button>

              <p className="text-center text-sm text-neutral-600">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/registro"
                  className="font-semibold text-primary hover:text-primary-dark"
                >
                  Regístrate aquí
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

