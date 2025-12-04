import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { getImageUrl } from '../../../utils/imageUrl';
import type { Category } from '../../../types';

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
  order: number;
  status: 'active' | 'inactive';
  featured: boolean;
}

export function CategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    defaultValues: {
      status: 'active',
      order: 0,
      featured: false,
    },
  });

  useEffect(() => {
    if (!isAdmin) return;

    loadCategories();
    if (id) {
      loadCategory();
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

  const loadCategory = async () => {
    try {
      // Would need getCategory by ID endpoint
      const allCategories = await api.getAdminCategories();
      const category = allCategories.find((c) => c._id === id);
      if (category) {
        reset({
          name: category.name,
          description: category.description || '',
          parentId: category.parentId || '',
          order: category.order,
          status: category.status,
          featured: category.featured || false,
        });
        setExistingImage(category.image || null);
      }
    } catch (error) {
      console.error('Error loading category:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (!isAdmin) return;

    try {
      setSaving(true);
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });

      if (image) {
        formData.append('image', image);
      }

      if (id) {
        await api.updateCategory(id, formData);
      } else {
        await api.createCategory(formData);
      }

      navigate('/admin/categories');
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.error || 'Error al guardar categoría');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return <div>No autorizado</div>;
  if (loading) return <div className="text-center py-12">Cargando...</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">
          {id ? 'Editar Categoría' : 'Nueva Categoría'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">Nombre *</label>
              <input
                {...register('name', { required: 'Nombre es requerido' })}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Descripción</label>
              <textarea
                {...register('description')}
                rows={4}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Categoría Padre</label>
                <select
                  {...register('parentId')}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Ninguna (categoría principal)</option>
                  {categories
                    .filter((c) => c._id !== id)
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">Orden</label>
                <input
                  type="number"
                  {...register('order', { valueAsNumber: true })}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Imagen</label>
              {existingImage && (
                <div className="mb-2">
                  <img
                    src={getImageUrl(existingImage)}
                    alt="Category"
                    className="h-24 w-24 rounded object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Estado</label>
              <select
                {...register('status')}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                {...register('featured')}
                className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-neutral-700">
                Mostrar en página principal (Categorías Destacadas)
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/categories')}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : id ? 'Actualizar' : 'Crear'} Categoría
          </button>
        </div>
      </form>
    </div>
  );
}

