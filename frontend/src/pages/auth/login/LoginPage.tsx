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
    <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-4xl items-center px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="w-full space-y-8">
        {location.state?.message && (
          <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 border-2 border-white/20 p-5 text-white shadow-xl animate-scale-in">
            <p className="font-black text-lg">✓ ¡Registro exitoso!</p>
            <p className="text-sm mt-1 opacity-90">{location.state.message}</p>
          </div>
        )}

        <div className="grid w-full gap-12 lg:grid-cols-2">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-block text-6xl mb-4 animate-float">🔐</div>
            <h1 className="heading-artistic">
              Inicia Sesión
            </h1>
            <p className="text-lg text-neutral-700 leading-relaxed">
              ✨ Accede a tus pedidos, administra direcciones y sincroniza tu carro de compras.
            </p>
            <div className="card-premium rounded-3xl border-2 border-transparent bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6 shadow-xl"
              style={{
                background: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 20%, #fff 50%, #ffeef8 80%, #f5f7fa 100%) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`
              }}
            >
              <div className="badge-artistic inline-block mb-3">
                ✨ ¿Nuevo aquí?
              </div>
              <p className="text-neutral-700 leading-relaxed">
                Crea tu cuenta y recibe consejos exclusivos de detailing, novedades y promociones especiales.
              </p>
              <Link
                to="/registro"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gradient link-underline"
              >
                Crear cuenta ahora →
              </Link>
            </div>
          </div>

          <div className="space-y-6 animate-fade-in" style={{animationDelay: '200ms'}}>
            {error && (
              <div className="rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white/20 p-5 text-white shadow-xl animate-scale-in">
                <p className="font-black text-lg">❌ Error al iniciar sesión</p>
                <p className="text-sm mt-1 opacity-90">{error}</p>
              </div>
            )}

            <form
              className="card-premium space-y-6 rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl"
              style={{
                background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2, #f093fb) border-box`
              }}
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
                  className="w-full rounded-xl border-2 border-neutral-200 px-5 py-4 text-sm shadow-sm outline-none transition-all duration-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:scale-105"
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
                  className="w-full rounded-xl border-2 border-neutral-200 px-5 py-4 text-sm shadow-sm outline-none transition-all duration-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:scale-105"
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
                className="btn-premium w-full rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-6 py-4 text-base font-black text-white shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.8)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
                style={{
                  backgroundSize: '200% 100%',
                  animation: isSubmitting ? 'none' : 'gradientShift 3s ease infinite'
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-white border-r-transparent"></span>
                    Ingresando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🚀</span>
                    Ingresar
                  </span>
                )}
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

