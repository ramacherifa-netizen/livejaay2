export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  passwordSalt: string;
  role: 'vendeur';
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  price: number; // in FCFA
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
  price: number; // in FCFA
  compareAtPrice?: number;
  stock: number;
  liveCode: string; // e.g. "L01", "ROBE-A"
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
  phone: string; // WhatsApp / Phone
  email?: string;
  deliveryAddress: string;
  deliveryZoneId: string;
  deliveryZoneName: string;
  deliveryNotes?: string;
}

export interface Order {
  id: string; // e.g. "LJ-2026-9841"
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

export interface PasswordResetToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: number; // timestamp ms
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
}
