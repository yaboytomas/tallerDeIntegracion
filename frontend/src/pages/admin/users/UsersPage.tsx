import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  rut: string;
  phone: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "customer">("all");

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter !== "all") {
        params.role = roleFilter;
      }
      if (search) {
        params.search = search;
      }
      const data = await api.getAdminUsers(params);
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    const confirmMsg = `¿Cambiar rol de ${currentRole} a ${newRole}?`;
    
    if (!confirm(confirmMsg)) return;

    try {
      await api.updateUserRole(userId, newRole);
      loadUsers();
      alert("Rol actualizado exitosamente");
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al actualizar rol");
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`¿Eliminar usuario ${userEmail}?`)) return;

    try {
      await api.deleteUser(userId);
      loadUsers();
      alert("Usuario eliminado exitosamente");
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al eliminar usuario");
    }
  };

  if (!isAdmin) {
    return <div>No autorizado</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestión de Usuarios</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Administra usuarios y crea nuevos administradores
          </p>
        </div>
        <Link
          to="/admin/users/create-admin"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
        >
          + Crear Administrador
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="Buscar por email, nombre o RUT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-md border border-neutral-300 px-4 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-6 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Buscar
          </button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Solo Admins</option>
          <option value="customer">Solo Clientes</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-neutral-600">Cargando usuarios...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <p className="text-neutral-600">No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-neutral-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-neutral-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-neutral-900">{user.phone}</div>
                    <div className="text-sm text-neutral-500">{user.rut}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "admin" ? "Administrador" : "Cliente"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.emailVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.emailVerified ? "Verificado" : "Pendiente"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                    {new Date(user.createdAt).toLocaleDateString("es-CL")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleChangeRole(user._id, user.role)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Cambiar rol"
                      >
                        Cambiar Rol
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.email)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar usuario"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
