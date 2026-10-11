import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { User, Store } from './types';

export interface AuthenticatedRequest extends Request {
  user?: User;
  store?: Store;
}

// Regex for Senegal and international phones
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  // Senegal format: +2217[05678]XXXXXXX or general international: +[1-9][0-9]{7,14}
  const snRegex = /^\+221(70|75|76|77|78)[0-9]{7}$/;
  const intlRegex = /^\+[1-9][0-9]{7,14}$/;
  return snRegex.test(clean) || intlRegex.test(clean);
}

// Regex for valid email
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

// Password rules: at least 8 chars, 1 uppercase, 1 digit
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit comporter au moins 8 caractères.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une lettre majuscule.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre.' };
  }
  return { valid: true };
}

// Generates a URL-friendly slug from store name
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sanitizeUser(user: User) {
  const { passwordHash, passwordSalt, ...rest } = user;
  return rest;
}

// Middleware: Require Authenticated Seller
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise. Veuillez vous connecter.',
    });
  }

  const token = authHeader.substring(7).trim();
  const session = db.getSession(token);

  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Session expirée ou invalide. Veuillez vous reconnecter.',
    });
  }

  const user = db.getUserById(session.userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Utilisateur introuvable.',
    });
  }

  const store = db.getStoreById(user.storeId);
  req.user = user;
  req.store = store;

  next();
}

// Middleware: Optional Auth (e.g., when visiting public pages)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const session = db.getSession(token);
    if (session) {
      const user = db.getUserById(session.userId);
      if (user) {
        req.user = user;
        req.store = db.getStoreById(user.storeId);
      }
    }
  }
  next();
}
