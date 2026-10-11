/**
 * Module frontend de vérification des termes réservés et interdits sur LiveJaay.
 */

export const SYSTEM_RESERVED_SLUGS = new Set([
  'admin',
  'administrator',
  'root',
  'api',
  'auth',
  'login',
  'connexion',
  'register',
  'inscription',
  'signup',
  'signin',
  'logout',
  'deconnexion',
  'dashboard',
  'tableau-de-bord',
  'settings',
  'parametres',
  'config',
  'profile',
  'profil',
  'compte',
  'account',
  'vendeur',
  'seller',
  'buyer',
  'acheteur',
  'client',
  'customer',
  'boutique',
  'boutiques',
  'store',
  'stores',
  'shop',
  'shops',
  'order',
  'orders',
  'commande',
  'commandes',
  'suivi',
  'tracking',
  'panier',
  'cart',
  'checkout',
  'caisse',
  'paiement',
  'payment',
  'pay',
  'livraison',
  'delivery',
  'livreur',
  'support',
  'contact',
  'aide',
  'help',
  'faq',
  'terms',
  'cgu',
  'cgv',
  'privacy',
  'confidentialite',
  'legal',
  'status',
  'health',
  'test',
  'demo',
  'null',
  'undefined',
  'live',
  'livejaay',
  'live-jaay',
  'jaay',
]);

export const BRAND_AND_OFFICIAL_RESERVED = new Set([
  'tiktok',
  'tiktokshop',
  'tiktok-shop',
  'tiktok-officiel',
  'wave',
  'wave-senegal',
  'wave-sn',
  'wave-officiel',
  'orange',
  'orange-money',
  'orangemoney',
  'free',
  'free-money',
  'freemoney',
  'expresso',
  'bceao',
  'cbao',
  'sgbs',
  'ecobank',
  'boa',
  'uba',
  'postesn',
  'laposte',
  'gouvernement',
  'etat',
  'republique',
  'senegal',
  'police',
  'gendarmerie',
  'douane',
  'ministere',
  'officiel',
  'official',
  'certifie',
  'certified',
  'verifie',
  'verified',
]);

export const FORBIDDEN_KEYWORDS = [
  'arnaque',
  'scam',
  'escroc',
  'faux-billet',
  'fausse-monnaie',
  'clonage',
  'carding',
  'phishing',
  'loterie-gagnant',
  'argent-facile',
  'multiplicateur-argent',
  'doubler-wave',
  'hack',
  'hacker',
  'drogue',
  'yamba',
  'cannabis',
  'weed',
  'cocaine',
  'heroine',
  'tramadol',
  'subutex',
  'poison',
  'arme',
  'armes',
  'munitions',
  'explosif',
  'bombe',
  'contrefacon',
  'sexe',
  'porn',
  'porno',
  'xxx',
  'escort',
  'prostitution',
  'nazi',
  'raciste',
  'terroriste',
];

export interface SlugValidationResult {
  isValid: boolean;
  error?: string;
  category?: 'SYSTEM_RESERVED' | 'BRAND_RESERVED' | 'FORBIDDEN_CONTENT';
}

export function validateSlug(slug: string): SlugValidationResult {
  if (!slug) {
    return { isValid: false, error: 'L’identifiant ne peut pas être vide.' };
  }

  const normalized = slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');

  if (normalized.length < 2) {
    return { isValid: false, error: 'L’identifiant doit contenir au moins 2 caractères.' };
  }

  // 1. Termes système
  if (SYSTEM_RESERVED_SLUGS.has(normalized)) {
    return {
      isValid: false,
      error: `« ${normalized} » est un terme technique réservé par LiveJaay.`,
      category: 'SYSTEM_RESERVED',
    };
  }

  // 2. Marques & officiel
  if (BRAND_AND_OFFICIAL_RESERVED.has(normalized)) {
    return {
      isValid: false,
      error: `« ${normalized} » est une marque ou un terme officiel réservé.`,
      category: 'BRAND_RESERVED',
    };
  }

  const criticalPrefixes = ['livejaay-', 'admin-', 'api-', 'wave-officiel', 'orange-money-officiel'];
  for (const prefix of criticalPrefixes) {
    if (normalized.startsWith(prefix)) {
      return {
        isValid: false,
        error: `L'identifiant ne peut pas commencer par « ${prefix} » (terme protégé).`,
        category: 'BRAND_RESERVED',
      };
    }
  }

  // 3. Mots-clés interdits
  const compactSlug = normalized.replace(/-/g, '');
  for (const forbidden of FORBIDDEN_KEYWORDS) {
    const compactForbidden = forbidden.replace(/-/g, '');
    if (compactSlug.includes(compactForbidden)) {
      return {
        isValid: false,
        error: `L'identifiant contient un terme interdit par la charte LiveJaay (« ${forbidden} »).`,
        category: 'FORBIDDEN_CONTENT',
      };
    }
  }

  return { isValid: true };
}
