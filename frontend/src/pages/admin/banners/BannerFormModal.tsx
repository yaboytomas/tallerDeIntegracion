import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../../services/api';
import { getImageUrl } from '../../../utils/imageUrl';
import type { HomeBanner } from '../../../types';

interface BannerFormModalProps {
  banner?: HomeBanner | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BannerFormData {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  active: boolean;
  order: number;
}

export function BannerFormModal({ banner, isOpen, onClose, onSuccess }: BannerFormModalProps) {
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BannerFormData>({
    defaultValues: {
      title: '',
      subtitle: '',
      ctaText: 'Comprar ahora',
      ctaLink: '/productos',
      active: true,
      order: 0,
    },
  });

  useEffect(() => {
    if (banner) {
      reset({
        title: banner.title,
        subtitle: banner.subtitle || '',
        ctaText: banner.ctaText || '',
        ctaLink: banner.ctaLink || '',
        active: banner.active,
        order: banner.order,
      });
      if (banner.image) {
        setImagePreview(getImageUrl(banner.image));
      }
    } else {
      reset({
        title: '',
        subtitle: '',
        ctaText: 'Comprar ahora',
        ctaLink: '/productos',
        active: true,
        order: 0,
      });
      setImagePreview('');
    }
  }, [banner, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: BannerFormData) => {
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

      if (banner) {
        await api.updateBanner(banner._id, formData);
      } else {
        await api.createBanner(formData);
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving banner:', error);
      alert(error.response?.data?.error || 'Error al guardar banner');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    setImage(null);
    setImagePreview('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">
            {banner ? 'Editar Banner' : 'Nuevo Banner'}
          </h2>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Título *
            </label>
            <input
              {...register('title', { required: 'Título es requerido' })}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ej: ¡Ofertas de Verano!"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Subtítulo
            </label>
            <input
              {...register('subtitle')}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ej: Hasta 30% de descuento en productos seleccionados"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Imagen *
            </label>
            {imagePreview && (
              <div className="mb-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-full rounded-md object-cover"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Recomendado: 1920x600px. Formatos: JPG, PNG, WebP
            </p>
            {!banner && !image && (
              <p className="mt-1 text-xs text-red-600">La imagen es requerida</p>
            )}
          </div>

          {/* CTA Text */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Texto del Botón
            </label>
            <input
              {...register('ctaText')}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ej: Comprar ahora, Ver ofertas"
            />
          </div>

          {/* CTA Link */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Link del Botón
            </label>
            <input
              {...register('ctaLink')}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="/productos, /quienes-somos, etc."
            />
          </div>

          {/* Order & Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Orden
              </label>
              <input
                type="number"
                {...register('order', { min: 0 })}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Orden de aparición (menor número = primero)
              </p>
            </div>

            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                {...register('active')}
                className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-neutral-700">
                Banner activo
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || (!banner && !image)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Guardando...' : banner ? 'Actualizar' : 'Crear'} Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

