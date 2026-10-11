export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'vendeur';
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  estimatedTime: string;
}

export interface PaymentSettings {
  waveEnabled: boolean;
  waveNumber: string;
  waveAccountName: string;
  orangeMoneyEnabled: boolean;
  orangeMoneyNumber: string;
  orangeMoneyAccountName: string;
  cashOnDeliveryEnabled: boolean;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  phone: string;
  whatsapp: string;
  tiktokHandle: string;
  instagramHandle?: string;
  logoUrl?: string;
  bannerUrl?: string;
  dispatchAddress: string;
  deliveryZones: DeliveryZone[];
  paymentSettings: PaymentSettings;
  isLiveActive: boolean;
  liveTitle?: string;
  liveFeaturedProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  liveCode: string;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PAYE' | 'EN_PREPARATION' | 'EN_LIVRAISON' | 'LIVRE' | 'ANNULE';
export type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY' | 'CASH_LIVRAISON';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  liveCode?: string;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email?: string;
  deliveryAddress: string;
  deliveryZoneId: string;
  deliveryZoneName: string;
  deliveryNotes?: string;
}

export interface Order {
  id: string;
  storeId: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'COMPLETE' | 'EN_ATTENTE';
  paymentReference: string;
  status: OrderStatus;
  isLiveOrder: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
