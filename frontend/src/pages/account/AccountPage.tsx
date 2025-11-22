import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { useForm } from "react-hook-form";
import { formatCLP } from "../../utils/currency";
import { useSearchParams } from "react-router-dom";

export function AccountPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "orders">(
    (searchParams.get("tab") as "profile" | "addresses" | "orders") || "profile"
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      rut: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile();
      if (activeTab === "orders") {
        loadOrders();
      }
    }
  }, [isAuthenticated, user, activeTab]);

  const loadProfile = async () => {
    try {
      const profile = await api.getProfile();
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        rut: profile.rut,
        phone: profile.phone,
        email: profile.email,
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await api.getUserOrders({ page: 1, limit: 20 });
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("¿Estás seguro de que quieres cancelar este pedido?")) {
      return;
    }

    try {
      await api.cancelOrder(orderId);
      setMessage("Pedido cancelado exitosamente");
      loadOrders(); // Reload orders
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Error al cancelar pedido");
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setSaving(true);
      setMessage(null);
      await api.updateProfile(data);
      setMessage("Perfil actualizado exitosamente");
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <p className="text-neutral-600">Debes iniciar sesión para ver tu cuenta</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">Cargando...</div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Mi Cuenta</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Administra tu perfil, direcciones y revisa tus pedidos.
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-6 border-b border-neutral-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === "addresses"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Direcciones
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Pedidos
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold text-neutral-900">Información Personal</h2>
          
          {message && (
            <div
              className={`mb-4 rounded-lg p-4 ${
                message.includes("exitosamente")
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Nombre</label>
                <input
                  {...register("firstName", { required: "Nombre es requerido" })}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">Apellido</label>
                <input
                  {...register("lastName", { required: "Apellido es requerido" })}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">RUT</label>
                <input
                  {...register("rut", { required: "RUT es requerido" })}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
                {errors.rut && (
                  <p className="mt-1 text-xs text-red-600">{errors.rut.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">Teléfono</label>
                <input
                  {...register("phone", { required: "Teléfono es requerido" })}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  disabled
                  className="mt-1 w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  El email no se puede cambiar
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === "addresses" && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Direcciones</h2>
            <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
              Agregar dirección
            </button>
          </div>
          <p className="text-sm text-neutral-600">
            Funcionalidad de direcciones próximamente disponible.
          </p>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Historial de Pedidos</h2>
          
          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <div className="text-neutral-600">Cargando pedidos...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-600 mb-4">No tienes pedidos aún</p>
              <a
                href="/productos"
                className="inline-block rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Explorar productos
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        Pedido #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {new Date(order.createdAt).toLocaleDateString("es-CL")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-neutral-900">
                        {formatCLP(order.total)}
                      </div>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "shipped"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status === "pending"
                          ? "Pendiente"
                          : order.status === "processing"
                          ? "Procesando"
                          : order.status === "shipped"
                          ? "Enviado"
                          : order.status === "delivered"
                          ? "Entregado"
                          : "Cancelado"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-neutral-600 mb-2">
                      {order.items.length} producto{order.items.length > 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {order.items.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          {item.productId?.images?.[0] && (
                            <img
                              src={item.productId.images[0]}
                              alt={item.productId?.name || "Producto"}
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                          <span className="text-sm text-neutral-700 truncate">
                            {item.productId?.name || "Producto"} x{item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-sm text-neutral-600">
                          +{order.items.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Cancelar pedido
                      </button>
                    )}
                    <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
