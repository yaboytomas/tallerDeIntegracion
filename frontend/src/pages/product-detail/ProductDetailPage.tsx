import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { getImageUrl } from "../../utils/imageUrl";
import { formatCLP, formatPriceWithIVABreakdown } from "../../utils/currency";
import { formatTextWithNewlines } from "../../utils/textFormat";
import type { Product, ProductVariant } from "../../types";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await api.getProduct(slug!) as any;
      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      await addToCart(product._id, selectedVariant?._id, quantity);
      alert("Producto agregado al carrito");
      navigate("/carro");
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al agregar al carrito");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">Cargando producto...</div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <p className="text-neutral-600">Producto no encontrado</p>
          <button
            onClick={() => navigate("/productos")}
            className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
          >
            Volver al catálogo
          </button>
        </div>
      </section>
    );
  }

  const priceBreakdown = formatPriceWithIVABreakdown(
    product.offerPriceWithIVA || product.priceWithIVA
  );
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
  const canAddToCart = availableStock > 0 && quantity <= availableStock;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div>
          {product.images && product.images.length > 0 ? (
            <>
              <div className="aspect-square overflow-hidden rounded-lg border border-neutral-200">
                <img
                  src={getImageUrl(product.images[selectedImage])}
                  alt={product.name}
                  width="600"
                  height="600"
                  className="h-full w-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="mt-4 flex gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`h-20 w-20 overflow-hidden rounded border-2 ${
                        selectedImage === idx
                          ? "border-primary"
                          : "border-neutral-200"
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`${product.name} ${idx + 1}`}
                        width="80"
                        height="80"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square rounded-lg border border-neutral-200 bg-neutral-100 flex items-center justify-center">
              <span className="text-neutral-400">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-neutral-900">{product.name}</h1>
            <p className="mt-2 text-sm text-neutral-500">SKU: {product.sku}</p>
          </div>

          {/* Price */}
          <div className="mb-6">
            {product.offerPriceWithIVA ? (
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {formatCLP(product.offerPriceWithIVA)}
                  </span>
                  <span className="text-xl text-neutral-500 line-through">
                    {formatCLP(product.priceWithIVA)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-green-600">¡En oferta!</p>
              </div>
            ) : (
              <span className="text-3xl font-bold text-neutral-900">
                {formatCLP(product.priceWithIVA)}
              </span>
            )}
            <p className="mt-2 text-sm text-neutral-600">
              Precio base: {formatCLP(priceBreakdown.basePrice)} | IVA:{" "}
              {formatCLP(priceBreakdown.iva)} | Total: {formatCLP(priceBreakdown.total)}
            </p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Variante
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`rounded-md border px-4 py-2 text-sm ${
                      selectedVariant?._id === variant._id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-neutral-300 text-neutral-700 hover:border-primary"
                    }`}
                  >
                    {variant.value} {variant.stock > 0 ? `(${variant.stock})` : "(Sin stock)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Cantidad
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-10 w-10 rounded border border-neutral-300 disabled:opacity-50"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={availableStock}
                className="h-10 w-20 rounded border border-neutral-300 text-center"
              />
              <button
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={quantity >= availableStock}
                className="h-10 w-10 rounded border border-neutral-300 disabled:opacity-50"
              >
                +
              </button>
              <span className="text-sm text-neutral-600">
                {availableStock} disponibles
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {availableStock > 0 ? (
              <p className="text-sm text-green-600">✓ En stock</p>
            ) : (
              <p className="text-sm text-red-600">✗ Sin stock</p>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart || addingToCart}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addingToCart
              ? "Agregando..."
              : availableStock === 0
              ? "Sin stock"
              : "Agregar al carrito"}
          </button>

          {/* Description */}
          <div className="mt-8 border-t border-neutral-200 pt-6">
            <h2 className="mb-4 font-semibold text-neutral-900">Descripción</h2>
            <div
              className="prose prose-sm max-w-none text-neutral-600"
              dangerouslySetInnerHTML={{ __html: formatTextWithNewlines(product.description) }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
