import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../services/api";
import { useState } from "react";

const contactFormSchema = z
  .object({
    type: z.enum(["quote", "pickup", "training", "general"]),
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre es demasiado largo"),
    email: z.string().email("Ingresa un correo electrónico válido"),
    phone: z
      .string()
      .regex(
        /^(\+56\s?)?[9]\s?\d{4}\s?\d{4}$/,
        "Formato válido: +56 9 XXXX XXXX o 9 XXXX XXXX"
      ),
    company: z.string().optional(),
    message: z
      .string()
      .min(10, "El mensaje debe tener al menos 10 caracteres")
      .max(1000, "El mensaje es demasiado largo"),
    preferredDate: z.string().optional(),
    preferredTime: z.string().optional(),
    address: z.string().optional(),
    numberOfParticipants: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const num = parseInt(val, 10);
          return !isNaN(num) && num > 0 && num <= 100;
        },
        { message: "Debe ser un número entre 1 y 100" }
      ),
  })
  .refine(
    (data) => {
      if (data.type === "pickup" && !data.address) {
        return false;
      }
      return true;
    },
    {
      message: "La dirección es requerida para agendar retiros",
      path: ["address"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "training" && !data.numberOfParticipants) {
        return false;
      }
      return true;
    },
    {
      message: "El número de participantes es requerido para capacitaciones",
      path: ["numberOfParticipants"],
    }
  );

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      type: "general",
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
      preferredDate: "",
      preferredTime: "",
      address: "",
      numberOfParticipants: "",
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: ContactFormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      await api.submitContactForm({
        type: data.type,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company || undefined,
        message: data.message,
        preferredDate: data.preferredDate || undefined,
        preferredTime: data.preferredTime || undefined,
        address: data.address || undefined,
        numberOfParticipants: data.numberOfParticipants
          ? parseInt(data.numberOfParticipants, 10)
          : undefined,
      });

      setSubmitSuccess(true);
      reset();

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error("Contact form error:", error);
      setSubmitError(
        error.response?.data?.error ||
          error.message ||
          "Error al enviar solicitud. Por favor intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = [
    {
      value: "quote",
      label: "💰 Cotización",
      description: "Solicita una cotización personalizada",
    },
    {
      value: "pickup",
      label: "🚚 Agendar Retiro",
      description: "Coordina el retiro de productos",
    },
    {
      value: "training",
      label: "🎓 Capacitación",
      description: "Solicita una capacitación",
    },
    {
      value: "general",
      label: "📧 Consulta General",
      description: "Otra consulta o información",
    },
  ];

  return (
    <section className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <header className="text-center">
        <div className="inline-block text-6xl mb-6 animate-float">📞</div>
        <h1 className="heading-artistic mb-6">Contáctanos</h1>
        <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
          ✨ Estamos aquí para asesorarte en productos, pedidos y capacitaciones
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Information Card */}
        <div
          className="card-premium rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl animate-scale-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`,
            animationDelay: "100ms",
          }}
        >
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-purple-100 to-pink-100">
            <h2 className="text-xl font-black text-gradient">
              📧 Información de Contacto
            </h2>
          </div>
          <ul className="mt-6 space-y-4 text-neutral-700">
            <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all">
              <span className="text-2xl">📱</span>
              <div>
                <div className="font-bold text-purple-900">Teléfono</div>
                <div className="text-sm mt-1">+56930828558</div>
                <div className="text-xs text-neutral-500 mt-1">
                  Lun-Vie 09:00 a 18:00
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all">
              <span className="text-2xl">📧</span>
              <div>
                <div className="font-bold text-purple-900">Correo Electrónico</div>
                <div className="text-sm mt-1">jspdetailing627@gmail.com</div>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all">
              <span className="text-2xl">📍</span>
              <div>
                <div className="font-bold text-purple-900">Dirección</div>
                <div className="text-sm mt-1">Adelaida 4042, Maipú</div>
              </div>
            </li>
          </ul>
        </div>

        {/* Contact Form Card */}
        <div
          className="card-premium rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl animate-scale-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`,
            animationDelay: "200ms",
          }}
        >
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-purple-100 to-pink-100">
            <h2 className="text-xl font-black text-gradient">✉️ Formulario</h2>
          </div>

          {submitSuccess && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 border-2 border-white/20 p-4 text-white shadow-xl animate-scale-in">
              <p className="font-bold flex items-center gap-2">
                <span>✅</span> ¡Solicitud enviada exitosamente!
              </p>
              <p className="text-sm mt-1 opacity-90">
                Te contactaremos dentro de las próximas 24 horas.
              </p>
            </div>
          )}

          {submitError && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white/20 p-4 text-white shadow-xl animate-scale-in">
              <p className="font-bold flex items-center gap-2">
                <span>❌</span> Error al enviar solicitud
              </p>
              <p className="text-sm mt-1 opacity-90">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Request Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tipo de Solicitud *
              </label>
              <select
                {...register("type")}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.type
                    ? "border-red-500 focus:ring-red-500"
                    : "border-neutral-300 focus:ring-purple-500"
                }`}
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                {...register("name")}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-neutral-300 focus:ring-purple-500"
                }`}
                placeholder="Juan Pérez"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                {...register("email")}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-neutral-300 focus:ring-purple-500"
                }`}
                placeholder="juan@ejemplo.cl"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                {...register("phone")}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? "border-red-500 focus:ring-red-500"
                    : "border-neutral-300 focus:ring-purple-500"
                }`}
                placeholder="+56 9 1234 5678"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Company (Optional) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Empresa (Opcional)
              </label>
              <input
                type="text"
                {...register("company")}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Nombre de tu empresa"
              />
            </div>

            {/* Address (Required for pickup) */}
            {selectedType === "pickup" && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dirección de Retiro *
                </label>
                <input
                  type="text"
                  {...register("address")}
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                    errors.address
                      ? "border-red-500 focus:ring-red-500"
                      : "border-neutral-300 focus:ring-purple-500"
                  }`}
                  placeholder="Calle, número, comuna"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>
            )}

            {/* Preferred Date and Time */}
            {(selectedType === "pickup" || selectedType === "training") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Fecha Preferida
                  </label>
                  <input
                    type="date"
                    {...register("preferredDate")}
                    className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Hora Preferida
                  </label>
                  <input
                    type="time"
                    {...register("preferredTime")}
                    className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Number of Participants (Required for training) */}
            {selectedType === "training" && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Número de Participantes *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  {...register("numberOfParticipants")}
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                    errors.numberOfParticipants
                      ? "border-red-500 focus:ring-red-500"
                      : "border-neutral-300 focus:ring-purple-500"
                  }`}
                  placeholder="Ej: 10"
                />
                {errors.numberOfParticipants && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.numberOfParticipants.message}
                  </p>
                )}
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Mensaje *
              </label>
              <textarea
                {...register("message")}
                rows={5}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 resize-none ${
                  errors.message
                    ? "border-red-500 focus:ring-red-500"
                    : "border-neutral-300 focus:ring-purple-500"
                }`}
                placeholder={
                  selectedType === "quote"
                    ? "Describe los productos o servicios que necesitas cotizar..."
                    : selectedType === "pickup"
                    ? "Indica detalles adicionales sobre el retiro..."
                    : selectedType === "training"
                    ? "Describe el tipo de capacitación que necesitas..."
                    : "Escribe tu consulta o mensaje..."
                }
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Enviando...
                </span>
              ) : (
                "Enviar Solicitud"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
