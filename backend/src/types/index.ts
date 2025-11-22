import { Request } from 'express';
import mongoose, { Document } from 'mongoose';

// User types
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  rut: string;
  phone: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  role: 'customer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Address types
export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  region: string;
  comuna: string;
  street: string;
  number: string;
  apartment?: string;
  reference?: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
}

// Product types
export interface IProduct extends Document {
  sku: string;
  name: string;
  slug: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  brand?: string;
  basePrice: number;
  offerPrice?: number;
  stock: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  images: string[];
  status: 'active' | 'inactive';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Category types
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Product Variant types
export interface IProductVariant extends Document {
  productId: mongoose.Types.ObjectId;
  name: string; // e.g., "size", "color"
  value: string; // e.g., "500ml", "Red"
  sku: string;
  priceModifier: number; // Additional cost for this variant
  stock: number;
  createdAt: Date;
}

// Cart Item types
export interface ICartItem extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log types
export interface IAuditLog extends Document {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Home Banner types
export interface IHomeBanner extends Document {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  image: string;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Content Management types (for About, Policies, etc.)
export interface IContentPage extends Document {
  slug: string; // 'about', 'shipping-policy', etc.
  title: string;
  content: string;
  metaDescription?: string;
  updatedAt: Date;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
}

// Extended Request with user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'customer' | 'admin';
  };
}

