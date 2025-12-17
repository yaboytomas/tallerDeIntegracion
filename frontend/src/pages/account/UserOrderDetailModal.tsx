import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCLP } from '../../utils/currency';
import type { Order } from '../../types';

interface UserOrderDetailModalProps {
  orderId: string;
  onClose: () => void;
}

export function UserOrderDetailModal({ orderId, onClose }: UserOrderDetailModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await api.getOrder(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
      alert('Error al cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳ Pendiente';
      case 'processing':
        return '⚙️ Procesando';
      case 'shipped':
        return '🚚 Enviado';
      case 'delivered':
        return '✅ Entregado';
      case 'cancelled':
        return '❌ Cancelado';
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳ Pendiente';
      case 'paid':
        return '✅ Pagado';
      case 'failed':
        return '❌ Fallido';
      case 'refunded':
        return '↩️ Reembolsado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-4xl rounded-3xl bg-white p-12 shadow-2xl">
          <div className="text-center">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            <p className="mt-6 text-lg font-semibold text-gradient">Cargando pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-neutral-200 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-white">
                Pedido #{order.orderNumber}
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Creado el {new Date(order.createdAt).toLocaleDateString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-white/20 px-4 py-2 font-bold text-white transition-all hover:bg-white/30 hover:scale-110"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Status Section */}
          <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-black text-gradient">Estado del Pedido</h3>
            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
              <span className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold ${
                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'
              }`}>
                Pago: {getPaymentStatusLabel(order.paymentStatus)}
              </span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-black text-gradient flex items-center gap-2">
              <span className="text-2xl">📍</span>
              Dirección de Envío
            </h3>
            <div className="space-y-3">
              <p className="text-lg font-bold text-neutral-900">
                {order.shippingAddress.street} {order.shippingAddress.number}
                {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
              </p>
              <p className="text-neutral-700">
                {order.shippingAddress.comuna}, {order.shippingAddress.region}
              </p>
              {order.shippingAddress.reference && (
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold">Referencia:</span> {order.shippingAddress.reference}
                </p>
              )}
              <p className="text-neutral-700">
                <span className="font-semibold">Teléfono:</span> {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-black text-gradient flex items-center gap-2">
              <span className="text-2xl">📦</span>
              Productos ({order.items.length})
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-xl bg-white p-4 shadow-md border-2 border-transparent hover:border-orange-300 transition-all"
                >
                  {item.productId?.images?.[0] && (
                    <img
                      src={getImageUrl(item.productId.images[0])}
                      alt={item.productId.name || item.name || 'Producto'}
                      className="h-20 w-20 rounded-lg object-cover shadow-md"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-900">
                      {item.productId?.name || item.name || 'Producto'}
                    </h4>
                    {item.variantId && (
                      <p className="text-sm text-neutral-600">
                        Variante: {item.variantId.name} - {item.variantId.value}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-neutral-600">
                      SKU: {item.productId?.sku || item.sku || 'N/A'}
                    </p>
                    <p className="mt-2 text-sm font-bold text-neutral-900">
                      Cantidad: {item.quantity} × {formatCLP(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-gradient">
                      {formatCLP(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-black text-gradient flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Resumen del Pedido
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-neutral-700">Subtotal:</span>
                <span className="font-bold text-neutral-900">{formatCLP(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-neutral-700">IVA (19%):</span>
                <span className="font-bold text-neutral-900">{formatCLP(order.iva)}</span>
              </div>
              {order.shipping > 0 && (
                <div className="flex justify-between text-lg">
                  <span className="text-neutral-700">Envío:</span>
                  <span className="font-bold text-neutral-900">{formatCLP(order.shipping)}</span>
                </div>
              )}
              <div className="border-t-2 border-purple-300 pt-3">
                <div className="flex justify-between text-2xl">
                  <span className="font-black text-gradient">Total:</span>
                  <span className="font-black text-gradient">{formatCLP(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

