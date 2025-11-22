import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { getImageUrl } from '../../../utils/imageUrl';
import { BannerFormModal } from './BannerFormModal';
import type { HomeBanner } from '../../../types';

export function BannersPage() {
  const { isAdmin } = useAuth();
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<HomeBanner | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadBanners();
    }
  }, [isAdmin]);

  const loadBanners = async () => {
    try {
      const data = await api.getBanners();
      setBanners(data);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return;

    try {
      await api.deleteBanner(id);
      loadBanners();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al eliminar banner');
    }
  };

  const handleEdit = (banner: HomeBanner) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedBanner(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBanner(null);
  };

  const handleSuccess = () => {
    loadBanners();
  };

  if (!isAdmin) return <div>No autorizado</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Banners</h1>
          <p className="mt-2 text-sm text-neutral-600">Gestiona los banners de la página de inicio</p>
        </div>
        <button
          onClick={handleNew}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nuevo Banner
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : banners.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <p className="text-neutral-600">No hay banners</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <div key={banner._id} className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
              <img
                src={getImageUrl(banner.image)}
                alt={banner.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-neutral-900">{banner.title}</h3>
                {banner.subtitle && <p className="mt-1 text-sm text-neutral-600">{banner.subtitle}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      banner.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {banner.active ? 'Activo' : 'Inactivo'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BannerFormModal
        banner={selectedBanner}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

