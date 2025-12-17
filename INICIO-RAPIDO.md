# 🚀 Guía de Inicio Rápido - JSP Detailing

Esta guía te ayudará a tener el sistema funcionando en **menos de 30 minutos**.

---

## ⚡ 5 Pasos para Poner en Producción

### 1️⃣ Crear Cuentas Necesarias (10 minutos)

#### Registrarse en estos servicios (en este orden):

1. **GitHub** → https://github.com/signup
   - Para almacenar el código

2. **MongoDB Atlas** → https://www.mongodb.com/cloud/atlas/register
   - Base de datos gratis

3. **Cloudinary** → https://cloudinary.com/users/register/free
   - Almacenamiento de imágenes gratis

4. **Resend** → https://resend.com/signup
   - Emails gratis (3,000/mes)

5. **Render** → https://render.com/ (con GitHub)
   - Hosting del backend gratis

6. **Vercel** → https://vercel.com/signup (con GitHub)
   - Hosting del frontend gratis

---

### 2️⃣ Configurar MongoDB (5 minutos)

1. En MongoDB Atlas, click **"Build a Database"**
2. Selecciona el plan **FREE (M0)**
3. Elige una región cercana
4. Click **"Create Cluster"**
5. Ve a **"Database Access"** → **"Add New Database User"**
   - Username: `jspuser`
   - Password: (genera una segura)
   - Role: **"Read and write to any database"**
6. Ve a **"Network Access"** → **"Add IP Address"**
   - Selecciona **"Allow Access from Anywhere"** (`0.0.0.0/0`)
7. Ve a **"Database"** → **"Connect"** → **"Connect your application"**
   - Copia la connection string

**Tu connection string se verá así:**
```
mongodb+srv://jspuser:TU_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

### 3️⃣ Obtener Credenciales (5 minutos)

#### Cloudinary
1. Ve a https://console.cloudinary.com/
2. Copia estos 3 valores del Dashboard:
   - **Cloud Name**: `dxxxxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### Resend
1. Ve a https://resend.com/api-keys
2. Click **"Create API Key"**
3. Nombre: `jsp-production`
4. Copia la API Key (comienza con `re_`)

#### Generar JWT Secrets
En tu terminal, ejecuta dos veces:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Guarda ambos resultados (uno para ACCESS, otro para REFRESH)

---

### 4️⃣ Deployar Backend en Render (5 minutos)

1. Ve a https://render.com/
2. Click **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name**: `jsp-detailing-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

5. **Environment Variables** (agregar todas):

```
PORT=10000
NODE_ENV=production
MONGODB_URI=mongodb+srv://jspuser:PASSWORD@cluster0.xxxxx.mongodb.net/jsp-detailing?retryWrites=true&w=majority
JWT_ACCESS_SECRET=primer_secreto_generado_aqui
JWT_REFRESH_SECRET=segundo_secreto_generado_aqui
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@jsp.zabotec.com
FRONTEND_URL=https://jsp.zabotec.com
BACKEND_URL=https://jsp-detailing-backend.onrender.com
ADMIN_EMAIL=admin@jspdetailing.cl
BCRYPT_ROUNDS=12
```

6. Click **"Create Web Service"**
7. Espera 5-10 minutos mientras se despliega
8. **Copia la URL** que te dan (la necesitarás para el frontend)

---

### 5️⃣ Deployar Frontend en Vercel (5 minutos)

1. Ve a https://vercel.com/
2. Click **"Add New..."** → **"Project"**
3. Selecciona tu repositorio
4. Configuración:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables**:
```
VITE_API_URL=https://jsp-detailing-backend.onrender.com
```
(Usa la URL que copiaste de Render, SIN `/api` al final)

6. Click **"Deploy"**
7. Espera 2-3 minutos
8. ¡Tu sitio estará listo!

---

## ✅ Verificar que Todo Funcione

### 1. Backend
Visita: `https://tu-backend.onrender.com/health`

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2024-12-17T...",
  "mongodb": "connected"
}
```

### 2. Frontend
Visita tu URL de Vercel y prueba:
- ✅ Ver productos
- ✅ Registrarte (deberías recibir un email)
- ✅ Hacer login
- ✅ Agregar productos al carrito

---

## 🎯 Crear tu Primer Administrador

### Método 1: Usando MongoDB Atlas (Más Fácil)

1. Regístrate normalmente en el sitio web
2. Ve a https://cloud.mongodb.com/
3. Click en **"Browse Collections"** en tu cluster
4. Selecciona la base de datos `jsp-detailing`
5. Selecciona la colección `users`
6. Encuentra tu usuario recién creado
7. Click en **"Edit"**
8. Cambia el campo `role` de `"customer"` a `"admin"`
9. Click en **"Update"**
10. Recarga la página y ya eres admin

### Método 2: Usando la API

Con Postman o similar, haz una petición POST a:

```
POST https://tu-backend.onrender.com/api/admin/users/create-admin
Content-Type: application/json

{
  "email": "admin@jspdetailing.cl",
  "password": "Admin123!@#",
  "firstName": "Admin",
  "lastName": "Principal",
  "rut": "12.345.678-9",
  "phone": "+56 9 1234 5678"
}
```

---

## 📧 Configurar Dominio de Email (Opcional pero Recomendado)

### Sin dominio verificado:
- ⚠️ Solo podrás enviar emails a tu propia dirección de email
- Funciona para pruebas

### Con dominio verificado:
- ✅ Podrás enviar emails a cualquier dirección
- Necesitas acceso a la configuración DNS de tu dominio

#### Pasos:
1. Ve a https://resend.com/domains
2. Click **"Add Domain"**
3. Ingresa: `jsp.zabotec.com`
4. Copia los registros DNS que te proporciona
5. Agrégalos en tu proveedor de DNS (Cloudflare, GoDaddy, etc.)
6. Espera 24-48 horas para verificación
7. Una vez verificado, los emails funcionarán con `noreply@jsp.zabotec.com`

**Registros DNS típicos:**
```
Type: TXT
Name: @
Value: resend-verify=xxxxxxxxxxxxxxxx

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

---

## 🆘 ¿Problemas?

### Backend no inicia
- **Revisa los logs en Render**: Dashboard → Logs
- **Causa común**: Variable de entorno mal configurada
- **Solución**: Verifica que todas las variables estén correctamente copiadas

### Frontend no se conecta al backend
- **Verifica**: `VITE_API_URL` en Vercel
- **Debe ser**: La URL completa de Render SIN `/api` al final
- **Correcto**: `https://jsp-detailing-backend.onrender.com`
- **Incorrecto**: `https://jsp-detailing-backend.onrender.com/api`

### No recibo emails
- **Sin dominio verificado**: Solo recibirás en el email de tu cuenta de Resend
- **Con dominio**: Verifica los registros DNS
- **Revisa**: Dashboard de Resend para ver si los emails fueron enviados

### Base de datos no conecta
- **Verifica**: IP `0.0.0.0/0` está en la whitelist de MongoDB Atlas
- **Verifica**: Usuario tiene permisos de lectura/escritura
- **Verifica**: Password en la connection string es correcta

---

## 📱 Configurar Dominio Personalizado

### En Vercel (Frontend)
1. Ve a tu proyecto → **Settings** → **Domains**
2. Agrega tu dominio: `jsp.zabotec.com`
3. Sigue las instrucciones para configurar DNS
4. Típicamente necesitas agregar un registro CNAME:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### En Render (Backend) - Opcional
1. Ve a tu servicio → **Settings** → **Custom Domain**
2. Agrega un subdominio: `api.jsp.zabotec.com`
3. Sigue las instrucciones de DNS

---

## 📊 Monitorear tu Aplicación

### Render Dashboard
- Ve a: https://dashboard.render.com/
- Revisa logs en tiempo real
- Ve métricas de CPU y memoria
- Configura alertas

### Vercel Dashboard
- Ve a: https://vercel.com/dashboard
- Ve analytics de tráfico
- Revisa logs de build
- Ve métricas de performance

### MongoDB Atlas
- Ve a: https://cloud.mongodb.com/
- Monitorea uso de storage
- Ve queries lentas
- Configura backups automáticos

---

## 🎓 Próximos Pasos

1. **Agregar productos**:
   - Inicia sesión como admin
   - Ve a `/admin` en tu sitio
   - Crea categorías primero
   - Luego agrega productos

2. **Configurar banners**:
   - Ve a "Banners" en el panel admin
   - Sube imágenes llamativas para el home

3. **Personalizar contenido**:
   - Ve a "Contenido" en el panel admin
   - Edita las páginas: Políticas, Quiénes Somos, etc.

4. **Probar flujo completo**:
   - Registra un usuario de prueba
   - Agrega productos al carrito
   - Completa una compra
   - Verifica que los emails lleguen

---

## 📞 Soporte

**Email**: jspdetailing627@gmail.com  
**WhatsApp**: +56 9 3082 8558  
**Sitio**: https://jsp.zabotec.com

---

## ✨ ¡Felicidades!

Si llegaste hasta aquí, tu tienda está funcionando. 🎉

Ahora puedes:
- ✅ Recibir pedidos
- ✅ Gestionar productos
- ✅ Procesar órdenes
- ✅ Comunicarte con clientes

**¡A vender!** 🚀

