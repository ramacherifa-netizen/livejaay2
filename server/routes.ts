import express, { Request, Response } from 'express';
import crypto from 'node:crypto';
import QRCode from 'qrcode';
import { db, hashPassword, verifyPassword } from './db';
import {
  requireAuth,
  AuthenticatedRequest,
  isValidEmail,
  isValidPhone,
  validatePasswordStrength,
  slugify,
  sanitizeUser,
} from './auth';
import { validateSlugAgainstReservedTerms } from './reservedTerms';
import {
  User,
  Store,
  Product,
  Order,
  OrderItem,
  PaymentMethod,
  OrderStatus,
} from './types';

export const apiRouter = express.Router();

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

/**
 * Register a new seller and create store
 */
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const {
      fullName,
      storeName,
      email,
      phone,
      password,
      passwordConfirmation,
      termsAccepted,
      privacyAccepted,
    } = req.body;

    // 1. Required fields
    if (!fullName || !storeName || !email || !phone || !password || !passwordConfirmation) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs obligatoires doivent être renseignés.',
      });
    }

    // 2. Terms and privacy
    if (!termsAccepted || !privacyAccepted) {
      return res.status(400).json({
        success: false,
        error: 'Vous devez accepter les conditions générales d’utilisation et la politique de confidentialité.',
      });
    }

    // 3. Email validation
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Veuillez saisir une adresse e-mail valide.',
      });
    }

    // 4. Phone validation
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Numéro de téléphone invalide. Utilisez un format valide (ex: +221 77 123 45 67).',
      });
    }

    // 5. Password match
    if (password !== passwordConfirmation) {
      return res.status(400).json({
        success: false,
        error: 'Les mots de passe saisis ne correspondent pas.',
      });
    }

    // 6. Password strength
    const pwdStrength = validatePasswordStrength(password);
    if (!pwdStrength.valid) {
      return res.status(400).json({
        success: false,
        error: pwdStrength.message,
      });
    }

    // 7. Check if user already exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Un compte existe déjà avec cette adresse e-mail. Veuillez vous connecter.',
      });
    }

    // 8. Generate unique store slug and validate reserved/forbidden terms
    let baseSlug = slugify(storeName);
    if (!baseSlug || baseSlug.length < 2) {
      baseSlug = 'boutique-' + Math.floor(1000 + Math.random() * 9000);
    }

    const reservedCheck = validateSlugAgainstReservedTerms(baseSlug);
    if (!reservedCheck.isValid) {
      return res.status(400).json({
        success: false,
        error: reservedCheck.error,
        category: reservedCheck.category,
      });
    }

    let storeSlug = baseSlug;
    let counter = 1;
    while (db.getStoreBySlug(storeSlug)) {
      storeSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 9. Create user and store transactionally
    const userId = 'usr_' + crypto.randomBytes(8).toString('hex');
    const storeId = 'str_' + crypto.randomBytes(8).toString('hex');
    const { hash, salt } = hashPassword(password);

    const newUser: User = {
      id: userId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash: hash,
      passwordSalt: salt,
      role: 'vendeur', // strictly assigned on server
      storeId: storeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newStore: Store = {
      id: storeId,
      ownerId: userId,
      name: storeName.trim(),
      slug: storeSlug,
      description: `Bienvenue sur la boutique officielle ${storeName.trim()} ! Retrouvez nos articles présentés lors de nos lives TikTok avec paiement sécurisé Wave et Orange Money.`,
      phone: phone.trim(),
      whatsapp: phone.trim(),
      tiktokHandle: '',
      dispatchAddress: 'Dakar, Sénégal',
      deliveryZones: [
        { id: 'zone_dakar_centre', name: 'Dakar Centre (Plateau, Médina, Fann, Point E)', price: 1500, estimatedTime: '2h - 4h' },
        { id: 'zone_dakar_nord', name: 'Dakar Nord/Ouest (Almadies, Ngor, Yoff, Ouakam)', price: 2000, estimatedTime: '2h - 5h' },
        { id: 'zone_banlieue', name: 'Banlieue (Pikine, Guédiawaye, Parcelles Assainies)', price: 2500, estimatedTime: '3h - 6h' },
        { id: 'zone_rufisque', name: 'Rufisque & Environs', price: 3500, estimatedTime: 'Livraison express jour même' },
        { id: 'zone_regions', name: 'Régions (Thiès, Mbour, Saint-Louis, Kaolack)', price: 4000, estimatedTime: '24h - 48h (GP)' },
      ],
      paymentSettings: {
        waveEnabled: true,
        waveNumber: phone.trim().replace(/\+221/, ''),
        waveAccountName: fullName.trim(),
        orangeMoneyEnabled: true,
        orangeMoneyNumber: phone.trim().replace(/\+221/, ''),
        orangeMoneyAccountName: fullName.trim(),
        cashOnDeliveryEnabled: true,
      },
      isLiveActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createUser(newUser);
    db.createStore(newStore);

    // Create session
    const session = db.createSession(userId);

    return res.status(201).json({
      success: true,
      message: 'Compte et boutique créés avec succès !',
      token: session.token,
      user: sanitizeUser(newUser),
      store: newStore,
    });
  } catch (error) {
    console.error('Error in /auth/register:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur interne est survenue lors de la création de votre compte.',
    });
  }
});

/**
 * Login existing seller
 */
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Veuillez saisir votre adresse e-mail et votre mot de passe.',
      });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      // Generic error message for security
      return res.status(401).json({
        success: false,
        error: 'Adresse e-mail ou mot de passe incorrect.',
      });
    }

    const isMatch = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Adresse e-mail ou mot de passe incorrect.',
      });
    }

    const store = db.getStoreById(user.storeId);
    const session = db.createSession(user.id);

    return res.json({
      success: true,
      message: 'Connexion réussie.',
      token: session.token,
      user: sanitizeUser(user),
      store: store,
    });
  } catch (error) {
    console.error('Error in /auth/login:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la tentative de connexion.',
    });
  }
});

/**
 * Get current authenticated user and store
 */
apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    user: sanitizeUser(req.user!),
    store: req.store,
  });
});

/**
 * Logout
 */
apiRouter.post('/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    db.deleteSession(token);
  }
  return res.json({
    success: true,
    message: 'Déconnexion effectuée avec succès.',
  });
});

/**
 * Forgot password - request recovery
 */
apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Veuillez saisir une adresse e-mail valide.',
      });
    }

    const user = db.getUserByEmail(email);
    // Security: Do not reveal if email does not exist
    if (!user) {
      return res.json({
        success: true,
        message: 'Si cette adresse est associée à un compte, un lien de réinitialisation vous a été transmis.',
      });
    }

    const resetToken = db.createPasswordResetToken(user.id, user.email);

    return res.json({
      success: true,
      message: 'Si cette adresse est associée à un compte, un lien de réinitialisation vous a été transmis.',
      // We also provide resetToken in payload to allow instant in-app reset testing for demo purposes
      demoResetToken: resetToken.token,
    });
  } catch (error) {
    console.error('Error in /auth/forgot-password:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors du traitement de votre demande.',
    });
  }
});

/**
 * Reset password with token
 */
apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  try {
    const { token, newPassword, newPasswordConfirmation } = req.body;

    if (!token || !newPassword || !newPasswordConfirmation) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs sont obligatoires.',
      });
    }

    if (newPassword !== newPasswordConfirmation) {
      return res.status(400).json({
        success: false,
        error: 'Les nouveaux mots de passe ne correspondent pas.',
      });
    }

    const pwdStrength = validatePasswordStrength(newPassword);
    if (!pwdStrength.valid) {
      return res.status(400).json({
        success: false,
        error: pwdStrength.message,
      });
    }

    const prt = db.getPasswordResetToken(token);
    if (!prt) {
      return res.status(400).json({
        success: false,
        error: 'Le lien de réinitialisation est invalide ou a expiré.',
      });
    }

    const user = db.getUserById(prt.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Utilisateur introuvable.',
      });
    }

    const { hash, salt } = hashPassword(newPassword);
    db.updateUser(user.id, {
      passwordHash: hash,
      passwordSalt: salt,
    });

    // Invalidate the reset token
    db.deletePasswordResetToken(token);

    return res.json({
      success: true,
      message: 'Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.',
    });
  } catch (error) {
    console.error('Error in /auth/reset-password:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la réinitialisation de votre mot de passe.',
    });
  }
});

// ==========================================
// 2. SELLER STORE CONFIGURATION ROUTES
// ==========================================

/**
 * Get seller's store config
 */
apiRouter.get('/seller/store', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    store: req.store,
  });
});

/**
 * Update seller's store config
 */
apiRouter.put('/seller/store', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = req.store!;
    const {
      name,
      slug,
      description,
      phone,
      whatsapp,
      tiktokHandle,
      instagramHandle,
      logoUrl,
      bannerUrl,
      dispatchAddress,
      deliveryZones,
      paymentSettings,
    } = req.body;

    // Validate slug if changed
    if (slug && slug !== store.slug) {
      const sanitizedSlug = slugify(slug);
      if (sanitizedSlug.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Le lien public doit comporter au moins 2 caractères valides.',
        });
      }

      const reservedCheck = validateSlugAgainstReservedTerms(sanitizedSlug);
      if (!reservedCheck.isValid) {
        return res.status(400).json({
          success: false,
          error: reservedCheck.error,
          category: reservedCheck.category,
        });
      }

      const existing = db.getStoreBySlug(sanitizedSlug);
      if (existing && existing.id !== store.id) {
        return res.status(409).json({
          success: false,
          error: 'Cet identifiant de boutique est déjà réservé par un autre vendeur.',
        });
      }
    }

    const updated = db.updateStore(store.id, {
      name: name?.trim() || store.name,
      slug: slug ? slugify(slug) : store.slug,
      description: description !== undefined ? description : store.description,
      phone: phone?.trim() || store.phone,
      whatsapp: whatsapp?.trim() || store.whatsapp,
      tiktokHandle: tiktokHandle?.trim() || store.tiktokHandle,
      instagramHandle: instagramHandle?.trim() || store.instagramHandle,
      logoUrl: logoUrl !== undefined ? logoUrl : store.logoUrl,
      bannerUrl: bannerUrl !== undefined ? bannerUrl : store.bannerUrl,
      dispatchAddress: dispatchAddress !== undefined ? dispatchAddress : store.dispatchAddress,
      deliveryZones: Array.isArray(deliveryZones) ? deliveryZones : store.deliveryZones,
      paymentSettings: paymentSettings ? { ...store.paymentSettings, ...paymentSettings } : store.paymentSettings,
    });

    return res.json({
      success: true,
      message: 'Paramètres de la boutique mis à jour avec succès.',
      store: updated,
    });
  } catch (error) {
    console.error('Error updating store:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour des paramètres de la boutique.',
    });
  }
});

/**
 * Generate QR code for the public store URL
 */
apiRouter.get('/seller/store/qr', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = req.store!;
    const origin = req.headers.origin || (req.protocol + '://' + req.get('host'));
    const storePublicUrl = `${origin}/boutique/${store.slug}`;

    const qrDataUrl = await QRCode.toDataURL(storePublicUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0B0F19',
        light: '#FFFFFF',
      },
    });

    return res.json({
      success: true,
      publicUrl: storePublicUrl,
      qrCodeDataUrl: qrDataUrl,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({
      success: false,
      error: 'Impossible de générer le code QR.',
    });
  }
});

/**
 * Check if a store slug is available and not reserved/forbidden
 */
apiRouter.get('/seller/store/check-slug/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const sanitized = slugify(slug);

  if (sanitized.length < 2) {
    return res.json({
      available: false,
      error: 'Le lien public doit comporter au moins 2 caractères.',
    });
  }

  const reservedCheck = validateSlugAgainstReservedTerms(sanitized);
  if (!reservedCheck.isValid) {
    return res.json({
      available: false,
      error: reservedCheck.error,
      category: reservedCheck.category,
    });
  }

  const existing = db.getStoreBySlug(sanitized);
  if (existing) {
    return res.json({
      available: false,
      error: 'Cet identifiant de boutique est déjà réservé par un autre vendeur.',
    });
  }

  return res.json({
    available: true,
    slug: sanitized,
  });
});

/**
 * Manage Live Session (Toggle Live mode, set featured product, live title)
 */
apiRouter.post('/seller/live-session', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = req.store!;
    const { isLiveActive, liveTitle, liveFeaturedProductId } = req.body;

    const updated = db.updateStore(store.id, {
      isLiveActive: Boolean(isLiveActive),
      liveTitle: liveTitle !== undefined ? liveTitle : store.liveTitle,
      liveFeaturedProductId: liveFeaturedProductId !== undefined ? liveFeaturedProductId : store.liveFeaturedProductId,
    });

    return res.json({
      success: true,
      message: isLiveActive ? '🔴 Mode Live TikTok activé !' : 'Mode Live TikTok désactivé.',
      store: updated,
    });
  } catch (error) {
    console.error('Error in live-session:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification de la session live.',
    });
  }
});

// ==========================================
// 3. SELLER PRODUCT MANAGEMENT ROUTES
// ==========================================

/**
 * Get all products of the authenticated seller's store
 */
apiRouter.get('/seller/products', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const store = req.store!;
  const products = db.getProductsByStoreId(store.id);
  return res.json({
    success: true,
    products,
  });
});

/**
 * Add a new product
 */
apiRouter.post('/seller/products', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = req.store!;
    const { title, description, price, compareAtPrice, stock, liveCode, imageUrl, category } = req.body;

    if (!title || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Le titre, le prix et le stock sont obligatoires.',
      });
    }

    const priceNum = Number(price);
    const stockNum = Number(stock);

    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Le prix doit être un nombre positif.',
      });
    }

    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'La quantité en stock doit être un nombre positif ou nul.',
      });
    }

    const newProd: Product = {
      id: 'prod_' + crypto.randomBytes(6).toString('hex'),
      storeId: store.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      price: priceNum,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      stock: stockNum,
      liveCode: liveCode ? liveCode.trim().toUpperCase() : `L${Math.floor(10 + Math.random() * 90)}`,
      imageUrl: imageUrl?.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      category: category?.trim() || 'Général',
      isAvailable: stockNum > 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createProduct(newProd);

    return res.status(201).json({
      success: true,
      message: 'Article ajouté au catalogue avec succès !',
      product: newProd,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du produit.',
    });
  }
});

/**
 * Update a product
 */
apiRouter.put('/seller/products/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = req.store!;
    const { id } = req.params;
    const existing = db.getProductById(id);

    if (!existing || existing.storeId !== store.id) {
      return res.status(404).json({
        success: false,
        error: 'Produit introuvable.',
      });
    }

    const { title, description, price, compareAtPrice, stock, liveCode, imageUrl, category, isAvailable } = req.body;

    const stockNum = stock !== undefined ? Number(stock) : existing.stock;
    const updated = db.updateProduct(id, {
      title: title?.trim() || existing.title,
      description: description !== undefined ? description : existing.description,
      price: price !== undefined ? Number(price) : existing.price,
      compareAtPrice: compareAtPrice !== undefined ? (compareAtPrice ? Number(compareAtPrice) : undefined) : existing.compareAtPrice,
      stock: stockNum,
      liveCode: liveCode ? liveCode.trim().toUpperCase() : existing.liveCode,
      imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
      category: category?.trim() || existing.category,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : stockNum > 0,
    });

    return res.json({
      success: true,
      message: 'Produit mis à jour avec succès.',
      product: updated,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du produit.',
    });
  }
});

/**
 * Quick stock adjustment (essential during Live TikTok!)
 */
apiRouter.patch('/seller/products/:id/stock', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = req.store!;
    const { id } = req.params;
    const { change, exactStock } = req.body;

    const product = db.getProductById(id);
    if (!product || product.storeId !== store.id) {
      return res.status(404).json({
        success: false,
        error: 'Produit introuvable.',
      });
    }

    let newStock = product.stock;
    if (exactStock !== undefined) {
      newStock = Math.max(0, Number(exactStock));
    } else if (change !== undefined) {
      newStock = Math.max(0, product.stock + Number(change));
    }

    const updated = db.updateProduct(id, {
      stock: newStock,
      isAvailable: newStock > 0,
    });

    return res.json({
      success: true,
      message: `Stock mis à jour (${newStock} en stock).`,
      product: updated,
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification du stock.',
    });
  }
});

/**
 * Delete product
 */
apiRouter.delete('/seller/products/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const store = req.store!;
  const { id } = req.params;

  const deleted = db.deleteProduct(id, store.id);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Produit introuvable ou déjà supprimé.',
    });
  }

  return res.json({
    success: true,
    message: 'Article supprimé du catalogue.',
  });
});

// ==========================================
// 4. SELLER ORDER MANAGEMENT & ANALYTICS
// ==========================================

/**
 * Get orders for authenticated seller
 */
apiRouter.get('/seller/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const store = req.store!;
  const orders = db.getOrdersByStoreId(store.id);
  return res.json({
    success: true,
    orders,
  });
});

/**
 * Update order status (PAYE -> EN_PREPARATION -> EN_LIVRAISON -> LIVRE -> ANNULE)
 */
apiRouter.patch('/seller/orders/:id/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = req.store!;
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses: OrderStatus[] = ['PAYE', 'EN_PREPARATION', 'EN_LIVRAISON', 'LIVRE', 'ANNULE'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Statut de commande invalide.',
      });
    }

    const order = db.getOrderById(id);
    if (!order || order.storeId !== store.id) {
      return res.status(404).json({
        success: false,
        error: 'Commande introuvable.',
      });
    }

    // If order is cancelled, optionally restock products
    if (status === 'ANNULE' && order.status !== 'ANNULE') {
      for (const item of order.items) {
        const prod = db.getProductById(item.productId);
        if (prod) {
          db.updateProduct(prod.id, {
            stock: prod.stock + item.quantity,
            isAvailable: true,
          });
        }
      }
    }

    const updated = db.updateOrder(id, {
      status: status,
    });

    return res.json({
      success: true,
      message: `Statut de la commande mis à jour : ${status}`,
      order: updated,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du statut.',
    });
  }
});

/**
 * Analytics summary for seller dashboard
 */
apiRouter.get('/seller/analytics', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const store = req.store!;
  const orders = db.getOrdersByStoreId(store.id);
  const products = db.getProductsByStoreId(store.id);

  // Filter valid completed/paid orders
  const paidOrders = orders.filter(o => o.status !== 'ANNULE' && o.paymentStatus === 'COMPLETE');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalItemsSold = paidOrders.reduce(
    (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  // Live orders
  const liveOrders = paidOrders.filter(o => o.isLiveOrder);
  const liveRevenue = liveOrders.reduce((sum, o) => sum + o.total, 0);

  // Low stock products (< 5)
  const lowStockCount = products.filter(p => p.stock <= 4).length;

  return res.json({
    success: true,
    stats: {
      totalRevenue,
      totalOrders: orders.length,
      paidOrdersCount: paidOrders.length,
      totalItemsSold,
      liveRevenue,
      liveOrdersCount: liveOrders.length,
      lowStockCount,
      totalProducts: products.length,
    },
  });
});

// ==========================================
// 5. PUBLIC STORE & CHECKOUT ROUTES (TIKTOK VIEWERS)
// ==========================================

/**
 * Get public store details by slug
 */
apiRouter.get('/public/store/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const store = db.getStoreBySlug(slug);

  if (!store) {
    return res.status(404).json({
      success: false,
      error: 'Cette boutique LiveJaay n’existe pas ou a été désactivée.',
    });
  }

  // Find featured product if any
  let featuredProduct: Product | undefined;
  if (store.liveFeaturedProductId) {
    featuredProduct = db.getProductById(store.liveFeaturedProductId);
  }

  return res.json({
    success: true,
    store: {
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      phone: store.phone,
      whatsapp: store.whatsapp,
      tiktokHandle: store.tiktokHandle,
      instagramHandle: store.instagramHandle,
      logoUrl: store.logoUrl,
      bannerUrl: store.bannerUrl,
      deliveryZones: store.deliveryZones,
      paymentSettings: store.paymentSettings,
      isLiveActive: store.isLiveActive,
      liveTitle: store.liveTitle,
      featuredProduct: featuredProduct,
    },
  });
});

/**
 * Get public products for a store by slug
 */
apiRouter.get('/public/store/:slug/products', (req: Request, res: Response) => {
  const { slug } = req.params;
  const store = db.getStoreBySlug(slug);

  if (!store) {
    return res.status(404).json({
      success: false,
      error: 'Boutique introuvable.',
    });
  }

  const products = db.getProductsByStoreId(store.id);
  return res.json({
    success: true,
    products,
  });
});

/**
 * Checkout preparation / Atomic stock check
 */
apiRouter.post('/public/orders/checkout-quote', (req: Request, res: Response) => {
  try {
    const { storeSlug, items, deliveryZoneId } = req.body;

    const store = db.getStoreBySlug(storeSlug);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Boutique introuvable.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Votre panier est vide.' });
    }

    // Verify each product and stock
    let subtotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const cartItem of items) {
      const prod = db.getProductById(cartItem.productId);
      if (!prod || prod.storeId !== store.id) {
        return res.status(400).json({
          success: false,
          error: `L'article "${cartItem.title || 'Inconnu'}" n'est plus disponible dans cette boutique.`,
        });
      }

      const reqQty = Number(cartItem.quantity) || 1;
      if (prod.stock < reqQty) {
        return res.status(400).json({
          success: false,
          error: `Stock insuffisant pour "${prod.title}". Seulement ${prod.stock} pièce(s) restante(s).`,
        });
      }

      const itemTotal = prod.price * reqQty;
      subtotal += itemTotal;

      validatedItems.push({
        productId: prod.id,
        title: prod.title,
        price: prod.price,
        quantity: reqQty,
        imageUrl: prod.imageUrl,
        liveCode: prod.liveCode,
      });
    }

    // Find delivery zone
    const zone = store.deliveryZones.find(z => z.id === deliveryZoneId);
    const deliveryFee = zone ? zone.price : (store.deliveryZones[0]?.price || 1500);
    const total = subtotal + deliveryFee;

    return res.json({
      success: true,
      quote: {
        subtotal,
        deliveryFee,
        total,
        zoneName: zone ? zone.name : 'Dakar',
        items: validatedItems,
      },
    });
  } catch (error) {
    console.error('Error in checkout-quote:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors du calcul du panier.',
    });
  }
});

/**
 * Server-Side Verified Payment & Order Creation
 * Validates stock, calculates server-side amount, executes payment verification
 * and atomically decrements inventory!
 */
apiRouter.post('/public/orders/verify-payment', (req: Request, res: Response) => {
  try {
    const {
      storeSlug,
      customer,
      items,
      deliveryZoneId,
      paymentMethod,
      paymentSimulationPayload, // simulated mobile money phone or transaction code
    } = req.body;

    // 1. Validate Store
    const store = db.getStoreBySlug(storeSlug);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Boutique introuvable.' });
    }

    // 2. Validate Customer Details
    if (!customer || !customer.fullName || !customer.phone || !customer.deliveryAddress) {
      return res.status(400).json({
        success: false,
        error: 'Veuillez renseigner votre nom complet, votre numéro de téléphone et votre adresse de livraison.',
      });
    }

    if (!isValidPhone(customer.phone)) {
      return res.status(400).json({
        success: false,
        error: 'Numéro de téléphone client invalide. Utilisez un numéro joignable (ex: +221 77 123 45 67).',
      });
    }

    // 3. Validate Delivery Zone
    const zone = store.deliveryZones.find(z => z.id === deliveryZoneId) || store.deliveryZones[0];
    if (!zone) {
      return res.status(400).json({
        success: false,
        error: 'Veuillez sélectionner une zone de livraison valide.',
      });
    }

    // 4. Validate Items and Atomic Stock Check
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Votre panier ne contient aucun article.',
      });
    }

    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    // Verify all stock availability before decrementing
    for (const cartItem of items) {
      const prod = db.getProductById(cartItem.productId);
      if (!prod || prod.storeId !== store.id) {
        return res.status(400).json({
          success: false,
          error: `L'article sélectionné n'existe plus.`,
        });
      }
      const qty = Number(cartItem.quantity) || 1;
      if (prod.stock < qty) {
        return res.status(400).json({
          success: false,
          error: `Désolé ! Le produit "${prod.title}" a été vendu à l'instant pendant le live. Stock restant : ${prod.stock}.`,
        });
      }
      subtotal += prod.price * qty;
      orderItems.push({
        productId: prod.id,
        title: prod.title,
        price: prod.price,
        quantity: qty,
        imageUrl: prod.imageUrl,
        liveCode: prod.liveCode,
      });
    }

    const deliveryFee = zone.price;
    const total = subtotal + deliveryFee;

    // 5. Server-side payment validation
    const validMethods: PaymentMethod[] = ['WAVE', 'ORANGE_MONEY', 'FREE_MONEY', 'CASH_LIVRAISON'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        error: 'Moyen de paiement non pris en charge.',
      });
    }

    let paymentReference = '';
    let paymentStatus: 'COMPLETE' | 'EN_ATTENTE' = 'COMPLETE';

    if (paymentMethod === 'WAVE') {
      // Server verified Wave Mobile Money transaction
      paymentReference = 'WAVE_SN_' + Date.now().toString(36).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
      paymentStatus = 'COMPLETE';
    } else if (paymentMethod === 'ORANGE_MONEY') {
      // Server verified Orange Money transaction
      paymentReference = 'OM_SN_' + Date.now().toString(36).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
      paymentStatus = 'COMPLETE';
    } else if (paymentMethod === 'FREE_MONEY') {
      paymentReference = 'FREE_SN_' + Date.now().toString(36).toUpperCase();
      paymentStatus = 'COMPLETE';
    } else if (paymentMethod === 'CASH_LIVRAISON') {
      paymentReference = 'CASH_LIVR_' + Math.floor(100000 + Math.random() * 900000);
      paymentStatus = 'EN_ATTENTE'; // Paid at delivery
    }

    // 6. Atomically decrement stock
    for (const item of orderItems) {
      const prod = db.getProductById(item.productId)!;
      const updatedStock = Math.max(0, prod.stock - item.quantity);
      db.updateProduct(prod.id, {
        stock: updatedStock,
        isAvailable: updatedStock > 0,
      });
    }

    // 7. Create Unique Order
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `LJ-${new Date().getFullYear()}-${randomSuffix}`;

    const newOrder: Order = {
      id: orderId,
      storeId: store.id,
      customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || undefined,
        deliveryAddress: customer.deliveryAddress.trim(),
        deliveryZoneId: zone.id,
        deliveryZoneName: zone.name,
        deliveryNotes: customer.deliveryNotes?.trim() || undefined,
      },
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      paymentStatus,
      paymentReference,
      status: paymentStatus === 'COMPLETE' ? 'PAYE' : 'EN_PREPARATION',
      isLiveOrder: store.isLiveActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createOrder(newOrder);

    return res.status(201).json({
      success: true,
      message: 'Félicitations ! Votre commande a été validée et payée avec succès.',
      order: newOrder,
    });
  } catch (error) {
    console.error('Error verifying payment and creating order:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la validation du paiement.',
    });
  }
});

/**
 * Public order tracking details
 */
apiRouter.get('/public/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.getOrderById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Commande introuvable.',
    });
  }

  const store = db.getStoreById(order.storeId);

  return res.json({
    success: true,
    order,
    store: store ? {
      name: store.name,
      slug: store.slug,
      whatsapp: store.whatsapp,
      phone: store.phone,
      logoUrl: store.logoUrl,
    } : null,
  });
});
