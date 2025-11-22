import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import type { Category } from '../../../types';

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  brand: string;
  basePrice: number;
  offerPrice?: number;
  stock: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  status: 'active' | 'inactive';
  featured: boolean;
  sku?: string;
  variants: Array<{
    name: string;
    value: string;
    sku: string;
    priceModifier: number;
    stock: number;
  }>;
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    defaultValues: {
      status: 'active',
      featured: false,
      stock: 0,
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  useEffect(() => {
    if (!isAdmin) return;

    loadCategories();
    if (id) {
      loadProduct();
    } else {
      setLoading(false);
    }
  }, [id, isAdmin]);

  const loadCategories = async () => {
    try {
      const data = await api.getAdminCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProduct = async () => {
    try {
      const product = await api.getProduct(id!);
      reset({
        name: product.name,
        description: product.description,
        categoryId: typeof product.categoryId === 'string' ? product.categoryId : product.categoryId._id,
        brand: product.brand || '',
        basePrice: product.basePrice,
        offerPrice: product.offerPrice,
        stock: product.stock,
        weight: product.weight,
        dimensions: product.dimensions,
        status: product.status,
        featured: product.featured,
        sku: product.sku,
        variants: (product as any).variants || [],
      });
      setExistingImages(product.images || []);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!isAdmin) return;

    try {
      setSaving(true);
      const formData = new FormData();

      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'variants') {
          formData.append('variants', JSON.stringify(value));
        } else if (key === 'dimensions' && value) {
          formData.append('dimensions', JSON.stringify(value));
        } else if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });

      // Append images
      images.forEach((file) => {
        formData.append('images', file);
      });

      if (id) {
        await api.updateProduct(id, formData);
      } else {
        await api.createProduct(formData);
      }

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.error || 'Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
  };

  if (!isAdmin) {
    return <div>No autorizado</div>;
  }

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">
          {id ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Información Básica</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Nombre del Producto *
              </label>
              <input
                {...register('name', { required: 'Nombre es requerido' })}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">SKU</label>
              <input
                {...register('sku')}
                placeholder="Auto-generado si se deja vacío"
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Descripción *</label>
              <textarea
                {...register('description', { required: 'Descripción es requerida' })}
                rows={6}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Categoría *</label>
                <select
                  {...register('categoryId', { required: 'Categoría es requerida' })}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">Marca</label>
                <input
                  {...register('brand')}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Precios y Stock</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">Precio Base *</label>
              <input
                type="number"
                step="0.01"
                {...register('basePrice', { required: 'Precio es requerido', min: 0 })}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Precio Oferta</label>
              <input
                type="number"
                step="0.01"
                {...register('offerPrice', { min: 0 })}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Stock *</label>
              <input
                type="number"
                {...register('stock', { required: 'Stock es requerido', min: 0 })}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Imágenes</h2>
          <div className="space-y-4">
            {existingImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {existingImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={`http://localhost:5000${img}`}
                      alt={`Product ${idx + 1}`}
                      className="h-24 w-24 rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((file, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${idx + 1}`}
                      className="h-24 w-24 rounded object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Variants */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Variantes (Tamaño, Color, etc.)</h2>
            <button
              type="button"
              onClick={() => append({ name: '', value: '', sku: '', priceModifier: 0, stock: 0 })}
              className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Agregar Variante
            </button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="mb-4 rounded border border-neutral-200 p-4">
              <div className="mb-4 grid grid-cols-5 gap-4">
                <input
                  {...register(`variants.${index}.name`)}
                  placeholder="Nombre (ej: Tamaño)"
                  className="rounded-md border border-neutral-300 px-3 py-2"
                />
                <input
                  {...register(`variants.${index}.value`)}
                  placeholder="Valor (ej: 500ml)"
                  className="rounded-md border border-neutral-300 px-3 py-2"
                />
                <input
                  {...register(`variants.${index}.sku`)}
                  placeholder="SKU"
                  className="rounded-md border border-neutral-300 px-3 py-2"
                />
                <input
                  type="number"
                  step="0.01"
                  {...register(`variants.${index}.priceModifier`)}
                  placeholder="Modificador precio"
                  className="rounded-md border border-neutral-300 px-3 py-2"
                />
                <input
                  type="number"
                  {...register(`variants.${index}.stock`)}
                  placeholder="Stock"
                  className="rounded-md border border-neutral-300 px-3 py-2"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Eliminar variante
              </button>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Estado</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Estado del Producto *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('status')}
                    value="active"
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700">Activo</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('status')}
                    value="inactive"
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700">Inactivo</span>
                </label>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('featured')}
                className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-neutral-700">Producto destacado</label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : id ? 'Actualizar' : 'Crear'} Producto
          </button>
        </div>
      </form>
    </div>
  );
}

