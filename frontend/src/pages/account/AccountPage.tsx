import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { useForm } from "react-hook-form";
import { formatCLP } from "../../utils/currency";
import { useSearchParams } from "react-router-dom";
import { UserOrderDetailModal } from "./UserOrderDetailModal";

export function AccountPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "password">(
    (searchParams.get("tab") as "profile" | "orders" | "password") || "profile"
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
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
    } catch (error: any) {
      // Silently handle 401 errors (user will be redirected by interceptor if needed)
      if (error?.response?.status !== 401) {
        console.error("Error loading profile:", error);
      }
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
    if (!confirm("¿Estás seguro de que quieres cancelar este pedido? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await api.cancelOrder(orderId);
      alert("✅ Pedido cancelado exitosamente. El stock ha sido restaurado.");
      loadOrders(); // Reload orders
    } catch (error: any) {
      alert(error.response?.data?.error || "❌ Error al cancelar pedido");
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

  const onPasswordSubmit = async (data: any) => {
    try {
      setChangingPassword(true);
      setPasswordMessage(null);
      await api.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordMessage("Contraseña actualizada exitosamente");
      resetPassword();
    } catch (error: any) {
      setPasswordMessage(error.response?.data?.error || "Error al cambiar contraseña");
    } finally {
      setChangingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
        <div className="rounded-3xl border-4 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-16 text-center shadow-xl">
          <div className="text-6xl mb-6">🔒</div>
          <p className="text-xl font-bold text-gradient mb-4">Acceso Restringido</p>
          <p className="text-neutral-600">Debes iniciar sesión para ver tu cuenta</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-6 text-lg font-semibold text-gradient">Cargando...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <header className="mb-12 text-center">
        <div className="inline-block text-6xl mb-4 animate-float">👤</div>
        <h1 className="heading-artistic mb-4">Mi Cuenta</h1>
        <p className="mt-4 text-lg text-neutral-600">
          ✨ Administra tu perfil y revisa tus pedidos
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-8 rounded-2xl bg-white shadow-lg p-2">
        <nav className="flex gap-2 max-w-3xl mx-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 rounded-xl px-6 py-4 text-sm font-bold transition-all duration-300 ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                : "text-neutral-600 hover:bg-purple-50 hover:text-purple-900"
            }`}
          >
            👤 Perfil
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 rounded-xl px-6 py-4 text-sm font-bold transition-all duration-300 ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                : "text-neutral-600 hover:bg-purple-50 hover:text-purple-900"
            }`}
          >
            📦 Pedidos
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 rounded-xl px-6 py-4 text-sm font-bold transition-all duration-300 ${
              activeTab === "password"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                : "text-neutral-600 hover:bg-purple-50 hover:text-purple-900"
            }`}
          >
            🔒 Contraseña
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="card-premium rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl animate-scale-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`
          }}
        >
          <h2 className="mb-8 text-2xl font-black text-gradient flex items-center gap-3">
            <span className="text-3xl">📝</span>
            Información Personal
          </h2>
          
          {message && (
            <div
              className={`mb-6 rounded-2xl p-5 shadow-lg animate-scale-in border-2 border-white/20 ${
                message.includes("exitosamente")
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
              }`}
            >
              <p className="font-bold">{message.includes("exitosamente") ? "✅" : "❌"} {message}</p>
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
                        className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-all hover:scale-105"
                      >
                        ❌ Cancelar pedido
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedOrderId(order._id)}
                      className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all hover:scale-105"
                    >
                      👁️ Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="card-premium rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl animate-scale-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #f093fb, #f5576c) border-box`
          }}
        >
          <h2 className="mb-8 text-2xl font-black text-gradient flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            Cambiar Contraseña
          </h2>
          
          {passwordMessage && (
            <div
              className={`mb-6 rounded-2xl p-5 shadow-lg animate-scale-in border-2 border-white/20 ${
                passwordMessage.includes("exitosamente")
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
              }`}
            >
              <p className="font-bold">{passwordMessage.includes("exitosamente") ? "✅" : "❌"} {passwordMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Contraseña Actual *
              </label>
              <input
                type="password"
                {...registerPassword("currentPassword", { 
                  required: "Contraseña actual es requerida" 
                })}
                className="w-full rounded-xl border-2 border-neutral-300 px-4 py-3 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                placeholder="Ingresa tu contraseña actual"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-2 text-sm text-red-600 font-semibold">
                  ⚠️ {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="border-t-2 border-purple-200 pt-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  {...registerPassword("newPassword", { 
                    required: "Nueva contraseña es requerida",
                    minLength: {
                      value: 8,
                      message: "La contraseña debe tener al menos 8 caracteres"
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: "Debe contener mayúsculas, minúsculas y números"
                    }
                  })}
                  className="w-full rounded-xl border-2 border-neutral-300 px-4 py-3 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  placeholder="Ingresa tu nueva contraseña"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-2 text-sm text-red-600 font-semibold">
                    ⚠️ {passwordErrors.newPassword.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-neutral-500">
                  ℹ️ Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Confirmar Nueva Contraseña *
              </label>
              <input
                type="password"
                {...registerPassword("confirmPassword", { 
                  required: "Confirma tu nueva contraseña",
                  validate: (value) => 
                    value === watch("newPassword") || "Las contraseñas no coinciden"
                })}
                className="w-full rounded-xl border-2 border-neutral-300 px-4 py-3 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                placeholder="Confirma tu nueva contraseña"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 font-semibold">
                  ⚠️ {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={changingPassword}
                className="btn-premium rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-8 py-4 text-base font-bold text-white shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                {changingPassword ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-white border-r-transparent"></span>
                    Cambiando...
                  </span>
                ) : (
                  "🔒 Cambiar Contraseña"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <UserOrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </section>
  );
}
