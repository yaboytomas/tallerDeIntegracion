import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../../services/api";
import { useState } from "react";

const forgotSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

type ForgotPasswordValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      setError(null);
      setSuccess(false);
      await api.forgotPassword(values.email);
      setSuccess(true);
    } catch (err: any) {
      // Don't show error - API returns success even if email doesn't exist (security)
      setSuccess(true);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-900">
          Recupera tu contraseña
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Te enviaremos un enlace válido por 15 minutos para restablecer tu contraseña.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="tu.correo@ejemplo.cl"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
              Si el correo existe, se enviará un enlace de recuperación. Revisa tu correo y la carpeta de spam.
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
            disabled={isSubmitting || success}
          >
            {isSubmitting ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      </div>
    </section>
  );
}

