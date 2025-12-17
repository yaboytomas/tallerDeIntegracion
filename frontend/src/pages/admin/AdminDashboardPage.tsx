import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { OrderDetailModal } from './OrderDetailModal';
import type { DashboardStats } from '../../types';

export function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
        <div className="rounded-3xl border-4 border-dashed border-red-300 bg-gradient-to-br from-red-50 via-white to-pink-50 p-16 text-center shadow-xl">
          <div className="text-6xl mb-6">🚫</div>
          <p className="text-xl font-bold text-gradient mb-4">Acceso Denegado</p>
          <p className="text-red-700">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-6 text-lg font-semibold text-gradient">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <header className="mb-12 text-center">
        <div className="inline-block text-6xl mb-4 animate-float">👨‍💼</div>
        <h1 className="heading-artistic mb-4">Panel Administrador</h1>
        <p className="mt-4 text-lg text-neutral-700">
          ⚡ Administra productos, categorías, banners y monitorea pedidos
        </p>
      </header>

      {/* Stats Grid */}
      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-premium rounded-2xl border-2 border-transparent bg-white p-6 shadow-xl animate-scale-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #4facfe, #00f2fe) border-box`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-purple-600 uppercase tracking-wide">Total Productos</p>
              <p className="mt-3 text-4xl font-black text-gradient">{stats?.totalProducts || 0}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-4 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-premium rounded-2xl border-2 border-transparent bg-white p-6 shadow-xl animate-scale-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #fa709a, #fee140) border-box`,
            animationDelay: '100ms'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-purple-600 uppercase tracking-wide">Stock Bajo</p>
              <p className="mt-3 text-4xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">{stats?.lowStockProducts || 0}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 p-4 shadow-lg animate-pulse-soft">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-premium rounded-2xl border-2 border-transparent bg-white p-6 shadow-xl animate-scale-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #43e97b, #38f9d7) border-box`,
            animationDelay: '200ms'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-purple-600 uppercase tracking-wide">Pedidos Hoy</p>
              <p className="mt-3 text-4xl font-black text-gradient">{stats?.ordersToday || 0}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 p-4 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-premium rounded-2xl border-2 border-transparent bg-white p-6 shadow-xl animate-scale-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`,
            animationDelay: '300ms'
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-4 shadow-lg mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-sm font-bold text-purple-600 uppercase tracking-wide mb-3">Acciones Rápidas</p>
            <Link
              to="/admin/products/new"
              className="btn-premium rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              ✨ Nuevo Producto
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/products"
          className="card-premium group rounded-2xl border-2 border-transparent bg-white p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`,
            animationDelay: '400ms'
          }}
        >
          <div className="text-4xl mb-4">📦</div>
          <h3 className="font-black text-lg text-neutral-900 group-hover:text-gradient transition-all">Productos</h3>
          <p className="mt-2 text-sm text-neutral-600">Gestionar catálogo</p>
        </Link>

        <Link
          to="/admin/categories"
          className="card-premium group rounded-2xl border-2 border-transparent bg-white p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #f093fb, #f5576c) border-box`,
            animationDelay: '500ms'
          }}
        >
          <div className="text-4xl mb-4">🗂️</div>
          <h3 className="font-black text-lg text-neutral-900 group-hover:text-gradient transition-all">Categorías</h3>
          <p className="mt-2 text-sm text-neutral-600">Organizar productos</p>
        </Link>

        <Link
          to="/admin/banners"
          className="card-premium group rounded-2xl border-2 border-transparent bg-white p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #4facfe, #00f2fe) border-box`,
            animationDelay: '600ms'
          }}
        >
          <div className="text-4xl mb-4">🖼️</div>
          <h3 className="font-black text-lg text-neutral-900 group-hover:text-gradient transition-all">Banners</h3>
          <p className="mt-2 text-sm text-neutral-600">Gestionar inicio</p>
        </Link>

        <Link
          to="/admin/content"
          className="card-premium group rounded-2xl border-2 border-transparent bg-white p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #43e97b, #38f9d7) border-box`,
            animationDelay: '700ms'
          }}
        >
          <div className="text-4xl mb-4">📄</div>
          <h3 className="font-black text-lg text-neutral-900 group-hover:text-gradient transition-all">Contenido</h3>
          <p className="mt-2 text-sm text-neutral-600">Páginas informativas</p>
        </Link>

        <Link
          to="/admin/users"
          className="card-premium group rounded-2xl border-2 border-transparent bg-white p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #fa709a, #fee140) border-box`,
            animationDelay: '800ms'
          }}
        >
          <div className="text-4xl mb-4">👥</div>
          <h3 className="font-black text-lg text-neutral-900 group-hover:text-gradient transition-all">Usuarios</h3>
          <p className="mt-2 text-sm text-neutral-600">Gestionar administradores</p>
        </Link>
      </div>

      {/* Recent Orders */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <div className="card-premium rounded-3xl border-2 border-transparent bg-white shadow-2xl animate-scale-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #f093fb) border-box`,
            animationDelay: '900ms'
          }}
        >
          <div className="px-8 py-6">
            <h2 className="text-2xl font-black text-gradient flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Pedidos Recientes
            </h2>
          </div>
          <div className="divide-y divide-neutral-200">
            {stats.recentOrders.map((order: any) => (
              <button
                key={order._id}
                onClick={() => setSelectedOrderId(order._id)}
                className="w-full px-6 py-4 transition-all hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-neutral-900 group-hover:text-gradient transition-all">
                      Pedido #{order.orderNumber}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {order.userId?.firstName} {order.userId?.lastName}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-bold text-neutral-900">${order.total.toLocaleString('es-CL')}</p>
                      <p className="text-sm text-neutral-600 capitalize">{order.status}</p>
                    </div>
                    <span className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity text-xl">
                      →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusUpdated={() => {
            loadStats(); // Reload stats to reflect updated status
          }}
        />
      )}
    </div>
  );
}
