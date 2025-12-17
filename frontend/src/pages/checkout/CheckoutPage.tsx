import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatCLP } from "../../utils/currency";
import { useForm } from "react-hook-form";
import { api } from "../../services/api";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      region: "",
      comuna: "",
      street: "",
      number: "",
      apartment: "",
      reference: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      navigate("/carro");
    }
  }, [cart, cartLoading, navigate]);

  const onSubmit = async (data: any) => {
    try {
      setProcessing(true);
      
      const shippingAddress = {
        region: data.region,
        comuna: data.comuna,
        street: data.street,
        number: data.number,
        apartment: data.apartment,
        reference: data.reference,
        phone: data.phone,
      };

      const orderData = {
        shippingAddress,
        paymentMethod: 'pending', // TODO: Implement payment gateway
      };

      const result = await api.createOrder(orderData);
      
      // Refresh cart context to reflect empty cart
      refreshCart();
      
      alert(`¡Pedido creado exitosamente! Número de orden: ${result.order.orderNumber}`);
      navigate("/cuenta?tab=orders");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Error al procesar pedido";
      
      // If products are no longer available, refresh cart and redirect
      if (errorMessage.includes('ya no están disponibles') || errorMessage.includes('han sido eliminados')) {
        alert(errorMessage);
        await refreshCart(); // Reload cart to show updated items
        navigate("/carro");
      } else {
        alert(errorMessage);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (cartLoading || !cart || cart.items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">Cargando...</div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Checkout</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Completa tu información para finalizar tu pedido.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
        {/* Shipping Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Información de Envío
            </h2>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Región *</label>
                  <input
                    {...register("region", { required: "Región es requerida" })}
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                  />
                  {errors.region && (
                    <p className="mt-1 text-xs text-red-600">{errors.region.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700">Comuna *</label>
                  <input
                    {...register("comuna", { required: "Comuna es requerida" })}
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                  />
                  {errors.comuna && (
                    <p className="mt-1 text-xs text-red-600">{errors.comuna.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">Calle *</label>
                <input
                  {...register("street", { required: "Calle es requerida" })}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
                {errors.street && (
                  <p className="mt-1 text-xs text-red-600">{errors.street.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Número *</label>
                  <input
                    {...register("number", { required: "Número es requerido" })}
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                  />
                  {errors.number && (
                    <p className="mt-1 text-xs text-red-600">{errors.number.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Departamento (opcional)
                  </label>
                  <input
                    {...register("apartment")}
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Referencia (opcional)
                </label>
                <input
                  {...register("reference")}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Teléfono de contacto *
                </label>
                <input
                  type="tel"
                  placeholder="+56912345678 o 912345678"
                  {...register("phone", { 
                    required: "Teléfono es requerido",
                    pattern: {
                      value: /^(\+?56)?[2-9]\d{8}$/,
                      message: "Formato inválido. Usa +56912345678 o 912345678"
                    },
                    validate: (value) => {
                      // Remove spaces and dashes
                      const cleanValue = value.replace(/[\s-]/g, '');
                      // Check if it matches Chilean format
                      if (!/^(\+?56)?[2-9]\d{8}$/.test(cleanValue)) {
                        return "Número de teléfono chileno inválido";
                      }
                      return true;
                    }
                  })}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">
                  Formato: +56912345678 (móvil) o +56221234567 (fijo)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">Resumen del Pedido</h2>

            <div className="mb-4 space-y-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-neutral-600">
                    {item.product.name} x{item.quantity}
                  </span>
                  <span className="font-medium">{formatCLP(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">{formatCLP(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">IVA (19%)</span>
                <span className="font-medium">{formatCLP(cart.iva)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-lg font-bold text-primary">
                  {formatCLP(cart.total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? "Procesando..." : "Confirmar Pedido"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
