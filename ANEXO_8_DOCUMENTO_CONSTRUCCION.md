# ANEXO 8 – DOCUMENTO DE CONSTRUCCIÓN

**Proyecto:** JSP Detailing - E-commerce de Productos de Detailing Automotriz  
**Fecha:** Noviembre 2025  
**Versión:** 1.0

---

## 1. PREPARACIÓN DEL ENTORNO DE DESARROLLO

### 1.1 Herramientas Utilizadas

**Frontend:**
- Visual Studio Code
- Node.js v18+
- npm/pnpm
- Git para control de versiones
- Chrome DevTools para debugging

**Backend:**
- Node.js v18+
- MongoDB Compass (GUI para MongoDB)
- Postman para pruebas de API
- Thunder Client (VS Code extension)

**Servicios Cloud:**
- MongoDB Atlas (base de datos)
- Cloudinary (almacenamiento de imágenes)
- Render (backend hosting)
- Vercel (frontend hosting)
- Resend (envío de emails)

### 1.2 Inicialización del Proyecto

**Backend:**
```bash
mkdir backend
cd backend
npm init -y
npm install express mongoose typescript ts-node
npm install --save-dev @types/express @types/node nodemon
npx tsc --init
```

**Frontend:**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom axios tailwindcss
npx tailwindcss init
```

---

## 2. IMPLEMENTACIÓN DEL BACKEND

### 2.1 Configuración del Servidor Express

**Archivo:** `backend/src/server.ts`

```typescript
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';

import { connectDB } from './config/database';
import routes from './routes';
import { securityHeaders, apiLimiter } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy para Render
app.set('trust proxy', 1);

// Conectar a MongoDB
connectDB();

// Middleware
app.use(securityHeaders);
app.use(compression());
app.use(morgan('dev'));

// CORS configurado para múltiples dominios
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://jspdetailing.vercel.app',
  'https://jsp.zabotec.com',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use('/api', apiLimiter);

// Rutas
app.use('/api', routes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2.2 Conexión a MongoDB

**Archivo:** `backend/src/config/database.ts`

```typescript
import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está definida');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}
```

### 2.3 Implementación de Modelos Mongoose

**Archivo:** `backend/src/models/Product.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  slug: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  brand?: string;
  basePrice: number;
  offerPrice?: number;
  priceWithIVA: number;
  stock: number;
  images: string[];
  featured: boolean;
  status: 'active' | 'inactive' | 'out_of_stock';
}

const productSchema = new Schema<IProduct>({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: String,
  basePrice: { type: Number, required: true },
  offerPrice: Number,
  priceWithIVA: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [String],
  featured: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  }
}, { timestamps: true });

// Índices
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ status: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
```

### 2.4 Controlador de Productos con Búsqueda

**Archivo:** `backend/src/controllers/productController.ts`

```typescript
import { Request, Response } from 'express';
import { Product } from '../models/Product';

export async function searchProducts(req: Request, res: Response): Promise<void> {
  try {
    const { q, limit = '10' } = req.query;

    if (!q || typeof q !== 'string') {
      res.json({ products: [], categories: [], brands: [] });
      return;
    }

    const limitNum = parseInt(limit as string, 10);

    // Búsqueda de texto completo con MongoDB
    const products = await Product.find({
      $text: { $search: q },
      status: 'active',
    })
      .limit(limitNum)
      .select('name slug images basePrice offerPrice stock brand')
      .lean();

    const formattedProducts = products.map((product: any) => ({
      ...product,
      priceWithIVA: product.basePrice * 1.19,
      offerPriceWithIVA: product.offerPrice ? product.offerPrice * 1.19 : null,
    }));

    res.json({
      products: formattedProducts,
      categories: [],
      brands: []
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
}
```

### 2.5 Middleware de Autenticación JWT

**Archivo:** `backend/src/middleware/auth.ts`

```typescript
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWTPayload } from '../types';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies?.accessToken;

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
```

### 2.6 Gestión de Carrito con Sesiones de Invitados

**Archivo:** `backend/src/controllers/cartController.ts`

```typescript
export async function addToCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const userId = req.user?.userId;
    let sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

    // Validar sessionId para usuarios invitados
    if (!userId) {
      if (!sessionId || sessionId === 'null' || sessionId === 'undefined') {
        sessionId = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        res.cookie('sessionId', sessionId, {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
          httpOnly: true,
          sameSite: 'lax'
        });
      }
    }

    // Buscar item existente
    const existingItem = await CartItem.findOne({
      ...(userId ? { userId } : { sessionId }),
      productId,
      variantId: variantId || null,
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      res.json(existingItem);
    } else {
      const newItem = await CartItem.create({
        userId: userId || null,
        sessionId: userId ? null : sessionId,
        productId,
        variantId,
        quantity,
      });
      res.status(201).json(newItem);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
}
```

### 2.7 Servicio de Email con Resend

**Archivo:** `backend/src/services/emailService.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

  await resend.emails.send({
    from: 'JSP Detailing <noreply@jspdetailing.cl>',
    to: email,
    subject: 'Verifica tu correo - JSP Detailing',
    html: `
      <h1>Bienvenido a JSP Detailing</h1>
      <p>Haz clic en el enlace para verificar tu cuenta:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  });
}

export async function sendQuotationEmail(
  userEmail: string,
  cartData: any
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jspdetailing.cl';

  // Email al cliente
  await resend.emails.send({
    from: 'JSP Detailing <cotizaciones@jspdetailing.cl>',
    to: userEmail,
    subject: 'Cotización Recibida - JSP Detailing',
    html: `
      <h2>Hemos recibido tu solicitud de cotización</h2>
      <p>Nuestro equipo te contactará pronto.</p>
    `,
  });

  // Email al admin
  await resend.emails.send({
    from: 'Sistema <sistema@jspdetailing.cl>',
    to: adminEmail,
    subject: 'Nueva Solicitud de Cotización',
    html: `<h3>Nueva cotización de: ${userEmail}</h3>`,
  });
}
```

---

## 3. IMPLEMENTACIÓN DEL FRONTEND

### 3.1 Configuración de Vite y Tailwind

**Archivo:** `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});
```

**Archivo:** `frontend/tailwind.config.ts`

```typescript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
```

### 3.2 Cliente API Centralizado

**Archivo:** `frontend/src/services/api.ts`

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Session ID para invitados
        if (!token) {
          const sessionId = localStorage.getItem('guestSessionId');
          if (sessionId && sessionId !== 'null') {
            config.headers['x-session-id'] = sessionId;
          }
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para refresh token
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });
              const { accessToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            localStorage.clear();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.removeItem('guestSessionId');
    }
    return response.data;
  }

  async searchProducts(query: string, limit: number = 10) {
    const response = await this.api.get('/products/search', { 
      params: { q: query, limit } 
    });
    return response.data.products || [];
  }

  async addToCart(productId: string, variantId?: string, quantity: number = 1) {
    const response = await this.api.post('/cart', { 
      productId, 
      variantId, 
      quantity 
    });
    return response.data;
  }
}

export const api = new ApiService();
```

### 3.3 Context de Autenticación

**Archivo:** `frontend/src/context/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshUser().catch(() => {
        localStorage.clear();
        setUser(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const userData = await api.getProfile();
      setUser(userData);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.user) {
      setUser(response.user);
    }
  };

  const logout = async () => {
    await api.logout();
    localStorage.clear();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### 3.4 Componente de Búsqueda con Autocomplete

**Archivo:** `frontend/src/components/search/SearchAutocomplete.tsx`

```typescript
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCLP } from '../../utils/currency';
import type { Product } from '../../types';

export function SearchAutocomplete({ placeholder = "Buscar productos..." }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<number | null>(null);

  // Búsqueda con debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        const products = await api.searchProducts(query, 8);
        setResults(products);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleProductClick = (product: Product) => {
    navigate(`/productos/${product._id}`);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 px-4 py-3 pl-11"
      />
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border-2 bg-white shadow-2xl">
          {results.map((product) => (
            <button
              key={product._id}
              onClick={() => handleProductClick(product)}
              className="flex w-full items-center gap-4 p-4 hover:bg-purple-50"
            >
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1 text-left">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gradient">
                  {formatCLP(product.basePrice)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3.5 Banner de Consentimiento de Cookies

**Archivo:** `frontend/src/components/cookies/CookieConsentBanner.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('jsp_cookie_consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    const prefs = { essential: true, analytics: true, marketing: true };
    localStorage.setItem('jsp_cookie_consent', 'accepted');
    localStorage.setItem('jsp_cookie_preferences', JSON.stringify(prefs));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const prefs = { essential: true, analytics: false, marketing: false };
    localStorage.setItem('jsp_cookie_consent', 'rejected');
    localStorage.setItem('jsp_cookie_preferences', JSON.stringify(prefs));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-r from-purple-900 to-pink-900 text-white p-6 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold mb-2">🍪 Cookies y Privacidad</h3>
          <p className="text-sm">
            Utilizamos cookies para mejorar tu experiencia.{' '}
            <Link to="/politicas#cookies" className="underline">
              Más información
            </Link>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRejectAll}
            className="px-6 py-3 rounded-xl border-2 border-white/30"
          >
            Rechazar
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-6 py-3 rounded-xl bg-green-500 font-bold"
          >
            Aceptar Todas
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.6 Monitoreo Web Vitals

**Archivo:** `frontend/src/utils/reportWebVitals.ts`

```typescript
import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';

function logMetric(metric: Metric) {
  const { name, value, rating } = metric;
  
  const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
  const formattedValue = name === 'CLS' ? value.toFixed(3) : `${Math.round(value)}ms`;
  
  console.log(`${emoji} ${name}: ${formattedValue} (${rating})`);
}

export function reportWebVitals() {
  try {
    onLCP(logMetric);  // Largest Contentful Paint
    onINP(logMetric);  // Interaction to Next Paint
    onCLS(logMetric);  // Cumulative Layout Shift
    onFCP(logMetric);  // First Contentful Paint
    onTTFB(logMetric); // Time to First Byte

    console.log('🚀 Web Vitals Monitoring Active');
  } catch (error) {
    console.error('Error initializing Web Vitals:', error);
  }
}
```

---

## 4. DESPLIEGUE Y CONFIGURACIÓN

### 4.1 Variables de Entorno

**Backend (.env):**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=https://jsp.zabotec.com
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@jspdetailing.cl
```

**Frontend (.env):**
```env
VITE_API_URL=https://tallerdeintegracion.onrender.com/api
```

### 4.2 Configuración de Render (Backend)

**render.yaml:**
```yaml
services:
  - type: web
    name: jspdetailing-backend
    env: node
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### 4.3 Configuración de Vercel (Frontend)

**vercel.json:**
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 5. PRUEBAS Y VALIDACIÓN

### 5.1 Pruebas Realizadas

**Funcionales:**
- ✅ Registro de usuarios con validación de RUT
- ✅ Login con JWT y refresh token
- ✅ Búsqueda de productos con autocomplete
- ✅ Agregar/eliminar productos del carrito (logged-in y guest)
- ✅ Solicitud de cotización por email
- ✅ Panel de administración (CRUD completo)
- ✅ Gestión de categorías y banners
- ✅ Edición de páginas de contenido

**Seguridad:**
- ✅ Rate limiting en rutas críticas
- ✅ Validación de inputs con express-validator
- ✅ Protección XSS
- ✅ Headers de seguridad con Helmet
- ✅ CORS configurado correctamente

**Performance:**
- ✅ LCP < 2.5s (Good)
- ✅ FCP < 1.8s (Good)
- ✅ CLS < 0.1 (Good)
- ✅ Imágenes optimizadas con Cloudinary
- ✅ Lazy loading implementado

**Responsividad:**
- ✅ Mobile (320px - 768px)
- ✅ Tablet (768px - 1024px)
- ✅ Desktop (1024px+)

---

## 6. CONCLUSIÓN

La implementación del sistema JSP Detailing se completó exitosamente, cumpliendo con todos los requisitos técnicos y funcionales definidos en el análisis y diseño. El sistema se encuentra **100% operativo** en producción con:

✅ **Frontend desplegado:** https://jsp.zabotec.com  
✅ **Backend desplegado:** https://tallerdeintegracion.onrender.com  
✅ **Base de datos:** MongoDB Atlas (operacional)  
✅ **CDN de imágenes:** Cloudinary (configurado)  
✅ **Email service:** Resend (activo)  

**Características implementadas:**
- E-commerce completo con carrito y cotizaciones
- Panel de administración robusto
- Búsqueda con autocomplete en tiempo real
- Sistema de autenticación seguro con JWT
- Carrito persistente para usuarios invitados
- Banner de consentimiento de cookies (GDPR)
- Monitoreo de Web Vitals
- Diseño responsive y artístico moderno
- Optimización de imágenes automática
- Performance óptimo (Core Web Vitals: Good)

---

**Documento preparado por:** Equipo de Desarrollo JSP Detailing  
**Fecha:** Noviembre 2025  
**Versión:** 1.0  
**Estado:** ✅ Sistema en Producción

