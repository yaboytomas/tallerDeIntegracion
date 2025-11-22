import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../../services/api";
import { useState } from "react";

const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]{1}$/;

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Ingresa tu nombre")
      .max(50, "Nombre demasiado largo"),
    lastName: z
      .string()
      .min(2, "Ingresa tu apellido")
      .max(50, "Apellido demasiado largo"),
    rut: z
      .string()
      .regex(rutRegex, "Formato válido: XX.XXX.XXX-X"),
    email: z.string().email("Ingresa un correo válido"),
    phone: z
      .string()
      .regex(/^\+56 9 [0-9]{4} [0-9]{4}$/, "Formato válido: +56 9 XXXX XXXX"),
    password: z
      .string()
      .min(8, "Debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Incluye al menos una mayúscula")
      .regex(/[0-9]/, "Incluye al menos un número")
      .regex(/[^A-Za-z0-9]/, "Incluye al menos un carácter especial"),
    confirmPassword: z.string(),
    agreeTerms: z
      .boolean()
      .refine((value) => value, {
        message: "Debes aceptar los términos y condiciones",
      }),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Las contraseñas deben coincidir",
    },
  );

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      rut: "",
      email: "",
      phone: "+56 9 ",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      setError(null);
      setSuccess(false);
      
      await api.register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        rut: values.rut,
        phone: values.phone,
        agreeTerms: values.agreeTerms,
      });

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login", { 
          state: { message: "Cuenta creada exitosamente. Por favor verifica tu correo electrónico." }
        });
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.error || 
        err.message || 
        "Error al crear cuenta. Por favor intenta nuevamente."
      );
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-neutral-900">
          Crea tu cuenta JSP Detailing
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Registra tus datos para acceder a beneficios, historial de pedidos y promociones exclusivas.
        </p>
      </header>

      {success && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          <p className="font-medium">¡Cuenta creada exitosamente!</p>
          <p className="text-sm mt-1">Te redirigiremos al login en un momento...</p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          <p className="font-medium">Error al crear cuenta</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <form
        className="space-y-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm lg:p-10"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="firstName">
              Nombre
            </label>
            <input
              id="firstName"
              type="text"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Ej: Juan"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-xs text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="lastName">
              Apellido
            </label>
            <input
              id="lastName"
              type="text"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Ej: Pérez"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="rut">
              RUT
            </label>
            <input
              id="rut"
              type="text"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="12.345.678-9"
              {...register("rut")}
            />
            {errors.rut && <p className="text-xs text-red-600">{errors.rut.message}</p>}
          </div>

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

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="phone">
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="+56 9 1234 5678"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Crea una contraseña segura"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="confirmPassword">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Repite tu contraseña"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
          <label className="inline-flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary/30"
              {...register("agreeTerms")}
            />
            <span>
              Acepto los{" "}
              <Link to="/politicas#terminos" className="font-semibold text-primary hover:underline">
                términos y condiciones
              </Link>
              ,{" "}
              <Link to="/politicas#privacidad" className="font-semibold text-primary hover:underline">
                política de privacidad
              </Link>{" "}
              y confirmo que mi información es verídica.
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-xs text-red-600">{errors.agreeTerms.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="text-center text-sm text-neutral-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
            Inicia sesión aquí
          </Link>
        </p>
      </form>
    </div>
  );
}

