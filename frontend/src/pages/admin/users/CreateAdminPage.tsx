import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]{1}$/;

const createAdminSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres").max(50),
  lastName: z.string().min(2, "Mínimo 2 caracteres").max(50),
  rut: z.string().regex(rutRegex, "Formato válido: XX.XXX.XXX-X"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(/^\+56 9 [0-9]{4} [0-9]{4}$/, "Formato: +56 9 XXXX XXXX"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Las contraseñas no coinciden",
});

type CreateAdminFormValues = z.infer<typeof createAdminSchema>;

export function CreateAdminPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      rut: "",
      email: "",
      phone: "+56 9 ",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: CreateAdminFormValues) => {
    try {
      setError(null);
      setSuccess(false);

      await api.createAdminUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        rut: data.rut,
        phone: data.phone,
      });

      setSuccess(true);
      reset();

      setTimeout(() => {
        navigate("/admin/users");
      }, 2000);
    } catch (err: any) {
      console.error("Create admin error:", err);
      setError(err.response?.data?.error || "Error al crear administrador");
    }
  };

  if (!isAdmin) {
    return <div>No autorizado</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/users")}
          className="mb-4 text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Volver a usuarios
        </button>
        <h1 className="text-3xl font-bold text-neutral-900">Crear Nuevo Administrador</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Crea una cuenta de administrador con acceso completo al panel
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          <p className="font-medium">✓ Administrador creado exitosamente</p>
          <p className="mt-1 text-sm">Redirigiendo a la lista de usuarios...</p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Error al crear administrador</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-lg border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Nombre *
            </label>
            <input
              type="text"
              {...register("firstName")}
              className="mt-1 w-full rounded-md border border-neutral-300 px-4 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Juan"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Apellido *
            </label>
            <input
              type="text"
              {...register("lastName")}
              className="mt-1 w-full rounded-md border border-neutral-300 px-4 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Pérez"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">RUT *</label>
            <input
              type="text"
              {...register("rut")}
              className="mt-1 w-full rounded-md border border-neutral-300 px-4 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="12.345.678-9"
            />
            {errors.rut && (
              <p className="mt-1 text-xs text-red-600">{errors.rut.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Teléfono *
            </label>
            <input
              type="tel"
              {...register("phone")}
              className="mt-1 w-full rounded-md border border-neutral-300 px-4 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="+56 9 1234 5678"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Email *</label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 w-full rounded-md border border-neutral-300 px-4 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="admin@jspdetailing.cl"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Contraseña *
            </label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-md border border-neutral-300 px-4 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Mínimo 8 caracteres"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="mt-1 w-full rounded-md border border-neutral-300 px-4 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Repite la contraseña"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> El usuario creado tendrá rol de administrador con
            acceso completo al panel administrativo. La cuenta quedará verificada
            automáticamente.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
          >
            {isSubmitting ? "Creando..." : "Crear Administrador"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
