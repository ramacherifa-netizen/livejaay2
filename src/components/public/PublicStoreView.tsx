import React, { useState, useEffect } from 'react';
import {
  Radio,
  ShoppingBag,
  Search,
  MessageCircle,
  Phone,
  Flame,
  Truck,
  CheckCircle2,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Share2,
  Copy,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Store, Product, CartItem, Order } from '../../types';
import { publicApi } from '../../lib/api';
import { CheckoutModal } from './CheckoutModal';
import { OrderConfirmationModal } from './OrderConfirmationModal';

interface PublicStoreViewProps {
  storeSlug: string;
  onBackToApp?: () => void;
}

export const PublicStoreView: React.FC<PublicStoreViewProps> = ({
  storeSlug,
  onBackToApp,
}) => {
  const [store, setStore] = useState<(Store & { featuredProduct?: Product }) | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const loadStoreData = async () => {
    try {
      const [storeRes, prodsRes] = await Promise.all([
        publicApi.getStore(storeSlug),
        publicApi.getProducts(storeSlug),
      ]);
      setStore(storeRes.store);
      setProducts(prodsRes.products);
    } catch (err: any) {
      setError(err.message || 'Boutique introuvable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, [storeSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-bold text-slate-700">Chargement de la boutique...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
          <h2 className="text-xl font-black text-slate-900 mb-2">Boutique Introuvable</h2>
          <p className="text-sm text-slate-600 mb-6">{error || 'Cette boutique n’existe pas.'}</p>
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs"
            >
              Retour à l’accueil
            </button>
          )}
        </div>
      </div>
    );
  }

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleInstantBuy = (product: Product) => {
    addToCart(product);
    setIsCheckoutOpen(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Categories
  const categories = ['TOUS', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'TOUS' || p.category === selectedCategory;
    const matchesQuery =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.liveCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* 🔴 Top Live TikTok Notice Bar */}
      {store.isLiveActive && (
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white px-4 py-3 sticky top-0 z-30 shadow-md">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <Radio className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">
                EN DIRECT SUR TIKTOK
              </span>
              <span className="hidden md:inline text-xs text-white/90">
                • {store.liveTitle || 'Articles présentés en direct avec paiement sécurisé'}
              </span>
            </div>

            <span className="text-[11px] font-bold bg-black/20 px-3 py-1 rounded-full">
              Paiement Wave & Orange Money
            </span>
          </div>
        </div>
      )}

      {/* Store Banner & Brand Header */}
      <div className="bg-white border-b border-slate-200">
        {store.bannerUrl && (
          <div className="w-full h-40 sm:h-56 relative overflow-hidden bg-slate-100">
            <img
              src={store.bannerUrl}
              alt={store.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 -mt-12 sm:-mt-14 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-white p-1.5 shadow-xl border border-slate-100 shrink-0">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full bg-teal-500 rounded-2xl flex items-center justify-center font-black text-slate-950 text-2xl">
                    {store.name.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {store.name}
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>Dakar, Sénégal</span>
                  <span>•</span>
                  <span className="text-teal-700 font-bold">Boutique Vérifiée LiveJaay</span>
                </p>
              </div>
            </div>

            {/* Social / WhatsApp contact buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto">
              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(store.name)},%20je%20suis%20sur%20votre%20boutique%20LiveJaay%20!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Partager le lien"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedLink ? 'Copié' : 'Partager'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mt-4 max-w-3xl leading-relaxed">
            {store.description}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* 🔥 FEATURED LIVE PRODUCT (IF SELLER PINNED IT IN LIVE STUDIO) */}
        {store.isLiveActive && store.featuredProduct && (
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white border-2 border-rose-500/40 shadow-xl relative overflow-hidden animate-fade-in">
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="w-full md:w-56 aspect-square rounded-2xl overflow-hidden bg-slate-800 shrink-0 relative">
                <img
                  src={store.featuredProduct.imageUrl}
                  alt={store.featuredProduct.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-rose-600 text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg">
                  CODE : {store.featuredProduct.liveCode}
                </div>
              </div>

              <div className="flex-1 space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5" />
                  Présenté En Direct Actuellement
                </div>

                <h3 className="text-xl sm:text-2xl font-black font-serif">
                  {store.featuredProduct.title}
                </h3>

                <p className="text-xs text-slate-300 max-w-xl line-clamp-2">
                  {store.featuredProduct.description}
                </p>

                <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                  <span className="text-2xl font-black font-mono text-teal-300">
                    {store.featuredProduct.price.toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-lg">
                    Reste {store.featuredProduct.stock} pièce(s)
                  </span>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleInstantBuy(store.featuredProduct!)}
                  disabled={store.featuredProduct.stock <= 0}
                  className="w-full md:w-auto px-6 py-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Commander en Live (1 Clic)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Categories Bar */}
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Rechercher un article ou son code Live (ex: L01, Robe...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm bg-transparent focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const inCartItem = cart.find((c) => c.product.id === product.id);
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square bg-slate-100">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-3 left-3 bg-slate-950/90 text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg">
                      CODE : {product.liveCode}
                    </div>

                    {product.compareAtPrice && (
                      <div className="absolute top-3 right-3 bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                        Promo
                      </div>
                    )}

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center text-white font-black text-sm uppercase tracking-wider">
                        Épuisé en Live
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">
                      {product.category}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {product.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-black text-slate-900 text-base">
                        {product.price.toLocaleString('fr-FR')} FCFA
                      </span>
                      {product.compareAtPrice && (
                        <span className="block text-xs font-mono text-slate-400 line-through">
                          {product.compareAtPrice.toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[11px] font-mono font-bold ${
                        product.stock <= 3 ? 'text-rose-600' : 'text-teal-700'
                      }`}
                    >
                      {product.stock <= 0 ? 'Rupture' : `${product.stock} dispo`}
                    </span>
                  </div>

                  {/* Add to cart / Qty button */}
                  {inCartItem ? (
                    <div className="flex items-center justify-between p-1.5 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => updateCartQty(product.id, -1)}
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-slate-800 shadow-2xs cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-black text-xs text-slate-900">
                        {inCartItem.quantity} dans le panier
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={inCartItem.quantity >= product.stock}
                        className="w-8 h-8 rounded-lg bg-teal-500 hover:bg-teal-400 flex items-center justify-center font-bold text-slate-950 shadow-2xs cursor-pointer disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter au panier</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Sticky Bar (for mobile TikTok shoppers) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto animate-slide-up">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-3xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center font-black text-xs">
                {cartTotalCount}
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Votre sélection</span>
                <span className="font-mono font-black text-teal-400 text-base">
                  {cartSubtotal.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Commander & Payer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        store={store}
        cart={cart}
        onOrderSuccess={(order) => {
          setIsCheckoutOpen(false);
          setCart([]);
          setCompletedOrder(order);
          loadStoreData(); // refresh stock
        }}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={!!completedOrder}
        onClose={() => setCompletedOrder(null)}
        order={completedOrder}
        store={store}
      />
    </div>
  );
};
