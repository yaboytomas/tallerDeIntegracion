import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

interface ContentFormData {
  title: string;
  content: string;
  metaDescription: string;
}

export function ContentPageEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContentFormData>();

  useEffect(() => {
    if (!isAdmin || !slug) return;

    loadPage();
  }, [slug, isAdmin]);

  const loadPage = async () => {
    try {
      const page = await api.getContentPage(slug!);
      reset({
        title: page.title,
        content: page.content,
        metaDescription: page.metaDescription || '',
      });
    } catch (error: any) {
      // Page might not exist yet, that's OK
      if (error.response?.status !== 404) {
        console.error('Error loading page:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ContentFormData) => {
    if (!isAdmin || !slug) return;

    try {
      setSaving(true);
      await api.createOrUpdateContentPage({
        slug: slug!,
        ...data,
      });
      navigate('/admin/content');
    } catch (error: any) {
      console.error('Error saving page:', error);
      alert(error.response?.data?.error || 'Error al guardar página');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return <div>No autorizado</div>;
  if (loading) return <div className="text-center py-12">Cargando...</div>;

  const pageTitles: Record<string, string> = {
    about: 'Quiénes Somos',
    'shipping-policy': 'Política de Envíos',
    'return-policy': 'Política de Devoluciones',
    'privacy-policy': 'Política de Privacidad',
    'terms-conditions': 'Términos y Condiciones',
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">
          Editar: {pageTitles[slug!] || slug}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">Título *</label>
              <input
                {...register('title', { required: 'Título es requerido' })}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Contenido *</label>
              <textarea
                {...register('content', { required: 'Contenido es requerido' })}
                rows={20}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                Puedes usar HTML básico para formatear el contenido
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Meta Descripción (SEO)
              </label>
              <textarea
                {...register('metaDescription')}
                rows={3}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/content')}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'} Página
          </button>
        </div>
      </form>
    </div>
  );
}

