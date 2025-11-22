# Debug: Error de Inicio de Sesión

## Pasos para Solucionar

### 1. ¿El backend está corriendo?

Verifica que el backend esté ejecutándose en el puerto 5000:

```bash
cd backend
npm run dev
```

Deberías ver:
```
Server running on port 5000
Connected to MongoDB
```

---

### 2. ¿Creaste el usuario admin?

Ejecuta el script de creación del admin:

```bash
cd backend
npm run create-admin
```

Deberías ver:
```
✅ Admin user created successfully!
Email: admin@jspdetailing.cl
Password: Admin123!@#
```

**Nota:** Si dice "Admin user already exists", entonces el admin ya fue creado.

---

### 3. Credenciales para probar

**Admin (default):**
```
Email: admin@jspdetailing.cl
Password: Admin123!@#
```

**Usuario Cliente (el que acabas de crear):**
- Usa el email y contraseña que registraste

---

### 4. Verifica la conexión con MongoDB

En el backend, revisa que esté conectado a MongoDB Atlas:

```bash
# En backend/.env debe estar:
MONGODB_URI=tu_connection_string_de_mongodb_atlas
```

---

### 5. Prueba el endpoint directamente

Abre una nueva terminal y prueba el login con curl o Postman:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jspdetailing.cl",
    "password": "Admin123!@#"
  }'
```

---

### 6. Errores comunes

**"Credenciales inválidas" puede significar:**

1. **Email incorrecto**: El email se guarda en minúsculas. Asegúrate de escribirlo correcto.

2. **Contraseña incorrecta**: La contraseña es case-sensitive.
   - Admin default: `Admin123!@#` (con mayúsculas y símbolos)

3. **Usuario no existe**: El usuario no fue creado aún.

4. **Backend no está corriendo**: El frontend no puede conectarse a la API.

5. **MongoDB desconectado**: La base de datos no está accesible.

---

### 7. Verifica los logs del backend

Cuando intentas hacer login, el backend debería mostrar en consola:

```
Login attempt for: tu-email@ejemplo.com
```

Si ves errores, revisa qué dice exactamente.

---

### 8. Restablece la contraseña del admin

Si olvidaste la contraseña del admin, puedes actualizarla directamente en MongoDB:

#### Opción A: Crear nuevo admin con contraseña conocida

```bash
# En MongoDB Atlas (usando Mongo Shell o Compass)
# 1. Borra el admin existente
db.users.deleteOne({ email: "admin@jspdetailing.cl" })

# 2. Vuelve a crear el admin
cd backend
npm run create-admin
```

#### Opción B: Actualizar contraseña manualmente

```typescript
// Crea un script temporal: backend/src/scripts/resetAdminPassword.ts
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { hashPassword } from '../utils/password';

dotenv.config();

async function resetPassword() {
  await mongoose.connect(process.env.MONGODB_URI!);
  
  const newPassword = 'Admin123!@#';
  const passwordHash = await hashPassword(newPassword);
  
  await User.updateOne(
    { email: 'admin@jspdetailing.cl' },
    { passwordHash }
  );
  
  console.log('✅ Password reset successfully!');
  console.log('New password:', newPassword);
  
  await mongoose.disconnect();
}

resetPassword();
```

Luego ejecuta:
```bash
npx tsx src/scripts/resetAdminPassword.ts
```

---

## Checklist de Diagnóstico

- [ ] Backend está corriendo en puerto 5000
- [ ] MongoDB está conectado (ver logs del backend)
- [ ] Usuario admin fue creado
- [ ] Email es exactamente: `admin@jspdetailing.cl` (minúsculas)
- [ ] Password es exactamente: `Admin123!@#` (case-sensitive)
- [ ] Frontend está conectado a `http://localhost:5000/api`
- [ ] No hay errores en la consola del navegador (F12)
- [ ] No hay errores en la consola del backend

---

## Si nada funciona

Envíame:
1. Los logs del backend cuando intentas hacer login
2. Los errores de la consola del navegador (F12 > Console)
3. Confirmación de que el backend está corriendo
4. El mensaje exacto que ves al crear el admin

---

**Tip:** El error "Credenciales inválidas" es el mensaje genérico. El problema real suele estar en uno de estos puntos:
- Backend no corriendo
- Usuario no creado
- Contraseña escrita incorrectamente (case-sensitive)

