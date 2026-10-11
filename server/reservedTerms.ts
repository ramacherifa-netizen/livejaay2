/**
 * Liste des termes réservés (système, marques, officiels) et interdits (illicites, fraudes, injures)
 * pour la plateforme LiveJaay au Sénégal.
 */

// 1. Termes Système & Infrastructure (Réservés pour le routage et les fonctions internes)
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

// 2. Termes de Marques Partenaires, Banques & Usurpation d'identité Officielle (Réservés)
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

// 3. Termes Interdits (Escroquerie, Fraude, Produits Illicites, Violence, Haine)
export const FORBIDDEN_KEYWORDS = [
  // Fraude & Arnaques financières
  'arnaque',
  'scam',
  'escroc',
  'faux-billet',
  'fausse-monnaie',
  'fausses-coupures',
  'clonage',
  'carding',
  'phishing',
  'loterie-gagnant',
  'argent-facile',
  'multiplicateur-argent',
  'doubler-wave',
  'hack',
  'hacker',
  'piratage',
  'cheat',

  // Stupéfiants & Substances interdites
  'drogue',
  'yamba',
  'cannabis',
  'weed',
  'cocaine',
  'heroine',
  'tramadol',
  'subutex',
  'meth',
  'ecstasy',
  'poison',
  'mercure-rouge',

  // Armes & Contrebande
  'arme',
  'armes',
  'munitions',
  'pistolet',
  'fusil',
  'explosif',
  'bombe',

  // Contrefaçons manifestes
  'contrefacon',
  'fake-brand',

  // Contenu adulte & prostitution
  'sexe',
  'sex',
  'porn',
  'porno',
  'xxx',
  'escort',
  'prostituee',
  'prostitution',

  // Propos haineux & injures
  'nazi',
  'hitler',
  'raciste',
  'terroriste',
  'jihad',
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  category?: 'SYSTEM_RESERVED' | 'BRAND_RESERVED' | 'FORBIDDEN_CONTENT';
}

/**
 * Valide si un identifiant public (slug) ou un nom commercial est autorisé sur LiveJaay.
 */
export function validateSlugAgainstReservedTerms(slug: string): ValidationResult {
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

  // 1. Vérification des termes système réservés
  if (SYSTEM_RESERVED_SLUGS.has(normalized)) {
    return {
      isValid: false,
      error: `L'identifiant « ${normalized} » est un terme réservé par le système LiveJaay.`,
      category: 'SYSTEM_RESERVED',
    };
  }

  // 2. Vérification des marques et termes officiels réservés
  if (BRAND_AND_OFFICIAL_RESERVED.has(normalized)) {
    return {
      isValid: false,
      error: `L'identifiant « ${normalized} » est une marque protégée ou un terme officiel réservé.`,
      category: 'BRAND_RESERVED',
    };
  }

  // Vérifier également les préfixes et sous-chaînes de marques et termes officiels
  const protectedBrands = ['livejaay', 'tiktok', 'orangemoney', 'freemoney'];
  for (const brand of protectedBrands) {
    if (normalized.includes(brand)) {
      return {
        isValid: false,
        error: `L'identifiant ne peut pas contenir la marque protégée « ${brand} ».`,
        category: 'BRAND_RESERVED',
      };
    }
  }

  const criticalPrefixes = [
    'admin-',
    'api-',
    'auth-',
    'wave-',
    'orange-',
    'free-',
    'bceao-',
    'police-',
    'douane-',
    'gouvernement-',
    'etat-',
    'officiel-',
    'official-',
  ];
  for (const prefix of criticalPrefixes) {
    if (normalized.startsWith(prefix)) {
      return {
        isValid: false,
        error: `L'identifiant ne peut pas commencer par « ${prefix} » (terme officiel ou technique réservé).`,
        category: 'BRAND_RESERVED',
      };
    }
  }

  // Vérifier les suffixes usurpant le caractère officiel
  if (normalized.endsWith('-officiel') || normalized.endsWith('-official') || normalized.endsWith('-certifie') || normalized.endsWith('-verifie')) {
    return {
      isValid: false,
      error: `L'identifiant ne peut pas se terminer par une mention officielle ou de certification.`,
      category: 'BRAND_RESERVED',
    };
  }

  // 3. Vérification des mots-clés interdits (substitutions et sous-chaînes)
  const compactSlug = normalized.replace(/-/g, '');
  for (const forbidden of FORBIDDEN_KEYWORDS) {
    const compactForbidden = forbidden.replace(/-/g, '');
    if (compactSlug.includes(compactForbidden)) {
      return {
        isValid: false,
        error: `L'identifiant contient un terme non autorisé ou prohibé par la charte LiveJaay (« ${forbidden} »).`,
        category: 'FORBIDDEN_CONTENT',
      };
    }
  }

  return { isValid: true };
}
