import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../../services/api";
import { useState } from "react";

const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]{1}$/;

// Format RUT: 12345678-9 -> 12.345.678-9
function formatRUT(value: string): string {
  // Remove all non-numeric characters except K
  const cleaned = value.replace(/[^0-9kK]/g, '');
  
  if (cleaned.length === 0) return '';
  
  // Separate body and verifier digit
  const body = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1).toUpperCase();
  
  if (body.length === 0) return verifier;
  
  // Format body with dots
  const reversedBody = body.split('').reverse().join('');
  const formattedBody = reversedBody.match(/.{1,3}/g)?.join('.') || '';
  const finalBody = formattedBody.split('').reverse().join('');
  
  return `${finalBody}-${verifier}`;
}

// Format Phone: 912345678 -> +56 9 1234 5678
function formatPhone(value: string): string {
  // Remove all non-numeric characters
  const cleaned = value.replace(/[^0-9]/g, '');
  
  // If starts with 56, remove it (country code)
  let phone = cleaned;
  if (phone.startsWith('56')) {
    phone = phone.substring(2);
  }
  
  // Must start with 9 and have 9 digits total
  if (phone.length === 0) return '+56 9 ';
  if (!phone.startsWith('9')) return '+56 9 ';
  
  // Format: +56 9 XXXX XXXX
  if (phone.length <= 1) {
    return `+56 ${phone} `;
  } else if (phone.length <= 5) {
    return `+56 ${phone.slice(0, 1)} ${phone.slice(1)}`;
  } else {
    return `+56 ${phone.slice(0, 1)} ${phone.slice(1, 5)} ${phone.slice(5, 9)}`;
  }
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
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

  const handleRUTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRUT(e.target.value);
    setValue('rut', formatted, { shouldValidate: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue('phone', formatted, { shouldValidate: true });
  };

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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <header className="mb-12 text-center">
        <div className="inline-block text-6xl mb-4 animate-float">✨</div>
        <h1 className="heading-artistic mb-6">
          Crea tu Cuenta
        </h1>
        <p className="mt-4 text-lg text-neutral-700 max-w-2xl mx-auto leading-relaxed">
          🎁 Registra tus datos para acceder a beneficios, historial de pedidos y promociones exclusivas
        </p>
      </header>

      {success && (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 border-2 border-white/20 p-6 text-white shadow-2xl animate-scale-in">
          <p className="font-black text-xl flex items-center gap-2">
            <span>🎉</span> ¡Cuenta creada exitosamente!
          </p>
          <p className="text-sm mt-2 opacity-90">Te redirigiremos al login en un momento...</p>
        </div>
      )}

      {error && (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white/20 p-6 text-white shadow-2xl animate-scale-in">
          <p className="font-black text-xl flex items-center gap-2">
            <span>❌</span> Error al crear cuenta
          </p>
          <p className="text-sm mt-2 opacity-90">{error}</p>
        </div>
      )}

      <form
        className="card-premium space-y-8 rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl lg:p-12"
        style={{
          background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2, #f093fb) border-box`
        }}
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
              className="w-full rounded-xl border-2 border-neutral-200 px-5 py-4 text-sm shadow-sm outline-none transition-all duration-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:scale-105"
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
              className="w-full rounded-xl border-2 border-neutral-200 px-5 py-4 text-sm shadow-sm outline-none transition-all duration-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:scale-105"
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
              className="w-full rounded-xl border-2 border-neutral-200 px-5 py-4 text-sm shadow-sm outline-none transition-all duration-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:scale-105"
              placeholder="12.345.678-9"
              maxLength={12}
              {...register("rut")}
              onChange={handleRUTChange}
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
              className="w-full rounded-xl border-2 border-neutral-200 px-5 py-4 text-sm shadow-sm outline-none transition-all duration-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:scale-105"
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
              className="w-full rounded-xl border-2 border-neutral-200 px-5 py-4 text-sm shadow-sm outline-none transition-all duration-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:scale-105"
              placeholder="+56 9 1234 5678"
              maxLength={17}
              {...register("phone")}
              onChange={handlePhoneChange}
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full rounded-xl border-2 border-neutral-200 px-5 py-4 pr-12 text-sm shadow-sm outline-none transition-all duration-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:scale-105"
                placeholder="Crea una contraseña segura"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700" htmlFor="confirmPassword">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="w-full rounded-xl border-2 border-neutral-200 px-5 py-4 pr-12 text-sm shadow-sm outline-none transition-all duration-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:scale-105"
                placeholder="Repite tu contraseña"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
          className="btn-premium w-full rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-8 py-5 text-lg font-black text-white shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.8)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
          style={{
            backgroundSize: '200% 100%',
            animation: isSubmitting ? 'none' : 'gradientShift 3s ease infinite'
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-white border-r-transparent"></span>
              Creando cuenta...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>🚀</span>
              Crear cuenta
            </span>
          )}
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

