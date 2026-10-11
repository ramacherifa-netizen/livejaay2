import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  User,
  Store,
  Product,
  Order,
  PasswordResetToken,
  Session
} from './types';

export interface DatabaseSchema {
  users: User[];
  stores: Store[];
  products: Product[];
  orders: Order[];
  passwordResetTokens: PasswordResetToken[];
  sessions: Session[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'livejaay.db.json');

// Helper for hashing password with salt
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const key = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(key, 'hex'));
  } catch {
    return false;
  }
}

function getInitialData(): DatabaseSchema {
  // Pre-seed demo user: marieme@dakarstyle.sn / Password123!
  const pwdInfo = hashPassword('Password123!');
  const userId = 'usr_marieme_01';
  const storeId = 'str_dakarchic_01';

  const defaultUser: User = {
    id: userId,
    fullName: 'Marième Ndiaye',
    email: 'marieme@dakarstyle.sn',
    phone: '+221771234567',
    passwordHash: pwdInfo.hash,
    passwordSalt: pwdInfo.salt,
    role: 'vendeur',
    storeId: storeId,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  };

  const defaultStore: Store = {
    id: storeId,
    ownerId: userId,
    name: 'Dakar Chic Boutique',
    slug: 'dakar-chic',
    description: 'Boutique n°1 de prêt-à-porter féminin & accessoires à Dakar. Commandez en direct pendant nos Lives TikTok avec paiement Wave ou Orange Money et livraison rapide le jour même !',
    phone: '+221771234567',
    whatsapp: '+221771234567',
    tiktokHandle: '@dakarchic_officiel',
    instagramHandle: '@dakarchic_sn',
    logoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    dispatchAddress: 'Sacré-Cœur 3, en face Boulangerie Jaune, Dakar',
    deliveryZones: [
      { id: 'zone_dakar_centre', name: 'Dakar Centre (Plateau, Médina, Fann, Point E)', price: 1500, estimatedTime: '2h - 4h' },
      { id: 'zone_dakar_nord', name: 'Dakar Ouest & Nord (Almadies, Ngor, Yoff, Ouakam, Mamelles)', price: 2000, estimatedTime: '2h - 5h' },
      { id: 'zone_banlieue', name: 'Banlieue (Pikine, Guédiawaye, Parcelles Assainies, Keur Massar)', price: 2500, estimatedTime: '3h - 6h' },
      { id: 'zone_rufisque', name: 'Rufisque & Diamniadio', price: 3500, estimatedTime: 'Livraison express jour même' },
      { id: 'zone_regions', name: 'Régions (Thiès, Mbour, Saint-Louis, Kaolack)', price: 4000, estimatedTime: '24h - 48h (GP / Poste)' },
    ],
    paymentSettings: {
      waveEnabled: true,
      waveNumber: '77 123 45 67',
      waveAccountName: 'Dakar Chic Boutique (Marième N.)',
      orangeMoneyEnabled: true,
      orangeMoneyNumber: '78 456 78 90',
      orangeMoneyAccountName: 'Marième Ndiaye',
      cashOnDeliveryEnabled: true,
    },
    isLiveActive: true,
    liveTitle: '🔴 LIVE SPÉCIAL NOUVELLE COLLECTION BAZIN & SOIE - PROMOS EN DIRECT !',
    liveFeaturedProductId: 'prod_01',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultProducts: Product[] = [
    {
      id: 'prod_01',
      storeId: storeId,
      title: 'Robe Bazin Riche Brodé "Reine de Dakar"',
      description: 'Splendide robe longue en Bazin Riche Getzner teinté artisanalement, broderies dorées raffinées. Idéale pour cérémonies, mariages et soirées de gala.',
      price: 28000,
      compareAtPrice: 35000,
      stock: 7,
      liveCode: 'L01',
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
      category: 'Robes & Cérémonie',
      isAvailable: true,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_02',
      storeId: storeId,
      title: 'Ensemble 2 Pièces Soie & Wax Moderne',
      description: 'Chemisier fluide en soie italienne et pantalon palazzo taille haute aux motifs wax vibrants. Confortable et ultra élégant pour le travail et le quotidien.',
      price: 19500,
      compareAtPrice: 24000,
      stock: 12,
      liveCode: 'L02',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
      category: 'Ensembles & Tailleurs',
      isAvailable: true,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_03',
      storeId: storeId,
      title: 'Sac à Main Cuir Vernis Noir & Chaîne Dorée',
      description: 'Sac de luxe compact avec fermoir tourniquet plaqué or. Intérieur doublé velours, bandoulière chaîne amovible. L’accessoire incontournable de votre tenue.',
      price: 14000,
      compareAtPrice: 18000,
      stock: 4,
      liveCode: 'L03',
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
      category: 'Maroquinerie & Sacs',
      isAvailable: true,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_04',
      storeId: storeId,
      title: 'Babouches Sénégalaises Perles & Cuir Fait-Main',
      description: 'Paire artisanale d’exception brodée de perles de verre par nos maîtres artisans de Thiès. Semelle en cuir véritable cousue main.',
      price: 12000,
      compareAtPrice: 15000,
      stock: 9,
      liveCode: 'L04',
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
      category: 'Chaussures',
      isAvailable: true,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_05',
      storeId: storeId,
      title: 'Thiouraye Royal & Parfum d’Ambiance Oud Mystique',
      description: 'Véritable encens sénégalais Thiouraye préparé selon la tradition secrète dakaroise aux huiles de santal et bois d’oud précieux. Senteur envoûtante longue tenue.',
      price: 8500,
      stock: 18,
      liveCode: 'L05',
      imageUrl: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=600&q=80',
      category: 'Cosmétique & Senteurs',
      isAvailable: true,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_06',
      storeId: storeId,
      title: 'Collier Ras-de-Cou Or Sculpté & Pendentif Cauri',
      description: 'Bijou fin trempé dans l’or 18 carats orné d’un véritable cauri sculpté stylisé. Résistant à l’eau et hypoallergénique.',
      price: 9000,
      compareAtPrice: 12000,
      stock: 6,
      liveCode: 'L06',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
      category: 'Bijoux & Accessoires',
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultOrders: Order[] = [
    {
      id: 'LJ-2026-9041',
      storeId: storeId,
      customer: {
        fullName: 'Fatou Bintou Sow',
        phone: '+221773456789',
        email: 'fatou.sow@gmail.com',
        deliveryAddress: 'Almadies, Résidence Les Orchidées, Porte B4',
        deliveryZoneId: 'zone_dakar_nord',
        deliveryZoneName: 'Dakar Ouest & Nord (Almadies)',
        deliveryNotes: 'Appeler à l’arrivée, gardien devant la grille.',
      },
      items: [
        {
          productId: 'prod_01',
          title: 'Robe Bazin Riche Brodé "Reine de Dakar"',
          price: 28000,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
          liveCode: 'L01',
        },
      ],
      subtotal: 28000,
      deliveryFee: 2000,
      total: 30000,
      paymentMethod: 'WAVE',
      paymentStatus: 'COMPLETE',
      paymentReference: 'WAVE_SN_TX8941032',
      status: 'EN_LIVRAISON',
      isLiveOrder: true,
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    },
    {
      id: 'LJ-2026-9042',
      storeId: storeId,
      customer: {
        fullName: 'Awa Diop',
        phone: '+221765123490',
        email: 'awadiop.style@yahoo.fr',
        deliveryAddress: 'Plateau, 14 Rue Victor Hugo, Étage 2',
        deliveryZoneId: 'zone_dakar_centre',
        deliveryZoneName: 'Dakar Centre (Plateau)',
        deliveryNotes: 'Livrer avant 17h au bureau.',
      },
      items: [
        {
          productId: 'prod_02',
          title: 'Ensemble 2 Pièces Soie & Wax Moderne',
          price: 19500,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
          liveCode: 'L02',
        },
        {
          productId: 'prod_05',
          title: 'Thiouraye Royal & Parfum d’Ambiance Oud Mystique',
          price: 8500,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=600&q=80',
          liveCode: 'L05',
        },
      ],
      subtotal: 28000,
      deliveryFee: 1500,
      total: 29500,
      paymentMethod: 'ORANGE_MONEY',
      paymentStatus: 'COMPLETE',
      paymentReference: 'OM_SN_REF667123',
      status: 'EN_PREPARATION',
      isLiveOrder: true,
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    },
    {
      id: 'LJ-2026-9039',
      storeId: storeId,
      customer: {
        fullName: 'Cheikh Tidiane Ba',
        phone: '+221708899001',
        deliveryAddress: 'Point E, près de la pharmacie du Point E',
        deliveryZoneId: 'zone_dakar_centre',
        deliveryZoneName: 'Dakar Centre (Point E)',
      },
      items: [
        {
          productId: 'prod_03',
          title: 'Sac à Main Cuir Vernis Noir & Chaîne Dorée',
          price: 14000,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
          liveCode: 'L03',
        },
      ],
      subtotal: 14000,
      deliveryFee: 1500,
      total: 15500,
      paymentMethod: 'WAVE',
      paymentStatus: 'COMPLETE',
      paymentReference: 'WAVE_SN_TX893900',
      status: 'LIVRE',
      isLiveOrder: false,
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
  ];

  return {
    users: [defaultUser],
    stores: [defaultStore],
    products: defaultProducts,
    orders: defaultOrders,
    passwordResetTokens: [],
    sessions: [],
  };
}

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.stores)) {
          return parsed as DatabaseSchema;
        }
      }
    } catch (e) {
      console.error('Error reading livejaay.db.json, reinitializing initial data', e);
    }

    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // Users
  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.users[idx];
  }

  // Stores
  getStoreById(id: string): Store | undefined {
    return this.data.stores.find(s => s.id === id);
  }

  getStoreBySlug(slug: string): Store | undefined {
    return this.data.stores.find(s => s.slug.toLowerCase() === slug.toLowerCase());
  }

  getStoreByOwnerId(ownerId: string): Store | undefined {
    return this.data.stores.find(s => s.ownerId === ownerId);
  }

  createStore(store: Store): Store {
    this.data.stores.push(store);
    this.persist();
    return store;
  }

  updateStore(id: string, updates: Partial<Store>): Store | undefined {
    const idx = this.data.stores.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.data.stores[idx] = { ...this.data.stores[idx], ...updates, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.stores[idx];
  }

  // Products
  getProductsByStoreId(storeId: string): Product[] {
    return this.data.products.filter(p => p.storeId === storeId);
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  createProduct(product: Product): Product {
    this.data.products.push(product);
    this.persist();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = { ...this.data.products[idx], ...updates, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.products[idx];
  }

  deleteProduct(id: string, storeId: string): boolean {
    const beforeLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => !(p.id === id && p.storeId === storeId));
    if (this.data.products.length !== beforeLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Orders
  getOrdersByStoreId(storeId: string): Order[] {
    return this.data.orders
      .filter(o => o.storeId === storeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.persist();
    return order;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    this.data.orders[idx] = { ...this.data.orders[idx], ...updates, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.orders[idx];
  }

  // Sessions
  createSession(userId: string): Session {
    const token = 'LJ_sess_' + crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 3600 * 1000; // 7 days
    const session: Session = { token, userId, expiresAt };
    // prune expired
    this.data.sessions = this.data.sessions.filter(s => s.expiresAt > Date.now());
    this.data.sessions.push(session);
    this.persist();
    return session;
  }

  getSession(token: string): Session | undefined {
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return undefined;
    if (session.expiresAt <= Date.now()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  deleteSession(token: string) {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.persist();
  }

  // Password Reset Tokens
  createPasswordResetToken(userId: string, email: string): PasswordResetToken {
    // Prune existing for this user/email
    this.data.passwordResetTokens = this.data.passwordResetTokens.filter(t => t.userId !== userId && t.expiresAt > Date.now());
    const token = 'LJ_rst_' + crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 3600 * 1000; // 1 hour validity
    const prt: PasswordResetToken = { token, userId, email, expiresAt };
    this.data.passwordResetTokens.push(prt);
    this.persist();
    return prt;
  }

  getPasswordResetToken(token: string): PasswordResetToken | undefined {
    const prt = this.data.passwordResetTokens.find(t => t.token === token);
    if (!prt) return undefined;
    if (prt.expiresAt <= Date.now()) {
      this.deletePasswordResetToken(token);
      return undefined;
    }
    return prt;
  }

  deletePasswordResetToken(token: string) {
    this.data.passwordResetTokens = this.data.passwordResetTokens.filter(t => t.token !== token);
    this.persist();
  }
}

export const db = new DatabaseService();
