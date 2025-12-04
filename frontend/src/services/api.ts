import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type { User, Product, Category, Cart, HomeBanner, ContentPage, DashboardStats, PaginatedResponse } from '../types';

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

    // Request interceptor to add auth token and session ID
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add session ID for guest users (cart persistence)
        // Only add if not logged in
        if (!token) {
          const sessionId = localStorage.getItem('guestSessionId');
          if (sessionId && sessionId !== 'null' && sessionId !== 'undefined') {
            config.headers['x-session-id'] = sessionId;
            console.log('🔑 Sending guest session ID:', sessionId);
          }
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
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
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    rut: string;
    phone: string;
    agreeTerms: boolean;
  }) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string, rememberMe: boolean = false) {
    const response = await this.api.post('/auth/login', { email, password, rememberMe });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      // Clear guest session on login (cart will be merged by backend)
      localStorage.removeItem('guestSessionId');
    }
    return response.data;
  }

  async logout() {
    await this.api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('guestSessionId');
  }

  async forgotPassword(email: string) {
    const response = await this.api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string) {
    const response = await this.api.post('/auth/reset-password', { token, password });
    return response.data;
  }

  async verifyEmail(token: string) {
    const response = await this.api.get('/auth/verify-email', { params: { token } });
    return response.data;
  }

  // Product endpoints
  async getProducts(params?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    inStock?: boolean;
    featured?: boolean;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Product>> {
    const response = await this.api.get('/products', { params });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async searchProducts(query: string, limit: number = 10) {
    const response = await this.api.get('/products/search', { params: { q: query, limit } });
    // Backend returns { products, categories, brands }, we only need products
    return response.data.products || [];
  }

  // Category endpoints
  async getCategories(params?: { parentId?: string; featured?: boolean }): Promise<Category[]> {
    const queryParams: any = {};
    if (params?.parentId !== undefined) queryParams.parentId = params.parentId;
    if (params?.featured !== undefined) queryParams.featured = params.featured.toString();
    const response = await this.api.get('/categories', { params: queryParams });
    return response.data;
  }

  async getCategory(slug: string): Promise<Category> {
    const response = await this.api.get(`/categories/${slug}`);
    return response.data;
  }

  // Cart endpoints
  async getCart(): Promise<Cart> {
    const response = await this.api.get('/cart');
    return response.data;
  }

  async addToCart(productId: string, variantId?: string, quantity: number = 1) {
    console.log('🛒 Adding to cart:', { productId, variantId, quantity });
    
    const response = await this.api.post('/cart', { productId, variantId, quantity });
    
    // Store sessionId for guest users
    const isLoggedIn = !!localStorage.getItem('accessToken');
    if (response.data.sessionId && !isLoggedIn) {
      console.log('💾 Storing guest session ID:', response.data.sessionId);
      localStorage.setItem('guestSessionId', response.data.sessionId);
    }
    
    console.log('✅ Item added to cart successfully');
    return response.data;
  }

  async updateCartItem(itemId: string, quantity: number) {
    const response = await this.api.put(`/cart/${itemId}`, { quantity });
    return response.data;
  }

  async removeFromCart(itemId: string) {
    const response = await this.api.delete(`/cart/${itemId}`);
    return response.data;
  }

  async requestQuotation(data: { name: string; email: string; phone: string; message?: string }) {
    const response = await this.api.post('/cart/request-quote', data);
    return response.data;
  }

  // Contact form endpoints
  async submitContactForm(data: {
    type: 'quote' | 'pickup' | 'training' | 'general';
    name: string;
    email: string;
    phone: string;
    company?: string;
    message: string;
    preferredDate?: string;
    preferredTime?: string;
    address?: string;
    numberOfParticipants?: number;
  }) {
    const response = await this.api.post('/contact', data);
    return response.data;
  }

  // User endpoints
  async getProfile(): Promise<User> {
    const response = await this.api.get('/user/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>) {
    const response = await this.api.put('/user/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.api.put('/user/password', { currentPassword, newPassword });
    return response.data;
  }

  // Admin endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.api.get('/admin/dashboard');
    return response.data;
  }

  // Admin Products
  async getAdminProducts(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const response = await this.api.get('/admin/products', { params });
    return response.data;
  }

  async createProduct(data: FormData) {
    const response = await this.api.post('/admin/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateProduct(id: string, data: FormData) {
    const response = await this.api.put(`/admin/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteProduct(id: string, hardDelete: boolean = false) {
    const response = await this.api.delete(`/admin/products/${id}`, {
      params: { hardDelete },
    });
    return response.data;
  }

  // Admin Categories
  async getAdminCategories(): Promise<Category[]> {
    const response = await this.api.get('/admin/categories');
    return response.data;
  }

  async createCategory(data: FormData) {
    const response = await this.api.post('/admin/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateCategory(id: string, data: FormData) {
    const response = await this.api.put(`/admin/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteCategory(id: string) {
    const response = await this.api.delete(`/admin/categories/${id}`);
    return response.data;
  }

  // Admin Banners
  async getBanners(): Promise<HomeBanner[]> {
    const response = await this.api.get('/admin/banners');
    return response.data;
  }

  async createBanner(data: FormData) {
    const response = await this.api.post('/admin/banners', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateBanner(id: string, data: FormData) {
    const response = await this.api.put(`/admin/banners/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteBanner(id: string) {
    const response = await this.api.delete(`/admin/banners/${id}`);
    return response.data;
  }

  // Admin Content Pages
  async getContentPages(): Promise<ContentPage[]> {
    const response = await this.api.get('/admin/content');
    return response.data;
  }

  async getContentPage(slug: string): Promise<ContentPage> {
    const response = await this.api.get(`/admin/content/${slug}`);
    return response.data;
  }

  async createOrUpdateContentPage(data: { slug: string; title: string; content: string; metaDescription?: string }) {
    const response = await this.api.post('/admin/content', data);
    return response.data;
  }

  // Public endpoints
  async getHomeBanners(): Promise<HomeBanner[]> {
    const response = await this.api.get('/home/banners');
    return response.data;
  }

  async getContentPagePublic(slug: string): Promise<ContentPage> {
    const response = await this.api.get(`/content/${slug}`);
    return response.data;
  }

  // Order endpoints
  async createOrder(orderData: { shippingAddress: any; paymentMethod?: string }) {
    const response = await this.api.post('/orders', orderData);
    return response.data;
  }

  async getUserOrders(params?: { page?: number; limit?: number }) {
    const response = await this.api.get('/orders', { params });
    return response.data;
  }

  async getOrder(id: string) {
    const response = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async cancelOrder(id: string) {
    const response = await this.api.put(`/orders/${id}/cancel`);
    return response.data;
  }

  // Admin User Management
  async getAdminUsers(params?: { page?: number; limit?: number; role?: string; search?: string }) {
    const response = await this.api.get('/admin/users', { params });
    return response.data;
  }

  async createAdminUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    rut: string;
    phone: string;
  }) {
    const response = await this.api.post('/admin/users/create-admin', data);
    return response.data;
  }

  async updateUserRole(userId: string, role: string) {
    const response = await this.api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await this.api.delete(`/admin/users/${userId}`);
    return response.data;
  }
}

export const api = new ApiService();

