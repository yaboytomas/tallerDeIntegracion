// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  rut: string;
  phone: string;
  emailVerified: boolean;
  role: 'customer' | 'admin';
}

// Product types
export interface Product {
  _id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string | Category;
  brand?: string;
  basePrice: number;
  offerPrice?: number;
  priceWithIVA: number;
  offerPriceWithIVA?: number;
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
  variants?: ProductVariant[];
  relatedProducts?: Product[];
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  status: 'active' | 'inactive';
  featured?: boolean;
}

// Product Variant types
export interface ProductVariant {
  _id: string;
  productId: string;
  name: string;
  value: string;
  sku: string;
  priceModifier: number;
  stock: number;
}

// Cart types
export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    sku: string;
  };
  variant?: {
    id: string;
    name: string;
    value: string;
  };
  quantity: number;
  price: number;
  subtotal: number;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  iva: number;
  total: number;
}

// Home Banner types
export interface HomeBanner {
  _id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  image: string;
  active: boolean;
  order: number;
}

// Content Page types
export interface ContentPage {
  _id: string;
  slug: string;
  title: string;
  content: string;
  metaDescription?: string;
  updatedAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  ordersToday: number;
  recentOrders: any[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  products?: T[];
  categories?: T[];
  items?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

