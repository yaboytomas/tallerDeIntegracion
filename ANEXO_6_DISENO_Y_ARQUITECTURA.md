# ANEXO 6 – DOCUMENTO DE DISEÑO Y ARQUITECTURA

**Proyecto:** JSP Detailing - E-commerce de Productos de Detailing Automotriz  
**Fecha:** Noviembre 2025  
**Versión:** 1.0

---

## 1. ARQUITECTURA GENERAL DEL SISTEMA

### 1.1 Descripción General

El sistema JSP Detailing es una plataforma e-commerce completa construida con arquitectura de **aplicación web de tres capas** (presentación, lógica de negocio, datos), implementada mediante tecnologías modernas que garantizan escalabilidad, mantenibilidad y rendimiento óptimo.

**Características principales:**
- Arquitectura cliente-servidor basada en API REST
- Separación completa entre frontend y backend
- Autenticación basada en tokens JWT
- Base de datos NoSQL (MongoDB)
- Alojamiento distribuido en servicios cloud

### 1.2 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIO FINAL                           │
│              (Navegadores web / Dispositivos móviles)        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
│  Frontend: React + TypeScript + Vite + Tailwind CSS        │
│  Hosting: Vercel (CDN global)                              │
│  - Componentes reutilizables                               │
│  - Gestión de estado (Context API)                         │
│  - Enrutamiento (React Router v6)                          │
│  - Optimización de imágenes                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS / REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE LÓGICA DE NEGOCIO                 │
│  Backend: Node.js + Express + TypeScript                   │
│  Hosting: Render                                           │
│  - Controladores de negocio                               │
│  - Middleware de autenticación/autorización               │
│  - Validación de datos                                    │
│  - Manejo de errores centralizado                         │
│  - Rate limiting y seguridad                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Mongoose ODM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE DATOS                           │
│  Base de Datos: MongoDB Atlas (Cloud)                      │
│  - Esquemas definidos con Mongoose                         │
│  - Índices optimizados                                     │
│  - Respaldos automáticos                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  SERVICIOS EXTERNOS                          │
│  - Cloudinary: Almacenamiento de imágenes                  │
│  - Resend/Nodemailer: Envío de correos                    │
│  - Web Vitals: Monitoreo de rendimiento                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. COMPONENTES PRINCIPALES

### 2.1 Frontend (Capa de Presentación)

**Tecnologías:**
- **React 18** con TypeScript
- **Vite** como bundler y dev server
- **Tailwind CSS** para estilos
- **React Router v6** para navegación
- **Axios** para comunicación HTTP
- **Web Vitals** para monitoreo de rendimiento

**Módulos principales:**
- **Context Providers:** Autenticación, Carrito de compras
- **Componentes de Layout:** Header, Footer, MainLayout
- **Páginas:** Home, Productos, Detalle de Producto, Carrito, Checkout, etc.
- **Componentes Reutilizables:** SearchAutocomplete, CookieConsentBanner
- **Servicios:** API client centralizado
- **Utilidades:** Formateo de precios, gestión de imágenes, Web Vitals

### 2.2 Backend (Capa de Lógica de Negocio)

**Tecnologías:**
- **Node.js** (runtime JavaScript)
- **Express 5** (framework web)
- **TypeScript** (tipado estático)
- **Mongoose** (ODM para MongoDB)
- **JWT** (autenticación)
- **bcryptjs** (hash de contraseñas)

**Módulos principales:**
- **Controladores:** Gestión de productos, usuarios, carritos, pedidos, categorías
- **Middleware:** Autenticación, autorización, validación, seguridad
- **Modelos:** Esquemas de datos con Mongoose
- **Rutas:** Endpoints REST organizados por dominio
- **Servicios:** Email, Cloudinary (imágenes), generación de tokens
- **Scripts:** Migraciones, seeds, tareas administrativas

### 2.3 Base de Datos

**MongoDB Atlas (Cloud)**
- Base de datos NoSQL orientada a documentos
- Esquemas flexibles pero validados con Mongoose
- Índices optimizados para consultas frecuentes
- Respaldos automáticos diarios

---

## 3. ARQUITECTURA INTERNA DEL PROYECTO

### 3.1 Estructura del Frontend

```
frontend/
├── public/                 # Archivos estáticos
│   ├── jsp.jpg            # Logo de la empresa
│   └── vite.svg
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── admin/         # Componentes de administración
│   │   ├── auth/          # Componentes de autenticación
│   │   ├── cookies/       # Banner de consentimiento
│   │   ├── layout/        # Header, Footer, MainLayout
│   │   └── search/        # Autocomplete de búsqueda
│   ├── context/           # Context API (estado global)
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── pages/             # Páginas/vistas de la aplicación
│   │   ├── home/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── admin/
│   │   └── auth/
│   ├── routes/            # Configuración de rutas
│   ├── services/          # Cliente API
│   │   └── api.ts
│   ├── types/             # Definiciones TypeScript
│   ├── utils/             # Funciones auxiliares
│   │   ├── currency.ts
│   │   ├── imageUrl.ts
│   │   └── reportWebVitals.ts
│   ├── App.tsx            # Componente raíz
│   ├── main.tsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vite.config.ts
```

### 3.2 Estructura del Backend

```
backend/
├── src/
│   ├── config/           # Configuración
│   │   └── database.ts   # Conexión MongoDB
│   ├── controllers/      # Lógica de negocio
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── cartController.ts
│   │   ├── orderController.ts
│   │   ├── categoryController.ts
│   │   ├── adminController.ts
│   │   └── userController.ts
│   ├── middleware/       # Middleware personalizado
│   │   ├── auth.ts       # Autenticación JWT
│   │   ├── security.ts   # Rate limiting, sanitización
│   │   ├── errorHandler.ts
│   │   └── auditLog.ts
│   ├── models/           # Esquemas Mongoose
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── ProductVariant.ts
│   │   ├── Category.ts
│   │   ├── CartItem.ts
│   │   ├── Order.ts
│   │   ├── HomeBanner.ts
│   │   ├── ContentPage.ts
│   │   └── Address.ts
│   ├── routes/           # Definición de rutas
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── productRoutes.ts
│   │   ├── cartRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   └── adminRoutes.ts
│   ├── scripts/          # Scripts auxiliares
│   │   ├── createAdmin.ts
│   │   ├── seedContentPages.ts
│   │   └── updateCartIndexes.ts
│   ├── services/         # Servicios externos
│   │   ├── cloudinaryUpload.ts
│   │   ├── emailService.ts
│   │   └── fileUpload.ts
│   ├── types/            # Definiciones TypeScript
│   │   └── index.ts
│   ├── utils/            # Utilidades
│   │   ├── currency.ts
│   │   ├── password.ts
│   │   ├── rutValidation.ts
│   │   ├── slug.ts
│   │   ├── sku.ts
│   │   └── token.ts
│   └── server.ts         # Punto de entrada
├── package.json
└── tsconfig.json
```

---

## 4. MODELOS DE DATOS

### 4.1 Modelo de Usuario (User)

```typescript
User {
  _id: ObjectId
  firstName: string
  lastName: string
  email: string (único, índice)
  rut: string (único, validado)
  phone: string
  passwordHash: string
  role: 'customer' | 'admin'
  emailVerified: boolean
  twoFactorEnabled: boolean
  addresses: Address[]
  createdAt: Date
  updatedAt: Date
}
```

**Índices:**
- email (único)
- rut (único)

### 4.2 Modelo de Producto (Product)

```typescript
Product {
  _id: ObjectId
  sku: string (único, auto-generado)
  name: string (índice de texto)
  slug: string (único, índice)
  description: string (índice de texto)
  categoryId: ObjectId (referencia a Category)
  brand: string
  basePrice: number
  offerPrice: number (opcional)
  priceWithIVA: number (calculado)
  offerPriceWithIVA: number (calculado)
  stock: number
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  images: string[] (URLs de Cloudinary)
  featured: boolean
  status: 'active' | 'inactive' | 'out_of_stock'
  tags: string[]
  createdAt: Date
  updatedAt: Date
}
```

**Índices:**
- sku (único)
- slug (único)
- categoryId
- status
- featured
- Índice de texto en: name, description, tags

### 4.3 Modelo de Variante de Producto (ProductVariant)

```typescript
ProductVariant {
  _id: ObjectId
  productId: ObjectId (referencia a Product)
  name: string (ej: "Tamaño", "Color")
  value: string (ej: "500ml", "Rojo")
  sku: string (único)
  priceModifier: number (diferencia de precio)
  stock: number
}
```

### 4.4 Modelo de Categoría (Category)

```typescript
Category {
  _id: ObjectId
  name: string
  slug: string (único, índice)
  description: string
  image: string (URL Cloudinary)
  parentId: ObjectId (referencia a Category, opcional)
  order: number
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}
```

### 4.5 Modelo de Item de Carrito (CartItem)

```typescript
CartItem {
  _id: ObjectId
  userId: ObjectId (referencia a User, nullable para invitados)
  sessionId: string (para usuarios invitados, nullable)
  productId: ObjectId (referencia a Product)
  variantId: ObjectId (referencia a ProductVariant, opcional)
  quantity: number
  createdAt: Date
  updatedAt: Date
}
```

**Índices compuestos únicos:**
- { userId, productId, variantId } con filtro parcial (userId existe)
- { sessionId, productId, variantId } con filtro parcial (sessionId existe)

### 4.6 Modelo de Pedido (Order)

```typescript
Order {
  _id: ObjectId
  userId: ObjectId (referencia a User)
  orderNumber: string (único, auto-generado)
  items: [{
    productId: ObjectId
    variantId: ObjectId (opcional)
    name: string
    quantity: number
    unitPrice: number
    subtotal: number
  }]
  subtotal: number
  iva: number
  shippingCost: number
  total: number
  shippingAddress: Address
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  notes: string
  createdAt: Date
  updatedAt: Date
}
```

### 4.7 Modelo de Banner (HomeBanner)

```typescript
HomeBanner {
  _id: ObjectId
  title: string
  subtitle: string
  image: string (URL Cloudinary)
  ctaText: string
  ctaLink: string
  active: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### 4.8 Modelo de Página de Contenido (ContentPage)

```typescript
ContentPage {
  _id: ObjectId
  slug: string (único, índice)
  title: string
  content: string (HTML)
  metaDescription: string
  updatedAt: Date
}
```

**Slugs predefinidos:**
- `about` - Quiénes Somos
- `shipping-policy` - Política de Envíos
- `return-policy` - Cambios y Devoluciones
- `warranty-policy` - Garantía Legal
- `privacy-policy` - Política de Privacidad
- `terms-conditions` - Términos y Condiciones
- `cookie-policy` - Política de Cookies

---

## 5. DISEÑO DE LA INTERFAZ

### 5.1 Principios de Diseño

- **Diseño artístico moderno:** Gradientes vibrantes, animaciones fluidas, tipografía bold
- **Responsive:** Adaptable a móviles, tablets y desktop
- **Accesible:** Navegación por teclado, ARIA labels, contraste adecuado
- **Performante:** Optimización de imágenes, lazy loading, animaciones CSS

### 5.2 Paleta de Colores

```css
/* Gradientes principales */
--gradient-primary: linear-gradient(135deg, #667eea, #764ba2);
--gradient-secondary: linear-gradient(135deg, #f093fb, #f5576c);
--gradient-accent: linear-gradient(135deg, #4facfe, #00f2fe);

/* Colores base */
--purple-600: #7c3aed;
--pink-600: #db2777;
--blue-600: #2563eb;
--neutral-900: #171717;
```

### 5.3 Componentes Visuales Destacados

1. **Header:**
   - Logo personalizado (jsp.jpg)
   - Barra de búsqueda con autocomplete
   - Navegación responsive con menú hamburguesa
   - Ícono de carrito con contador animado
   - Botón admin con ícono de engranaje

2. **Cards de Productos:**
   - Bordes con gradientes rotativos
   - Imágenes con zoom/rotación en hover
   - Badges de stock brillantes
   - Precio con gradiente de texto

3. **Hero Section:**
   - Fondo con gradiente animado
   - Badges flotantes
   - CTAs con efectos hover dramáticos

4. **Footer:**
   - Gradiente de fondo animado
   - Íconos de redes sociales con rotación/escala
   - Links con animación slide

---

## 6. ARQUITECTURA DE SEGURIDAD

### 6.1 Autenticación y Autorización

- **JWT (JSON Web Tokens):**
  - Access Token: 15 minutos de validez
  - Refresh Token: 7 días de validez
  - Almacenados en localStorage

- **Roles:**
  - `customer`: Usuario estándar
  - `admin`: Administrador con acceso al panel

- **Protección de rutas:**
  - Middleware `authenticate`: Verifica token válido
  - Middleware `requireAdmin`: Verifica rol admin

### 6.2 Seguridad del Backend

- **Helmet.js:** Headers de seguridad HTTP
- **Rate Limiting:** 
  - API general: 100 req/15min
  - Auth: 5 req/15min
  - Password reset: 3 req/hora
- **CORS:** Configurado para dominios específicos
- **Sanitización XSS:** Middleware personalizado
- **Hash de contraseñas:** bcryptjs con salt

### 6.3 Validación de Datos

- **RUT chileno:** Validación de formato y dígito verificador
- **Emails:** Validación de formato RFC 5322
- **Contraseñas:** Mínimo 8 caracteres, mayúsculas, números
- **Inputs:** express-validator en todos los endpoints

---

## 7. ARQUITECTURA DE RENDIMIENTO

### 7.1 Optimizaciones Frontend

- **Code splitting:** Rutas cargadas dinámicamente
- **Lazy loading:** Imágenes con `loading="lazy"`
- **Image optimization:**
  - Cloudinary con transformaciones automáticas
  - WebP/AVIF cuando el navegador lo soporta
  - Responsive images con width limits
- **CSS:** Tailwind CSS con purge de clases no usadas
- **Preconnect hints:** Para Cloudinary y API

### 7.2 Optimizaciones Backend

- **Índices de base de datos:** En campos frecuentemente consultados
- **Lean queries:** `.lean()` para mejor performance
- **Paginación:** Límite de resultados por página
- **Compression middleware:** Compresión gzip
- **Cloudinary CDN:** Imágenes servidas desde CDN global

### 7.3 Métricas Web Vitals

- **LCP (Largest Contentful Paint):** < 2.5s ✅
- **FID (First Input Delay):** < 100ms ✅
- **CLS (Cumulative Layout Shift):** < 0.1 ✅
- **Monitoreo:** web-vitals package con logging

---

## 8. ARQUITECTURA DE COMUNICACIÓN

### 8.1 API REST

**Base URL:** `https://tallerdeintegracion.onrender.com/api`

**Autenticación:**
```
Authorization: Bearer {access_token}
```

**Endpoints principales:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registro de usuario |
| POST | `/auth/login` | Inicio de sesión |
| POST | `/auth/refresh` | Renovar access token |
| GET | `/products` | Listar productos |
| GET | `/products/search` | Buscar productos |
| GET | `/products/:id` | Detalle de producto |
| GET | `/categories` | Listar categorías |
| GET | `/cart` | Obtener carrito |
| POST | `/cart` | Agregar al carrito |
| DELETE | `/cart/:id` | Eliminar del carrito |
| POST | `/cart/request-quote` | Solicitar cotización |
| GET | `/admin/dashboard` | Estadísticas admin |
| POST | `/admin/products` | Crear producto |

**Formato de respuesta:**
```json
{
  "data": { ... },
  "message": "Success",
  "timestamp": "2025-11-27T00:00:00.000Z"
}
```

**Formato de error:**
```json
{
  "error": "Mensaje de error",
  "statusCode": 400
}
```

---

## 9. CONCLUSIÓN

El diseño y arquitectura del sistema JSP Detailing representa una solución e-commerce moderna, escalable y segura que cumple con los estándares actuales de desarrollo web. La separación en capas, el uso de tecnologías probadas y la implementación de mejores prácticas garantizan un sistema robusto, mantenible y preparado para crecer con las necesidades del negocio.

**Fortalezas de la arquitectura:**
- ✅ Separación clara de responsabilidades
- ✅ Escalabilidad horizontal (frontend y backend independientes)
- ✅ Seguridad robusta con JWT y rate limiting
- ✅ Rendimiento optimizado (LCP < 2.5s)
- ✅ UX moderna con animaciones y efectos
- ✅ 100% responsive y accesible
- ✅ Código TypeScript fuertemente tipado
- ✅ Documentación completa de modelos y APIs

---

**Documento preparado por:** Equipo de Desarrollo JSP Detailing  
**Fecha:** Noviembre 2025  
**Versión:** 1.0

