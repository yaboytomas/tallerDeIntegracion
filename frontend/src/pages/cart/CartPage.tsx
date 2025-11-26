import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { getImageUrl } from "../../utils/imageUrl";
import { formatCLP } from "../../utils/currency";
import { api } from "../../services/api";

export function CartPage() {
  const navigate = useNavigate();
  const { cart, loading, updateCartItem, removeFromCart } = useCart();
  const [updating, setUpdating] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submittingQuote, setSubmittingQuote] = useState(false);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemove(itemId);
      return;
    }

    try {
      setUpdating(itemId);
      await updateCartItem(itemId, newQuantity);
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al actualizar cantidad");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!confirm("¿Eliminar este producto del carrito?")) return;

    try {
      setUpdating(itemId);
      await removeFromCart(itemId);
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al eliminar producto");
    } finally {
      setUpdating(null);
    }
  };

  const handleRequestQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quoteForm.name || !quoteForm.email || !quoteForm.phone) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setSubmittingQuote(true);
      await api.requestQuotation(quoteForm);
      alert("¡Cotización solicitada! Te contactaremos pronto.");
      setShowQuoteModal(false);
      setQuoteForm({ name: "", email: "", phone: "", message: "" });
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al solicitar cotización");
    } finally {
      setSubmittingQuote(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-6 text-lg font-semibold text-gradient">Cargando tu carrito...</p>
        </div>
      </section>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
        <header className="mb-12 text-center">
          <h1 className="heading-artistic mb-4">🛒 Tu Carrito</h1>
          <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">
            Guardamos tus productos con precios en CLP y stock garantizado
          </p>
        </header>

        <div className="rounded-3xl border-4 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-16 text-center shadow-xl animate-scale-in">
          <div className="text-6xl mb-6 animate-float">🛍️</div>
          <p className="text-lg text-neutral-700 font-semibold mb-2">
            Tu carrito está vacío
          </p>
          <p className="text-neutral-500 mb-8">
            Explora nuestras categorías y encuentra productos increíbles
          </p>
          <Link
            to="/productos"
            className="btn-premium inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-8 py-4 text-base font-bold text-white shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.6)] transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
            style={{
              backgroundSize: '200% 100%',
              animation: 'gradientShift 3s ease infinite'
            }}
          >
            <span>✨</span>
            Ver Catálogo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <header className="mb-12 text-center">
        <h1 className="heading-artistic mb-4">🛒 Tu Carrito</h1>
        <p className="mt-4 text-lg">
          <span className="badge-artistic inline-block">
            {cart.items.length} {cart.items.length === 1 ? 'producto' : 'productos'}
          </span>
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item, index) => (
            <div
              key={item.id}
              className="card-premium flex gap-4 rounded-2xl border-2 border-transparent bg-white p-6 shadow-xl animate-fade-in"
              style={{
                animationDelay: `${index * 100}ms`,
                background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`
              }}
            >
              {item.product.images && item.product.images.length > 0 && (
                <div className="overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
                  <img
                    src={getImageUrl(item.product.images[0])}
                    alt={item.product.name}
                    className="h-28 w-28 object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
              )}
              <div className="flex-1">
                <Link
                  to={`/productos/${item.product.slug}`}
                  className="font-bold text-lg text-neutral-900 hover:text-gradient transition-all"
                >
                  {item.product.name}
                </Link>
                {item.variant && (
                  <p className="text-sm font-semibold text-purple-600 mt-1">
                    {item.variant.name}: {item.variant.value}
                  </p>
                )}
                <p className="mt-1 text-xs text-neutral-500 font-medium">SKU: {item.product.sku}</p>
                <p className="mt-3 text-lg font-bold text-gradient">
                  {formatCLP(item.price)} <span className="text-xs text-neutral-500 font-normal">c/u</span>
                </p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-2xl font-bold text-red-500 hover:text-red-700 hover:scale-125 transition-all duration-300 hover:rotate-90"
                  disabled={updating === item.id}
                  title="Eliminar producto"
                >
                  ×
                </button>
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full p-1">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={updating === item.id || item.quantity <= 1}
                    className="h-10 w-10 rounded-full bg-white border-2 border-purple-300 font-bold text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-purple-600 transition-all duration-300 hover:scale-110"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-base font-bold text-purple-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={updating === item.id || item.quantity >= item.stock}
                    className="h-10 w-10 rounded-full bg-white border-2 border-purple-300 font-bold text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-purple-600 transition-all duration-300 hover:scale-110"
                  >
                    +
                  </button>
                </div>
                <div className="mt-3 price-artistic text-xl">
                  {formatCLP(item.subtotal)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">Resumen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">{formatCLP(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">IVA (19%)</span>
                <span className="font-medium">{formatCLP(cart.iva)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCLP(cart.total)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
            >
              Proceder al Checkout
            </button>
            <button
              onClick={() => setShowQuoteModal(true)}
              className="mt-3 w-full rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              Solicitar Cotización
            </button>
            <Link
              to="/productos"
              className="mt-4 block text-center text-sm text-primary hover:text-primary-dark"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>

      {/* Quote Request Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">
                Solicitar Cotización
              </h2>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-2xl text-neutral-400 hover:text-neutral-600"
              >
                ×
              </button>
            </div>
            
            <p className="mb-6 text-sm text-neutral-600">
              Envíanos tus datos y te contactaremos con una cotización personalizada
              en menos de 24 horas.
            </p>

            <form onSubmit={handleRequestQuote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={quoteForm.name}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={quoteForm.email}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, email: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={quoteForm.phone}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, phone: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="+56 9 XXXX XXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Mensaje (opcional)
                </label>
                <textarea
                  value={quoteForm.message}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, message: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="¿Alguna pregunta o requerimiento especial?"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                  disabled={submittingQuote}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                  disabled={submittingQuote}
                >
                  {submittingQuote ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
