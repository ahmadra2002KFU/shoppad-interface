/**
 * API Service Layer
 * Centralized HTTP client with authentication support
 */

import { API_CONFIG } from '@/config/api';
import type { User, AuthResponse, LoginCredentials, RegisterData } from '@/types/auth';
import type { PaymentMethod, Transaction, CheckoutRequest, CheckoutResponse } from '@/types/payment';
import type { QRLoginSession, QRLoginStatus, QRSessionInfo, AuthorizeResponse } from '@/types/qr-login';
import type { Product, CartItem } from '@/types/product';

const BASE_URL = API_CONFIG.SERVER_URL;

// Storage keys
const TOKEN_KEY = 'shoppad_auth_token';
const USER_KEY = 'shoppad_user';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

interface CartResponse {
  items: CartItem[];
  total: number;
  itemCount: number;
  totalWeight: number;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from storage on init
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  /**
   * Store user in local storage
   */
  setStoredUser(user: User | null) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Clear all auth data
   */
  clearAuth() {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
          this.clearAuth();
        }
        return {
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ============================================
  // Auth Endpoints
  // ============================================

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setStoredUser(response.data.user);
    }

    return response;
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setStoredUser(response.data.user);
    }

    return response;
  }

  /**
   * Get current user
   */
  async getMe(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: { name?: string; preferredPaymentId?: string }): Promise<ApiResponse<User>> {
    const response = await this.request<User>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      this.setStoredUser(response.data);
    }

    return response;
  }

  /**
   * Logout (client-side only)
   */
  logout() {
    this.clearAuth();
  }

  // ============================================
  // Products Endpoints
  // ============================================

  /**
   * Get all products
   */
  async getProducts(params?: { category?: string; search?: string }): Promise<ApiResponse<Product[]>> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return this.request<Product[]>(`/products${query ? `?${query}` : ''}`);
  }

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  /**
   * Get product by barcode
   */
  async getProductByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/barcode/${barcode}`);
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/products/categories');
  }

  /**
   * Create product
   */
  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Cart Endpoints
  // ============================================

  /**
   * Get user's cart
   */
  async getCart(): Promise<ApiResponse<CartResponse>> {
    return this.request<CartResponse>('/cart');
  }

  /**
   * Add item to cart
   */
  async addToCart(productId: string, quantity = 1): Promise<ApiResponse<CartResponse>> {
    return this.request<CartResponse>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId: string, quantity: number): Promise<ApiResponse<CartResponse>> {
    return this.request<CartResponse>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId: string): Promise<ApiResponse<CartResponse>> {
    return this.request<CartResponse>(`/cart/${productId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Clear cart
   */
  async clearCart(): Promise<ApiResponse<CartResponse>> {
    return this.request<CartResponse>('/cart', {
      method: 'DELETE',
    });
  }

  /**
   * Sync cart from local storage
   */
  async syncCart(items: { productId: string; quantity: number }[]): Promise<ApiResponse<CartResponse>> {
    return this.request<CartResponse>('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  // ============================================
  // Checkout Endpoints
  // ============================================

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return this.request<PaymentMethod[]>('/checkout/payment-methods');
  }

  /**
   * Process checkout
   */
  async checkout(data: CheckoutRequest): Promise<ApiResponse<CheckoutResponse>> {
    return this.request<CheckoutResponse>('/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(params?: { limit?: number; status?: string }): Promise<ApiResponse<Transaction[]>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return this.request<Transaction[]>(`/checkout/history${query ? `?${query}` : ''}`);
  }

  /**
   * Get transaction details
   */
  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>(`/checkout/history/${id}`);
  }

  // ============================================
  // QR Login Endpoints
  // ============================================

  /**
   * Create new QR login session (for cart tablet)
   */
  async createQRSession(deviceInfo?: string): Promise<ApiResponse<QRLoginSession>> {
    return this.request<QRLoginSession>('/auth/qr/session', {
      method: 'POST',
      body: JSON.stringify({ deviceInfo }),
    });
  }

  /**
   * Poll QR session status (for cart tablet)
   */
  async getQRSessionStatus(sessionId: string, secret: string): Promise<ApiResponse<QRLoginStatus>> {
    return this.request<QRLoginStatus>(`/auth/qr/status/${sessionId}`, {
      headers: {
        'X-QR-Secret': secret,
      },
    });
  }

  /**
   * Get QR session info (for phone)
   */
  async getQRSessionInfo(sessionId: string): Promise<ApiResponse<QRSessionInfo>> {
    return this.request<QRSessionInfo>(`/auth/qr/info/${sessionId}`);
  }

  /**
   * Authorize QR session (for phone - user must be logged in)
   */
  async authorizeQRSession(sessionId: string): Promise<ApiResponse<AuthorizeResponse>> {
    return this.request<AuthorizeResponse>('/auth/qr/authorize', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Export singleton instance
export const api = new ApiService();
