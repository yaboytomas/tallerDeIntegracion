# 🔧 Guía de Solución de Problemas

Esta guía te ayudará a resolver los problemas más comunes al configurar y usar el sistema JSP Detailing.

---

## 📋 Índice de Problemas

1. [Problemas con MongoDB](#problemas-con-mongodb)
2. [Problemas con Emails (Resend)](#problemas-con-emails-resend)
3. [Problemas con Imágenes (Cloudinary)](#problemas-con-imágenes-cloudinary)
4. [Problemas con el Backend (Render)](#problemas-con-el-backend-render)
5. [Problemas con el Frontend (Vercel)](#problemas-con-el-frontend-vercel)
6. [Problemas de CORS](#problemas-de-cors)
7. [Problemas de Autenticación](#problemas-de-autenticación)
8. [Problemas con Pedidos](#problemas-con-pedidos)
9. [Problemas de Performance](#problemas-de-performance)

---

## 🍃 Problemas con MongoDB

### Error: "MongoServerError: bad auth: Authentication failed"

**Causa**: Credenciales incorrectas o usuario sin permisos.

**Solución**:
```bash
# Verifica tu connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jsp-detailing?retryWrites=true&w=majority

# Asegúrate de:
1. Username correcto
2. Password correcto (sin espacios extra)
3. Nombre del cluster correcto
```

**Pasos adicionales**:
1. Ve a MongoDB Atlas → Database Access
2. Verifica que el usuario existe
3. Verifica que tiene el rol: "Read and write to any database"
4. Si la password tiene caracteres especiales (!, @, #, etc.), encódalos:
   - `@` → `%40`
   - `!` → `%21`
   - `#` → `%23`

---

### Error: "MongoServerError: IP address X.X.X.X is not allowed"

**Causa**: La IP de Render no está en la whitelist de MongoDB.

**Solución**:
1. Ve a MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Selecciona "Allow Access from Anywhere"
4. IP: `0.0.0.0/0`
5. Click "Confirm"
6. Espera 1-2 minutos para que se aplique

---

### Error: "MongooseServerSelectionError: Could not connect"

**Causa**: Connection string incorrecto o cluster no accesible.

**Solución**:
1. Verifica que la connection string esté completa
2. Debe incluir:
   - `mongodb+srv://` al inicio
   - Usuario y password
   - Cluster address
   - `/nombre-base-datos` después del cluster
   - `?retryWrites=true&w=majority` al final

**Ejemplo correcto**:
```
mongodb+srv://jspuser:MiPassword123@cluster0.abc123.mongodb.net/jsp-detailing?retryWrites=true&w=majority
```

---

### Base de datos lenta o timeout

**Causa**: Cluster muy lejos geográficamente.

**Solución**:
1. Ve a MongoDB Atlas
2. Crea un nuevo cluster en una región más cercana a Render
3. Opciones recomendadas:
   - **US East** (N. Virginia) - Más cercano a Render
   - **US West** (Oregon)
4. Migra los datos al nuevo cluster

---

## 📧 Problemas con Emails (Resend)

### No recibo ningún email

**Diagnóstico**:
1. Ve a https://resend.com/emails
2. Revisa si los emails aparecen en el dashboard
3. Verifica el estado: "Delivered", "Bounced", o "Failed"

**Causa 1**: Dominio no verificado
- **Síntoma**: Solo puedes enviar a tu propia dirección de email
- **Solución**: Verifica tu dominio en Resend o usa `onboarding@resend.dev` temporalmente

**Causa 2**: API Key incorrecta
- **Solución**: 
  1. Ve a https://resend.com/api-keys
  2. Crea una nueva API Key
  3. Actualiza `RESEND_API_KEY` en Render

**Causa 3**: EMAIL_FROM incorrecto
- **Solución**: 
  ```env
  # Sin dominio verificado:
  EMAIL_FROM=onboarding@resend.dev
  
  # Con dominio verificado:
  EMAIL_FROM=noreply@jsp.zabotec.com
  ```

---

### Emails llegan a spam

**Solución**:
1. **Verifica tu dominio** en Resend
2. **Agrega registros SPF y DKIM** en tu DNS:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.resend.com ~all
   
   Type: CNAME
   Name: resend._domainkey
   Value: resend._domainkey.resend.com
   ```
3. **Configura DMARC**:
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:admin@jsp.zabotec.com
   ```

---

### Error: "Domain not verified"

**Solución paso a paso**:

1. **Agregar dominio en Resend**:
   - Ve a https://resend.com/domains
   - Click "Add Domain"
   - Ingresa: `jsp.zabotec.com`

2. **Configurar DNS** (en tu proveedor: Cloudflare, GoDaddy, etc.):
   
   **Registro de verificación (TXT)**:
   ```
   Type: TXT
   Name: @
   Value: resend-verify=xxxxxxxxxxxxxxxx
   ```
   
   **Registro MX**:
   ```
   Type: MX
   Name: @
   Value: feedback-smtp.us-east-1.amazonses.com
   Priority: 10
   ```
   
   **Registro DKIM (CNAME)**:
   ```
   Type: CNAME
   Name: resend._domainkey
   Value: resend._domainkey.resend.com
   ```

3. **Esperar verificación**:
   - Puede tomar de 15 minutos a 48 horas
   - Verifica el estado en el dashboard de Resend

4. **Mientras tanto**:
   ```env
   # Usa este email temporal:
   EMAIL_FROM=onboarding@resend.dev
   ```

---

## 🖼️ Problemas con Imágenes (Cloudinary)

### Error: "Invalid API Key or Secret"

**Solución**:
1. Ve a https://console.cloudinary.com/
2. Verifica que copiaste correctamente:
   - **Cloud Name** (no el Display Name)
   - **API Key** (números)
   - **API Secret** (alfanumérico)
3. Verifica que no haya espacios extra al pegar
4. Actualiza las variables en Render:
   ```env
   CLOUDINARY_CLOUD_NAME=dxxxxxxxxx
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
   ```

---

### Imágenes no se muestran en el frontend

**Causa 1**: URL incorrecta
- **Solución**: Verifica que las URLs en la base de datos sean completas:
  ```
  https://res.cloudinary.com/tu-cloud-name/image/upload/v1234567890/products/imagen.jpg
  ```

**Causa 2**: Imágenes privadas en Cloudinary
- **Solución**:
  1. Ve a Settings → Security
  2. Asegúrate que "Resource Access Control" esté en "Public"

**Causa 3**: CORS en Cloudinary
- **Solución**:
  1. Ve a Settings → Security → Allowed fetch domains
  2. Agrega: `jsp.zabotec.com` y `*.vercel.app`

---

### Error al subir imágenes: "File too large"

**Causa**: Imagen muy pesada.

**Solución**:
1. Reduce el tamaño de la imagen antes de subir
2. Usa herramientas online:
   - https://tinypng.com/
   - https://squoosh.app/
3. O modifica el límite en el backend:
   ```typescript
   // backend/src/server.ts
   app.use(express.json({ limit: '10mb' }));
   app.use(express.urlencoded({ extended: true, limit: '10mb' }));
   ```

---

### Límite de almacenamiento alcanzado

**Síntoma**: Error al subir nuevas imágenes.

**Solución**:
1. **Opción 1**: Elimina imágenes viejas no utilizadas
   - Ve a Cloudinary → Media Library
   - Elimina imágenes de productos descontinuados

2. **Opción 2**: Upgrade a plan pagado
   - Ve a Settings → Billing
   - Planes desde $89/mes para 50GB

3. **Opción 3**: Optimiza imágenes
   - Reduce calidad en Cloudinary:
   ```typescript
   // En el código de subida
   transformation: {
     quality: 'auto:good',
     fetch_format: 'auto'
   }
   ```

---

## 🖥️ Problemas con el Backend (Render)

### Error: "Build failed"

**Diagnóstico**: Revisa los logs en Render Dashboard.

**Causa común**: Dependencies no instaladas
```bash
# Solución: Verifica package.json
cd backend
npm install
npm run build

# Si funciona local, debería funcionar en Render
```

**Causa 2**: TypeScript errors
- **Solución**: Corrige los errores de TypeScript mostrados en los logs

---

### Backend se apaga o reinicia constantemente

**Causa**: Plan gratuito de Render entra en "sleep" después de 15 minutos de inactividad.

**Solución**:
1. **Opción 1**: Actualiza a plan pagado ($7/mes)
2. **Opción 2**: Usa un servicio de "ping":
   - https://uptimerobot.com/ (gratis)
   - Configura ping cada 14 minutos a tu backend

---

### Error 503: Service Unavailable

**Causa**: Backend no está respondiendo.

**Diagnóstico**:
1. Ve a Render Dashboard → Logs
2. Busca errores recientes

**Soluciones comunes**:
1. **MongoDB no conecta**: Verifica connection string
2. **Puerto incorrecto**: Debe ser `PORT=10000`
3. **Crash al iniciar**: Revisa que todas las variables estén configuradas

---

### Logs muestran "Out of memory"

**Causa**: Plan gratuito tiene 512MB RAM.

**Solución**:
1. **Opción 1**: Actualiza a plan Starter ($7/mes con 2GB RAM)
2. **Opción 2**: Optimiza el código:
   ```typescript
   // Limita tamaño de queries
   const products = await Product.find().limit(100);
   
   // Usa paginación
   const products = await Product.find()
     .skip((page - 1) * limit)
     .limit(limit);
   ```

---

## 🌐 Problemas con el Frontend (Vercel)

### Build falla en Vercel

**Causa 1**: Variable de entorno faltante
```bash
# Solución:
# Vercel → Settings → Environment Variables
VITE_API_URL=https://tu-backend.onrender.com
```

**Causa 2**: TypeScript errors
- **Solución**: Corre localmente y corrige errores:
  ```bash
  cd frontend
  npm run build
  ```

**Causa 3**: Dependencies outdated
```bash
# Solución:
cd frontend
npm update
npm install
```

---

### Frontend muestra "Network Error" o "Failed to fetch"

**Diagnóstico**:
1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Busca peticiones fallidas
4. Ve a "Console" para ver errores

**Causa 1**: VITE_API_URL incorrecta
```env
# Incorrecto:
VITE_API_URL=https://tu-backend.onrender.com/api

# Correcto:
VITE_API_URL=https://tu-backend.onrender.com
```

**Causa 2**: Backend no está funcionando
- **Verifica**: Abre `https://tu-backend.onrender.com/health` en el navegador
- **Debe mostrar**: `{"status":"ok","mongodb":"connected"}`

---

### Cambios no se reflejan después de deployar

**Causa**: Caché del navegador o CDN.

**Solución**:
1. **Fuerza re-deploy en Vercel**:
   - Ve a Deployments
   - Click en los 3 puntos → "Redeploy"
   - Selecciona "Use existing Build Cache: NO"

2. **Limpia caché del navegador**:
   - Chrome: `Ctrl + Shift + Delete`
   - Selecciona "Cached images and files"

3. **Hard refresh**:
   - Windows: `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

---

## 🔄 Problemas de CORS

### Error: "Access-Control-Allow-Origin"

**Síntoma**: Console muestra error de CORS.

**Causa**: Frontend URL no configurada en backend.

**Solución**:
```env
# En Render (Backend)
FRONTEND_URL=https://jsp.zabotec.com

# Si tienes múltiples dominios:
FRONTEND_URL=https://jsp.zabotec.com,https://jsp-detailing.vercel.app
```

**Verifica backend/src/server.ts**:
```typescript
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

---

### CORS solo falla en producción, no en local

**Causa**: Variable FRONTEND_URL no incluye el dominio de producción.

**Solución**:
1. Ve a Render → Environment Variables
2. Actualiza FRONTEND_URL:
   ```
   FRONTEND_URL=https://jsp.zabotec.com,http://localhost:5173
   ```
3. Guarda cambios (Render re-desplegar automáticamente)

---

## 🔐 Problemas de Autenticación

### Error: "Invalid token" o "jwt malformed"

**Causa**: Token corrupto o expirado.

**Solución**:
1. **Para usuarios**: Cierra sesión y vuelve a iniciar
2. **Como desarrollador**: Limpia localStorage:
   ```javascript
   // En DevTools Console (F12)
   localStorage.clear();
   window.location.reload();
   ```

---

### No puedo iniciar sesión después de registrarme

**Causa 1**: Email no verificado
- **Solución**: Verifica tu email y haz click en el link

**Causa 2**: Password incorrecta
- **Solución**: Usa "Olvidé mi contraseña" para resetear

**Causa 3**: Usuario no existe en BD
- **Diagnóstico**: Revisa los logs del backend al registrarte
- **Solución**: Verifica que MongoDB esté conectado

---

### Token expira muy rápido

**Causa**: JWT_ACCESS_SECRET configurado con expiración muy corta.

**Solución**: Actualiza la configuración:
```typescript
// backend/src/utils/jwt.ts
export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, JWT_ACCESS_SECRET, { 
    expiresIn: '1h' // Cambia a '1h', '2h', etc.
  });
}
```

---

## 📦 Problemas con Pedidos

### Error: "Algunos productos en tu carrito ya no están disponibles"

**Causa**: Productos sin stock o inactivos.

**Solución**:
1. Ve al Admin Panel
2. Revisa los productos en el carrito del usuario
3. Verifica:
   - Stock > 0
   - Status = "active"
4. Actualiza stock o reactiva productos

---

### Pedido creado pero sin email de confirmación

**Causa**: Error al enviar email (Resend).

**Diagnóstico**:
1. Revisa los logs del backend en Render
2. Busca: "Email sent" o "Error sending email"

**Solución**:
1. Verifica configuración de Resend
2. Verifica que `EMAIL_FROM` sea correcto
3. El pedido se creó correctamente, solo faltó el email

---

### Cálculo de IVA incorrecto

**Causa**: Lógica de cálculo mal implementada.

**Verificar**:
```typescript
// Debe ser:
const basePrice = 10000;
const iva = Math.round(basePrice * 0.19); // 1900
const total = basePrice + iva; // 11900

// NO debe ser:
const priceWithIVA = 11900;
const basePrice = priceWithIVA / 1.19; // INCORRECTO
```

---

## 🚀 Problemas de Performance

### Página carga muy lento

**Diagnóstico**:
1. Abre DevTools (F12) → Network tab
2. Identifica qué peticiones son lentas

**Solución 1**: Optimiza imágenes
```typescript
// Usa transformaciones de Cloudinary
const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_500,q_auto,f_auto/${publicId}`;
```

**Solución 2**: Implementa paginación
```typescript
// Backend
const products = await Product.find()
  .limit(20)
  .skip((page - 1) * 20);

// Frontend
// Usa infinite scroll o botón "Cargar más"
```

**Solución 3**: Backend en sleep (Render gratuito)
- Render pone el servicio en sleep después de 15 min de inactividad
- Primera petición tarda ~30 segundos en "despertar"
- Solución: Plan pagado o servicio de ping

---

### Base de datos lenta

**Diagnóstico**: Queries sin índices.

**Solución**: Agrega índices en MongoDB:
```typescript
// backend/src/models/Product.ts
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ slug: 1 }, { unique: true });
```

---

## 🆘 Solución de Emergencia

Si nada funciona:

### Reset Completo del Backend

```bash
# 1. Elimina el servicio en Render
# 2. Crea uno nuevo con la misma configuración
# 3. Agrega todas las variables de entorno
# 4. Despliega
```

### Reset Completo del Frontend

```bash
# 1. Elimina el proyecto en Vercel
# 2. Importa de nuevo desde GitHub
# 3. Configura VITE_API_URL
# 4. Despliega
```

### Reset de MongoDB

```bash
# ⚠️ CUIDADO: Esto borra TODOS los datos

# 1. Ve a MongoDB Atlas → Collections
# 2. Click en tu base de datos
# 3. Click en "..." → Drop Database
# 4. Crea una nueva base de datos
# 5. El backend la poblará automáticamente al iniciar
```

---

## 📞 ¿Necesitas Ayuda?

Si seguiste todas las soluciones y aún tienes problemas:

**Email**: jspdetailing627@gmail.com  
**WhatsApp**: +56 9 3082 8558  
**Sitio**: https://jsp.zabotec.com

**Incluye en tu mensaje**:
1. Descripción del problema
2. Screenshots de los errores
3. Logs del backend (si aplica)
4. Pasos que ya intentaste

---

## 📚 Recursos Adicionales

- **MongoDB Docs**: https://docs.mongodb.com/
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Resend Docs**: https://resend.com/docs
- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/

---

**Última actualización**: Diciembre 2024

