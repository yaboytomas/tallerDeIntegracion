import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import type { ContentPage } from '../../../types';

export function ContentPagesPage() {
  const { isAdmin } = useAuth();
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadPages();
    }
  }, [isAdmin]);

  const loadPages = async () => {
    try {
      const data = await api.getContentPages();
      setPages(data);
    } catch (error) {
      console.error('Error loading content pages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return <div>No autorizado</div>;

  const pageSlugs = [
    { slug: 'about', title: 'Quiénes Somos' },
    { slug: 'shipping-policy', title: 'Política de Envíos' },
    { slug: 'return-policy', title: 'Política de Devoluciones' },
    { slug: 'privacy-policy', title: 'Política de Privacidad' },
    { slug: 'terms-conditions', title: 'Términos y Condiciones' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Páginas de Contenido</h1>
        <p className="mt-2 text-sm text-neutral-600">Edita las páginas informativas del sitio</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageSlugs.map((pageInfo) => {
            const existingPage = pages.find((p) => p.slug === pageInfo.slug);
            return (
              <Link
                key={pageInfo.slug}
                to={`/admin/content/${pageInfo.slug}/edit`}
                className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <h3 className="font-semibold text-neutral-900">{pageInfo.title}</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {existingPage ? 'Editado' : 'Sin editar'}
                </p>
                <p className="mt-2 text-xs text-neutral-500">Slug: {pageInfo.slug}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

