import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import type { Product } from '../../../types';

export function ProductsListPage() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
    }
  }, [isAdmin, pagination.page, statusFilter, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const data = await api.getAdminProducts(params);
      setProducts(data.products || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción es permanente.')) return;

    try {
      await api.deleteProduct(id, true); // Hard delete - permanently removes product
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar producto');
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedProducts.length === 0) {
      alert('Selecciona al menos un producto');
      return;
    }

    if (action === 'delete' && !confirm(`¿Eliminar ${selectedProducts.length} productos?`)) {
      return;
    }

    try {
      // Note: Backend needs bulk update endpoint, for now do individually
      for (const id of selectedProducts) {
        if (action === 'delete') {
          await api.deleteProduct(id, false);
        } else {
          // Would need bulk update endpoint
          const product = products.find((p) => p._id === id);
          if (product) {
            const formData = new FormData();
            formData.append('status', action === 'activate' ? 'active' : 'inactive');
            await api.updateProduct(id, formData);
          }
        }
      }
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      console.error('Error in bulk action:', error);
      alert('Error al procesar acción');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p._id));
    }
  };

  if (!isAdmin) {
    return <div>No autorizado</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Productos</h1>
          <p className="mt-2 text-sm text-neutral-600">Gestiona tu catálogo de productos</p>
        </div>
        <Link
          to="/admin/products/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nuevo Producto
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="w-full rounded-md border border-neutral-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="rounded-md border border-neutral-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedProducts.length} producto(s) seleccionado(s)
          </span>
          <button
            onClick={() => handleBulkAction('activate')}
            className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
          >
            Activar
          </button>
          <button
            onClick={() => handleBulkAction('deactivate')}
            className="rounded-md bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700"
          >
            Desactivar
          </button>
          <button
            onClick={() => handleBulkAction('delete')}
            className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          >
            Eliminar
          </button>
          <button
            onClick={() => setSelectedProducts([])}
            className="ml-auto text-sm text-blue-600 hover:text-blue-800"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <p className="text-neutral-600">No hay productos</p>
          <Link
            to="/admin/products/new"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Crear primer producto
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 && (
                          <img
                            src={`http://localhost:5000${product.images[0]}`}
                            alt={product.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-neutral-900">{product.name}</div>
                          <div className="text-sm text-neutral-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      ${product.priceWithIVA?.toLocaleString('es-CL') || product.basePrice.toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="ml-4 text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-neutral-700">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

