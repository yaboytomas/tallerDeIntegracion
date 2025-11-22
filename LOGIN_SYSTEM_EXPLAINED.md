# Sistema de Login - JSP Detailing

## ✅ Cómo Funciona el Login Unificado

**IMPORTANTE:** Admin y clientes usan el **MISMO** formulario de login en `/login`

---

## 🔐 Proceso de Login

### 1. Login Único para Todos
- **URL:** `http://localhost:5173/login`
- **Endpoint API:** `POST /api/auth/login`
- **Usuarios:** Admin y clientes

### 2. Diferenciación Automática por Rol

Cuando un usuario hace login, el backend:
1. Verifica credenciales
2. Genera tokens JWT
3. Incluye el **rol** del usuario en el token (`customer` o `admin`)

```json
{
  "user": {
    "email": "admin@jspdetailing.cl",
    "firstName": "Admin",
    "role": "admin"  // ← Este campo determina los permisos
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### 3. Frontend Adapta la UI Según el Rol

El `AuthContext` expone:
- `isAuthenticated`: Si el usuario está logueado
- `isAdmin`: Si el usuario tiene rol de admin
- `user`: Datos completos del usuario

```typescript
const { isAuthenticated, isAdmin, user } = useAuth();
```

---

## 👥 Tipos de Usuarios

### Cliente Regular (`customer`)
**Credenciales de ejemplo:**
```
Email: cliente@ejemplo.cl
Password: (la que registró)
```

**Después de login ve:**
- ✅ Página principal
- ✅ Productos
- ✅ Carrito
- ✅ Mi Cuenta
- ✅ Historial de pedidos
- ❌ NO ve el botón "Admin"

### Administrador (`admin`)
**Credenciales default:**
```
Email: admin@jspdetailing.cl
Password: Admin123!@#
```

**Después de login ve:**
- ✅ Todo lo que ve el cliente +
- ✅ **Botón "Admin"** en el header
- ✅ Acceso a `/admin` (Panel administrativo)
- ✅ Dashboard con estadísticas
- ✅ Gestión de productos, categorías, banners

---

## 🎯 Flujo Completo

### Paso 1: Usuario va a Login
```
http://localhost:5173/login
```

### Paso 2: Ingresa Credenciales
```
Email: admin@jspdetailing.cl  (o cualquier usuario registrado)
Password: Admin123!@#
```

### Paso 3: Click en "Ingresar"
- Frontend envía a: `POST /api/auth/login`
- Backend valida credenciales
- Backend devuelve: `user + tokens`
- Frontend guarda tokens en localStorage
- Frontend actualiza AuthContext

### Paso 4: Redirección Automática
- Si es **cliente**: Va a página principal
- Si es **admin**: Va a página principal pero ve botón "Admin"

### Paso 5: UI se Adapta Automáticamente

**Header para Cliente:**
```
[Logo] Inicio | Productos | Cuenta | Carrito
```

**Header para Admin:**
```
[Logo] Inicio | Productos | Admin | Cuenta | Carrito
         ↑
    Botón extra solo para admin
```

---

## 🔒 Protección de Rutas

### Rutas Públicas (cualquiera puede acceder)
- `/` - Inicio
- `/productos` - Catálogo
- `/login` - Login
- `/registro` - Registro
- `/quienes-somos`, `/politicas`, `/contacto`

### Rutas Protegidas (requiere login)
- `/cuenta` - Perfil del usuario
- `/carro` - Carrito
- `/checkout` - Proceso de compra

### Rutas de Admin (requiere rol admin)
- `/admin` - Dashboard
- `/admin/products` - Gestión de productos
- `/admin/categories` - Gestión de categorías
- `/admin/banners` - Gestión de banners
- `/admin/content` - Gestión de contenido

**Si un cliente intenta acceder a `/admin`:**
→ Redirección automática a `/` (página principal)

---

## 🧪 Cómo Probar

### Test 1: Login como Cliente
1. Ve a: `http://localhost:5173/registro`
2. Crea una cuenta de prueba
3. Ve a: `http://localhost:5173/login`
4. Ingresa tus credenciales
5. ✅ Deberías ver tu nombre en el header
6. ❌ NO deberías ver el botón "Admin"
7. Si intentas ir a `/admin` → Te redirecciona a `/`

### Test 2: Login como Admin
1. Ve a: `http://localhost:5173/login`
2. Ingresa:
   ```
   Email: admin@jspdetailing.cl
   Password: Admin123!@#
   ```
3. Click "Ingresar"
4. ✅ Deberías ver "Admin" en el header
5. ✅ Puedes hacer click en "Admin"
6. ✅ Accedes al panel administrativo

### Test 3: Cambio de Sesión
1. Login como cliente
2. Cierra sesión (botón "Salir")
3. Login como admin
4. ✅ El header cambia y muestra el botón "Admin"
5. Cierra sesión
6. Login como cliente nuevamente
7. ✅ El botón "Admin" desaparece

---

## 💡 Implementación Técnica

### Backend: Un Solo Endpoint

```typescript
// backend/src/routes/authRoutes.ts
router.post('/login', authController.login);

// backend/src/controllers/authController.ts
export async function login(req, res) {
  const user = await User.findOne({ email });
  // ... validación de contraseña ...
  
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role  // ← customer o admin
  };
  
  const accessToken = generateAccessToken(payload);
  
  res.json({ user, accessToken });
}
```

### Frontend: Un Solo Formulario

```typescript
// frontend/src/pages/auth/login/LoginPage.tsx
async function onSubmit(data) {
  await login(data.email, data.password, data.remember);
  // AuthContext automáticamente detecta el rol
  // y actualiza isAdmin
}
```

### AuthContext: Detección Automática de Rol

```typescript
// frontend/src/context/AuthContext.tsx
const isAdmin = user?.role === 'admin';

return (
  <AuthContext.Provider value={{ 
    user, 
    isAuthenticated, 
    isAdmin  // ← true solo si role === 'admin'
  }}>
    {children}
  </AuthContext.Provider>
);
```

### Header: Renderizado Condicional

```typescript
// frontend/src/components/layout/Header.tsx
const { isAdmin } = useAuth();

{isAdmin && (
  <Link to="/admin">
    Admin  {/* ← Solo se muestra si isAdmin === true */}
  </Link>
)}
```

---

## 🔐 Seguridad

### ✅ Implementado

1. **JWT Tokens**: Los roles están en el token firmado
2. **Backend Validation**: Middleware `requireAdmin` verifica el rol
3. **Frontend Protection**: `ProtectedRoute` verifica permisos
4. **Automatic Redirect**: Si no eres admin, te redirige

### Ejemplo de Protección

```typescript
// frontend/src/components/admin/ProtectedRoute.tsx
if (adminOnly && !isAdmin) {
  return <Navigate to="/" replace />;
}

// backend/src/middleware/auth.ts
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
```

---

## ❓ Preguntas Frecuentes

### ¿Necesito un login diferente para admin?
**No.** Admin y clientes usan el mismo formulario de login.

### ¿Cómo sabe el sistema si soy admin?
El **rol** está guardado en la base de datos (`users` collection). Cuando haces login, el backend lee tu rol y lo incluye en el token JWT.

### ¿Puedo convertir un cliente en admin?
**Sí.** Actualiza el rol en MongoDB:
```javascript
db.users.updateOne(
  { email: "usuario@ejemplo.cl" },
  { $set: { role: "admin" } }
)
```

### ¿Qué pasa si intento acceder a /admin sin ser admin?
Te redirige automáticamente a la página principal (`/`).

### ¿El cliente puede ver el panel admin?
**No.** El botón "Admin" solo aparece si tu rol es `admin`. Además, si intentas acceder directamente a la URL, el `ProtectedRoute` te bloquea.

---

## ✅ Resumen

**Un solo login para todos:**
- Mismo formulario (`/login`)
- Mismo endpoint API (`POST /api/auth/login`)
- Diferenciación automática por rol en la base de datos
- UI se adapta según el rol del usuario
- Protección en frontend Y backend

**Es así como debe funcionar.** No necesitas cambiar nada. El sistema ya está diseñado correctamente. 🎉

---

**Estado:** ✅ Funcionando correctamente  
**Requiere cambios:** ❌ No, ya está implementado

