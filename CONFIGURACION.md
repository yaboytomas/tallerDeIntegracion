# 📋 Guía de Configuración - Variables de Entorno

## Backend - Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# ============================================
# CONFIGURACIÓN DEL SERVIDOR
# ============================================
PORT=10000
NODE_ENV=production

# ============================================
# BASE DE DATOS - MongoDB Atlas
# ============================================
# Obtén tu connection string desde:
# https://cloud.mongodb.com/ → Database → Connect → Connect your application
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jsp-detailing?retryWrites=true&w=majority

# ============================================
# AUTENTICACIÓN - JWT
# ============================================
# Genera secretos aleatorios seguros usando:
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
JWT_ACCESS_SECRET=tu_super_secreto_aleatorio_para_access_token_min_32_caracteres
JWT_REFRESH_SECRET=tu_super_secreto_aleatorio_para_refresh_token_min_32_caracteres

# ============================================
# CLOUDINARY - Almacenamiento de Imágenes
# ============================================
# Obtén tus credenciales desde:
# https://console.cloudinary.com/
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# ============================================
# RESEND - Servicio de Emails
# ============================================
# Obtén tu API Key desde:
# https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email del remitente (debe ser de un dominio verificado en Resend)
EMAIL_FROM=noreply@jsp.zabotec.com

# ============================================
# URLs
# ============================================
# URL del frontend (Vercel)
FRONTEND_URL=https://jsp.zabotec.com

# URL del backend (Render)
BACKEND_URL=https://tu-backend.onrender.com

# ============================================
# CONFIGURACIÓN OPCIONAL
# ============================================
# Email del administrador principal (para notificaciones)
ADMIN_EMAIL=admin@jspdetailing.cl

# Rounds de bcrypt para hash de contraseñas (10-12 recomendado)
BCRYPT_ROUNDS=12
```

---

## Frontend - Variables de Entorno

Crea un archivo `.env` en la carpeta `frontend/` con el siguiente contenido:

```env
# ============================================
# CONFIGURACIÓN DEL FRONTEND
# ============================================

# URL del Backend API
# IMPORTANTE: NO incluyas /api al final, el código lo agrega automáticamente
# Ejemplo: https://tu-backend.onrender.com
VITE_API_URL=https://tu-backend.onrender.com
```

---

## 🔐 Cómo Generar JWT Secrets Seguros

### Opción 1: Usando Node.js (Recomendado)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Opción 2: Usando OpenSSL (Linux/Mac)
```bash
openssl rand -base64 32
```

### Opción 3: Usando un Generador Online
1. Ve a https://www.grc.com/passwords.htm
2. Usa el "63 random alpha-numeric characters" o "64 random hexadecimal characters"
3. Copia y pega en tu archivo .env

**⚠️ Importante**: Genera dos secretos diferentes, uno para JWT_ACCESS_SECRET y otro para JWT_REFRESH_SECRET

---

## 📝 Checklist de Configuración

### Antes de Deployar

- [ ] MongoDB connection string configurado y probado
- [ ] JWT secrets generados (32+ caracteres aleatorios)
- [ ] Cloudinary credentials obtenidas y configuradas
- [ ] Resend API key obtenida
- [ ] Dominio verificado en Resend (o usando email de prueba)
- [ ] Frontend URL configurada
- [ ] Backend URL configurada
- [ ] Todas las variables de entorno agregadas en Render
- [ ] Variable VITE_API_URL configurada en Vercel

### Después de Deployar

- [ ] Backend está accesible (prueba: https://tu-backend.onrender.com/health)
- [ ] Frontend está accesible
- [ ] Puedes registrar un nuevo usuario
- [ ] Recibes el email de verificación
- [ ] Puedes hacer login
- [ ] Puedes subir imágenes de productos
- [ ] Puedes crear un pedido
- [ ] Recibes el email de confirmación de pedido

---

## 🚨 Errores Comunes y Soluciones

### Error: "MongoServerError: bad auth"
**Causa**: Contraseña incorrecta o usuario no tiene permisos  
**Solución**: 
1. Verifica que el usuario tenga el rol "Read and write to any database"
2. Verifica que la contraseña en la connection string sea correcta
3. Si la contraseña tiene caracteres especiales, debe estar URL-encoded

### Error: "Domain not verified in Resend"
**Causa**: El dominio no está verificado en Resend  
**Solución**:
1. Verifica los registros DNS en tu proveedor
2. Espera hasta 48 horas para la verificación
3. Mientras tanto, usa `onboarding@resend.dev` como EMAIL_FROM

### Error: "Cloudinary upload failed"
**Causa**: Credenciales incorrectas de Cloudinary  
**Solución**:
1. Verifica el Cloud Name, API Key y API Secret
2. Asegúrate de no tener espacios extra al copiar/pegar
3. Verifica que la API esté habilitada en tu cuenta de Cloudinary

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"
**Causa**: Backend URL no configurada correctamente  
**Solución**:
1. Verifica que VITE_API_URL apunte a tu backend en Render
2. Verifica que FRONTEND_URL esté configurado correctamente en el backend
3. Redespliega ambos servicios después de cambiar las variables

---

## 🔄 Actualizar Variables de Entorno en Producción

### En Render (Backend)
1. Ve a tu servicio en Render
2. Click en "Environment" en el menú lateral
3. Modifica o agrega las variables necesarias
4. Click en "Save Changes"
5. Render automáticamente redesplegar el servicio

### En Vercel (Frontend)
1. Ve a tu proyecto en Vercel
2. Click en "Settings" → "Environment Variables"
3. Modifica o agrega las variables necesarias
4. Click en "Save"
5. Ve a "Deployments" y redespliega la última versión

---

## 📧 Contacto

Si tienes problemas con la configuración:
- **Email**: jspdetailing627@gmail.com
- **WhatsApp**: +56 9 3082 8558

