import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { DashboardStats } from '../../types';

export function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          No tienes permisos para acceder a esta sección.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Panel Administrador</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Administra productos, categorías, banners y monitorea el estado de los pedidos.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Productos</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{stats?.totalProducts || 0}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Stock Bajo</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{stats?.lowStockProducts || 0}</p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Pedidos Hoy</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{stats?.ordersToday || 0}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Acciones Rápidas</p>
              <Link
                to="/admin/products/new"
                className="mt-2 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Nuevo Producto
              </Link>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/products"
          className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold text-neutral-900">Productos</h3>
          <p className="mt-1 text-sm text-neutral-600">Gestionar catálogo</p>
        </Link>

        <Link
          to="/admin/categories"
          className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold text-neutral-900">Categorías</h3>
          <p className="mt-1 text-sm text-neutral-600">Organizar productos</p>
        </Link>

        <Link
          to="/admin/banners"
          className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold text-neutral-900">Banners</h3>
          <p className="mt-1 text-sm text-neutral-600">Gestionar inicio</p>
        </Link>

        <Link
          to="/admin/content"
          className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold text-neutral-900">Contenido</h3>
          <p className="mt-1 text-sm text-neutral-600">Páginas informativas</p>
        </Link>

        <Link
          to="/admin/users"
          className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold text-neutral-900">Usuarios</h3>
          <p className="mt-1 text-sm text-neutral-600">Gestionar administradores</p>
        </Link>
      </div>

      {/* Recent Orders */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">Pedidos Recientes</h2>
          </div>
          <div className="divide-y divide-neutral-200">
            {stats.recentOrders.map((order: any) => (
              <div key={order._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">Pedido #{order.orderNumber}</p>
                    <p className="text-sm text-neutral-600">
                      {order.userId?.firstName} {order.userId?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900">${order.total.toLocaleString('es-CL')}</p>
                    <p className="text-sm text-neutral-600">{order.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
