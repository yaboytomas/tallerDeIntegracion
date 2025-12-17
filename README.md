# JSP Detailing - E-commerce Platform

Plataforma de comercio electrónico completa para JSP Detailing, especializada en productos de detailing automotriz.

## 📋 Tabla de Contenidos

- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Cuentas Necesarias](#cuentas-necesarias)
- [Instalación Local](#instalación-local)
- [Configuración de Servicios](#configuración-de-servicios)
- [Variables de Entorno](#variables-de-entorno)
- [Deployment](#deployment)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## 🚀 Características Principales

### Para Clientes
- ✅ Registro y autenticación de usuarios
- ✅ Catálogo de productos con búsqueda y filtros
- ✅ Carrito de compras (persistente para usuarios registrados)
- ✅ Proceso de checkout completo
- ✅ Gestión de pedidos y estados
- ✅ Solicitud de cotizaciones
- ✅ Cambio de contraseña y gestión de perfil
- ✅ Verificación de email
- ✅ Recuperación de contraseña
- ✅ Notificaciones por email

### Para Administradores
- ✅ Panel de administración completo
- ✅ Gestión de productos (CRUD completo)
- ✅ Gestión de categorías
- ✅ Gestión de banners del home
- ✅ Gestión de páginas de contenido
- ✅ Gestión de pedidos con cambio de estados
- ✅ Gestión de usuarios y administradores
- ✅ Dashboard con estadísticas

---

## 💻 Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** como build tool
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **React Hook Form** para formularios
- **Axios** para peticiones HTTP
- **Zod** para validación

### Backend
- **Node.js** con Express
- **TypeScript**
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **Bcrypt** para hash de contraseñas
- **Cloudinary** para almacenamiento de imágenes
- **Resend** para envío de emails

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18.x o superior ([Descargar](https://nodejs.org/))
- **npm** o **yarn** (incluido con Node.js)
- **Git** ([Descargar](https://git-scm.com/))
- Un editor de código (recomendado: [VS Code](https://code.visualstudio.com/))

---

## 🔑 Cuentas Necesarias

Necesitarás crear cuentas en los siguientes servicios:

### 1. GitHub (Control de versiones)
- **URL**: https://github.com/
- **Costo**: Gratis
- **Uso**: Almacenar el código fuente

### 2. MongoDB Atlas (Base de datos)
- **URL**: https://www.mongodb.com/cloud/atlas/register
- **Costo**: Gratis (tier M0)
- **Uso**: Base de datos en la nube

### 3. Cloudinary (Almacenamiento de imágenes)
- **URL**: https://cloudinary.com/users/register/free
- **Costo**: Gratis (hasta 25 GB)
- **Uso**: Almacenar imágenes de productos, categorías y banners

### 4. Resend (Servicio de emails)
- **URL**: https://resend.com/signup
- **Costo**: Gratis (hasta 3,000 emails/mes)
- **Uso**: Envío de emails transaccionales (verificación, recuperación de contraseña, confirmaciones)

### 5. Render (Backend Hosting)
- **URL**: https://render.com/
- **Costo**: Gratis (con limitaciones)
- **Uso**: Hosting del servidor backend (API)

### 6. Vercel (Frontend Hosting)
- **URL**: https://vercel.com/signup
- **Costo**: Gratis
- **Uso**: Hosting del frontend (React app)

---

## 🛠️ Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/tDI.git
cd tDI
```

### 2. Instalar Dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

---

## ⚙️ Configuración de Servicios

### 1. MongoDB Atlas

#### Paso 1: Crear un Cluster
1. Inicia sesión en [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click en "Build a Database"
3. Selecciona el plan **FREE (M0)**
4. Elige la región más cercana a tu ubicación
5. Dale un nombre a tu cluster (ej: `jsp-detailing-cluster`)
6. Click en "Create Cluster"

#### Paso 2: Crear un Usuario de Base de Datos
1. Ve a "Database Access" en el menú lateral
2. Click en "Add New Database User"
3. Selecciona "Password" como método de autenticación
4. Ingresa un **username** y **password** (¡guárdalos!)
5. En "Built-in Role", selecciona "Read and write to any database"
6. Click en "Add User"

#### Paso 3: Permitir Acceso desde Cualquier IP
1. Ve a "Network Access" en el menú lateral
2. Click en "Add IP Address"
3. Click en "Allow Access from Anywhere" (o agrega `0.0.0.0/0`)
4. Click en "Confirm"

#### Paso 4: Obtener la Connection String
1. Ve a "Database" en el menú lateral
2. Click en "Connect" en tu cluster
3. Selecciona "Connect your application"
4. Copia la connection string (se ve así):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Reemplaza `<username>` y `<password>` con tus credenciales
6. Guarda esta URL para las variables de entorno

---

### 2. Cloudinary

#### Paso 1: Crear una Cuenta
1. Regístrate en [Cloudinary](https://cloudinary.com/users/register/free)
2. Completa el proceso de verificación de email

#### Paso 2: Obtener las Credenciales
1. Ve a tu Dashboard en https://console.cloudinary.com/
2. Encontrarás tus credenciales en la sección "Account Details":
   - **Cloud Name**: `dxxxxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz123456`
3. Guarda estas credenciales para las variables de entorno

#### Paso 3: Configurar Carpetas (Opcional)
- Cloudinary creará automáticamente las carpetas `products/`, `categories/`, y `banners/` cuando subas las primeras imágenes

---

### 3. Resend (Servicio de Emails)

#### Paso 1: Crear una Cuenta
1. Regístrate en [Resend](https://resend.com/signup)
2. Verifica tu email

#### Paso 2: Obtener API Key
1. Ve a [API Keys](https://resend.com/api-keys)
2. Click en "Create API Key"
3. Dale un nombre (ej: `jsp-detailing-production`)
4. Copia la API Key (solo se muestra una vez)
5. Guárdala para las variables de entorno

#### Paso 3: Configurar Dominio Personalizado (Recomendado)
1. Ve a [Domains](https://resend.com/domains)
2. Click en "Add Domain"
3. Ingresa tu dominio (ej: `jsp.zabotec.com`)
4. Sigue las instrucciones para agregar los registros DNS:
   - Ve a tu proveedor de DNS (ej: Cloudflare, GoDaddy)
   - Agrega los registros TXT, MX y CNAME que te proporciona Resend
5. Espera a que el dominio sea verificado (puede tomar hasta 48 horas)

**Registros DNS Típicos:**
```
Type: TXT
Name: @
Value: resend-verify=xxxxxxxxxxxxxxxx

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

#### Paso 4: Configurar Email FROM
- Una vez verificado el dominio, podrás enviar desde `noreply@jsp.zabotec.com`
- Si no verificas el dominio, solo podrás enviar emails a tu propia dirección de email

---

### 4. Render (Backend)

#### Paso 1: Crear una Cuenta
1. Regístrate en [Render](https://render.com/) usando tu cuenta de GitHub

#### Paso 2: Crear un Web Service
1. Click en "New +" → "Web Service"
2. Conecta tu repositorio de GitHub
3. Selecciona el repositorio `tDI`
4. Configura el servicio:
   - **Name**: `jsp-detailing-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

#### Paso 3: Configurar Variables de Entorno
En la sección "Environment Variables", agrega todas las variables del backend (ver sección de Variables de Entorno más abajo)

#### Paso 4: Deploy
1. Click en "Create Web Service"
2. Render automáticamente construirá y desplegará tu backend
3. Una vez completado, obtendrás una URL como: `https://jsp-detailing-backend.onrender.com`
4. Guarda esta URL para configurar el frontend

---

### 5. Vercel (Frontend)

#### Paso 1: Crear una Cuenta
1. Regístrate en [Vercel](https://vercel.com/signup) usando tu cuenta de GitHub

#### Paso 2: Importar el Proyecto
1. Click en "Add New..." → "Project"
2. Selecciona tu repositorio `tDI` de GitHub
3. Configura el proyecto:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Paso 3: Configurar Variables de Entorno
En "Environment Variables", agrega:
```
VITE_API_URL=https://tu-backend.onrender.com
```

#### Paso 4: Deploy
1. Click en "Deploy"
2. Vercel automáticamente construirá y desplegará tu frontend
3. Obtendrás una URL como: `https://jsp-detailing.vercel.app`

#### Paso 5: Configurar Dominio Personalizado (Opcional)
1. Ve a tu proyecto en Vercel
2. Click en "Settings" → "Domains"
3. Agrega tu dominio personalizado (ej: `jsp.zabotec.com`)
4. Sigue las instrucciones para configurar los DNS

---

## 🔐 Variables de Entorno

### Backend (.env)

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# Puerto del servidor
PORT=10000

# Entorno (development o production)
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jsp-detailing?retryWrites=true&w=majority

# JWT Secrets (genera strings aleatorios seguros)
JWT_ACCESS_SECRET=tu_super_secreto_aleatorio_para_access_token_min_32_caracteres
JWT_REFRESH_SECRET=tu_super_secreto_aleatorio_para_refresh_token_min_32_caracteres

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@jsp.zabotec.com

# URLs
FRONTEND_URL=https://jsp.zabotec.com
BACKEND_URL=https://tu-backend.onrender.com

# Admin por defecto (opcional - para crear el primer admin)
ADMIN_EMAIL=admin@jspdetailing.cl

# Bcrypt (rounds para hash de contraseñas)
BCRYPT_ROUNDS=12
```

**Cómo generar JWT Secrets:**
```bash
# En terminal (Linux/Mac):
openssl rand -base64 32

# O usando Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

### Frontend (.env)

Crea un archivo `.env` en la carpeta `frontend/` con el siguiente contenido:

```env
# URL del backend API
VITE_API_URL=https://tu-backend.onrender.com
```

**⚠️ Importante:**
- En Vercel, configura esta variable en el dashboard (Settings → Environment Variables)
- NO incluyas el `/api` al final, el código ya lo agrega automáticamente

---

## 🚀 Deployment

### Deploy Automático con GitHub

#### Backend (Render)
1. Haz commit de tus cambios:
   ```bash
   git add .
   git commit -m "Actualización del backend"
   git push origin main
   ```
2. Render detectará automáticamente el push y redesplegar

#### Frontend (Vercel)
1. Haz commit de tus cambios:
   ```bash
   git add .
   git commit -m "Actualización del frontend"
   git push origin main
   ```
2. Vercel detectará automáticamente el push y redesplegar

### Deploy Manual

#### Backend (Render)
1. Ve a tu servicio en Render
2. Click en "Manual Deploy" → "Deploy latest commit"

#### Frontend (Vercel)
1. Ve a tu proyecto en Vercel
2. Click en "Deployments" → "Redeploy"

---

## 📁 Estructura del Proyecto

```
tDI/
├── backend/                 # Servidor Node.js/Express
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/          # Modelos de MongoDB
│   │   ├── routes/          # Rutas de la API
│   │   ├── middleware/      # Middleware (auth, error handling)
│   │   ├── services/        # Servicios (email, cloudinary)
│   │   ├── utils/           # Utilidades
│   │   └── server.ts        # Punto de entrada
│   ├── .env                 # Variables de entorno (no incluido en git)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── context/         # Contextos de React (Auth, Cart)
│   │   ├── services/        # Servicios (API)
│   │   ├── utils/           # Utilidades
│   │   └── main.tsx         # Punto de entrada
│   ├── .env                 # Variables de entorno (no incluido en git)
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md               # Este archivo
```

---

## 🔧 Scripts Disponibles

### Backend

```bash
# Desarrollo (con hot-reload)
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint
```

### Frontend

```bash
# Desarrollo (con hot-reload)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

---

## 🎯 Crear el Primer Administrador

Una vez que el backend esté desplegado y funcionando:

### Opción 1: Desde el Backend (Terminal)

Conéctate al servidor de Render y ejecuta:

```bash
node dist/scripts/createAdmin.js
```

### Opción 2: Manualmente en MongoDB

1. Regístrate como usuario normal en el sitio web
2. Ve a MongoDB Atlas → Collections
3. Encuentra tu usuario en la colección `users`
4. Edita el campo `role` y cámbialo de `"customer"` a `"admin"`
5. Guarda los cambios

### Opción 3: Crear Script de Setup

El proyecto incluye un endpoint para crear el primer admin:

```bash
POST /api/admin/setup-first-admin
Body: {
  "email": "admin@jspdetailing.cl",
  "password": "TuPasswordSegura123!",
  "firstName": "Admin",
  "lastName": "Principal",
  "rut": "12.345.678-9",
  "phone": "+56 9 1234 5678"
}
```

---

## 📧 Configuración de Emails

### Emails Implementados

El sistema envía automáticamente emails para:

1. **Verificación de cuenta** (al registrarse)
2. **Recuperación de contraseña** (cuando el usuario olvida su contraseña)
3. **Confirmación de pedido** (cuando se crea un pedido)
4. **Actualización de estado de pedido** (cuando el admin cambia el estado)
5. **Confirmación de cotización** (cuando un usuario solicita una cotización)

### Plantillas de Email

Todos los emails incluyen:
- Diseño moderno y responsive
- Branding de JSP Detailing
- Enlaces dinámicos al sitio web
- Información de contacto

---

## 🔒 Seguridad

### Medidas Implementadas

- ✅ Contraseñas hasheadas con bcrypt (12 rounds)
- ✅ JWT para autenticación
- ✅ Refresh tokens para sesiones largas
- ✅ CORS configurado correctamente
- ✅ Validación de inputs en frontend y backend
- ✅ Rate limiting (implementado en Render automáticamente)
- ✅ Sanitización de datos
- ✅ HTTPS en producción

### Recomendaciones Adicionales

1. **Cambiar Secretos de JWT**: Genera nuevos secretos únicos para producción
2. **Backups de MongoDB**: Configura backups automáticos en MongoDB Atlas
3. **Monitoreo**: Usa los dashboards de Render y Vercel para monitorear el rendimiento
4. **Logs**: Revisa los logs regularmente para detectar errores

---

## 🐛 Troubleshooting

### Backend no se conecta a MongoDB
- Verifica que la IP `0.0.0.0/0` esté en la whitelist de MongoDB Atlas
- Verifica que el usuario de BD tenga permisos de lectura/escritura
- Verifica que la connection string sea correcta

### Emails no se envían
- Verifica que el dominio esté verificado en Resend
- Verifica que la API Key de Resend sea correcta
- Revisa los logs en el dashboard de Resend

### Frontend no se conecta al Backend
- Verifica que `VITE_API_URL` apunte al backend correcto
- Verifica que el backend esté funcionando (accede a `https://tu-backend.onrender.com/health`)
- Verifica la configuración de CORS en el backend

### Imágenes no se cargan
- Verifica las credenciales de Cloudinary
- Verifica que las carpetas en Cloudinary tengan los permisos correctos
- Revisa los logs para ver errores de subida

---

## 📞 Soporte

Para soporte técnico o consultas:

- **Email**: jspdetailing627@gmail.com
- **WhatsApp**: +56 9 3082 8558
- **Sitio Web**: https://jsp.zabotec.com

---

## 📝 Licencia

Este proyecto es propiedad de JSP Detailing. Todos los derechos reservados.

---

## 🙏 Agradecimientos

Desarrollado con ❤️ para JSP Detailing

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024

