import { User, Store, Product, Order, PaymentMethod, CustomerInfo } from '../types';

const TOKEN_KEY = 'livejaay_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Une erreur est survenue lors de la requête.');
  }

  return data as T;
}

// Auth API
export const authApi = {
  async register(payload: {
    fullName: string;
    storeName: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirmation: string;
    termsAccepted: boolean;
    privacyAccepted: boolean;
  }) {
    const res = await request<{
      success: boolean;
      message: string;
      token: string;
      user: User;
      store: Store;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(res.token);
    return res;
  },

  async login(payload: { email: string; password: string }) {
    const res = await request<{
      success: boolean;
      message: string;
      token: string;
      user: User;
      store: Store;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe() {
    return request<{ success: boolean; user: User; store: Store }>('/api/auth/me');
  },

  async logout() {
    try {
      await request<{ success: boolean; message: string }>('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      removeAuthToken();
    }
  },

  async forgotPassword(email: string) {
    return request<{ success: boolean; message: string; demoResetToken?: string }>(
      '/api/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );
  },

  async resetPassword(payload: {
    token: string;
    newPassword: string;
    newPasswordConfirmation: string;
  }) {
    return request<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// Seller Store & Live API
export const sellerApi = {
  async getStore() {
    return request<{ success: boolean; store: Store }>('/api/seller/store');
  },

  async updateStore(updates: Partial<Store>) {
    return request<{ success: boolean; message: string; store: Store }>('/api/seller/store', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getStoreQR() {
    return request<{ success: boolean; publicUrl: string; qrCodeDataUrl: string }>(
      '/api/seller/store/qr'
    );
  },

  async updateLiveSession(payload: {
    isLiveActive: boolean;
    liveTitle?: string;
    liveFeaturedProductId?: string;
  }) {
    return request<{ success: boolean; message: string; store: Store }>(
      '/api/seller/live-session',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  // Products
  async getProducts() {
    return request<{ success: boolean; products: Product[] }>('/api/seller/products');
  },

  async createProduct(product: Partial<Product>) {
    return request<{ success: boolean; message: string; product: Product }>(
      '/api/seller/products',
      {
        method: 'POST',
        body: JSON.stringify(product),
      }
    );
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    return request<{ success: boolean; message: string; product: Product }>(
      `/api/seller/products/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  },

  async updateStock(id: string, change?: number, exactStock?: number) {
    return request<{ success: boolean; message: string; product: Product }>(
      `/api/seller/products/${id}/stock`,
      {
        method: 'PATCH',
        body: JSON.stringify({ change, exactStock }),
      }
    );
  },

  async deleteProduct(id: string) {
    return request<{ success: boolean; message: string }>(`/api/seller/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async getOrders() {
    return request<{ success: boolean; orders: Order[] }>('/api/seller/orders');
  },

  async updateOrderStatus(id: string, status: string) {
    return request<{ success: boolean; message: string; order: Order }>(
      `/api/seller/orders/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },

  async getAnalytics() {
    return request<{
      success: boolean;
      stats: {
        totalRevenue: number;
        totalOrders: number;
        paidOrdersCount: number;
        totalItemsSold: number;
        liveRevenue: number;
        liveOrdersCount: number;
        lowStockCount: number;
        totalProducts: number;
      };
    }>('/api/seller/analytics');
  },
};

// Public Store API (Customer / TikTok Buyer)
export const publicApi = {
  async getStore(slug: string) {
    return request<{
      success: boolean;
      store: Store & { featuredProduct?: Product };
    }>(`/api/public/store/${slug}`);
  },

  async getProducts(slug: string) {
    return request<{ success: boolean; products: Product[] }>(
      `/api/public/store/${slug}/products`
    );
  },

  async getCheckoutQuote(payload: {
    storeSlug: string;
    items: { productId: string; quantity: number }[];
    deliveryZoneId?: string;
  }) {
    return request<{
      success: boolean;
      quote: {
        subtotal: number;
        deliveryFee: number;
        total: number;
        zoneName: string;
        items: Order['items'];
      };
    }>('/api/public/orders/checkout-quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyPaymentAndOrder(payload: {
    storeSlug: string;
    customer: CustomerInfo;
    items: { productId: string; quantity: number }[];
    deliveryZoneId: string;
    paymentMethod: PaymentMethod;
    paymentSimulationPayload?: any;
  }) {
    return request<{
      success: boolean;
      message: string;
      order: Order;
    }>('/api/public/orders/verify-payment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getOrder(id: string) {
    return request<{
      success: boolean;
      order: Order;
      store: {
        name: string;
        slug: string;
        whatsapp: string;
        phone: string;
        logoUrl?: string;
      } | null;
    }>(`/api/public/orders/${id}`);
  },
};
