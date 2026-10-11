import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Radio,
  ShoppingBag,
  PackageCheck,
  Settings,
  Plus,
  QrCode,
  ExternalLink,
  Copy,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  DollarSign,
  Truck,
  Phone,
  MessageCircle,
  Eye,
  Trash2,
  Edit,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sellerApi } from '../../lib/api';
import { Product, Order, OrderStatus } from '../../types';
import { StoreSettings } from './StoreSettings';
import { LiveStudio } from './LiveStudio';
import { ProductModal } from './ProductModal';
import { OrderDetailsModal } from './OrderDetailsModal';
import { StoreQRModal } from './StoreQRModal';

interface SellerDashboardProps {
  onPreviewPublicStore: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onPreviewPublicStore }) => {
  const { user, store } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'live-studio' | 'products' | 'orders' | 'settings'>('overview');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalOrders: number;
    paidOrdersCount: number;
    totalItemsSold: number;
    liveRevenue: number;
    liveOrdersCount: number;
    lowStockCount: number;
    totalProducts: number;
  }>({
    totalRevenue: 0,
    totalOrders: 0,
    paidOrdersCount: 0,
    totalItemsSold: 0,
    liveRevenue: 0,
    liveOrdersCount: 0,
    lowStockCount: 0,
    totalProducts: 0,
  });

  const [loading, setLoading] = useState(true);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Filters & search
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [copiedLink, setCopiedLink] = useState(false);

  const loadData = async () => {
    try {
      const [prodsRes, ordersRes, statsRes] = await Promise.all([
        sellerApi.getProducts(),
        sellerApi.getOrders(),
        sellerApi.getAnalytics(),
      ]);
      setProducts(prodsRes.products);
      setOrders(ordersRes.orders);
      setStats(statsRes.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!store || !user) return null;

  const publicUrl = `${window.location.origin}/boutique/${store.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleQuickStockChange = async (productId: string, delta: number) => {
    try {
      await sellerApi.updateStock(productId, delta);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet article du catalogue ?')) return;
    try {
      await sellerApi.deleteProduct(productId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.liveCode.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.phone.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header / Store Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-teal-500/20 border border-teal-500/30 shrink-0">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-teal-400 text-xl">
                    {store.name.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black">{store.name}</h1>
                  {store.isLiveActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-bold animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      EN LIVE TIKTOK
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px] font-medium">
                      Hors-live
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span>Vendeur : <strong>{user.fullName}</strong></span>
                  <span>•</span>
                  <span className="font-mono text-teal-400">/boutique/{store.slug}</span>
                </div>
              </div>
            </div>

            {/* Top quick actions */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copié !' : 'Copier lien boutique'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQRModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code Live</span>
              </button>

              <button
                type="button"
                onClick={onPreviewPublicStore}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Voir Boutique en Ligne</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-slate-800/80 pt-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tableau de Bord</span>
            </button>

            <button
              onClick={() => setActiveTab('live-studio')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'live-studio'
                  ? 'bg-rose-500 text-white font-black shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4 text-rose-400" />
              <span>Live Studio (Mode TikTok)</span>
              {store.isLiveActive && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Articles & Stocks ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Commandes ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configuration Boutique</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Chiffre d’Affaires Total
                </span>
                <p className="text-2xl font-black font-mono text-slate-900">
                  {stats.totalRevenue.toLocaleString('fr-FR')} <span className="text-sm font-sans font-bold text-slate-500">FCFA</span>
                </p>
                <div className="flex items-center gap-1.5 text-xs text-teal-600 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{stats.paidOrdersCount} commandes payées</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ventes en Live TikTok
                </span>
                <p className="text-2xl font-black font-mono text-rose-600">
                  {stats.liveRevenue.toLocaleString('fr-FR')} <span className="text-sm font-sans font-bold text-slate-500">FCFA</span>
                </p>
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold">
                  <Radio className="w-3.5 h-3.5" />
                  <span>{stats.liveOrdersCount} ventes générées en live</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Articles Vendus
                </span>
                <p className="text-2xl font-black font-mono text-indigo-900">
                  {stats.totalItemsSold} <span className="text-sm font-sans font-bold text-slate-500">pièces</span>
                </p>
                <p className="text-xs text-slate-500">
                  Sur {stats.totalProducts} références au catalogue
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Alertes Stock Bas
                </span>
                <p className="text-2xl font-black font-mono text-amber-600">
                  {stats.lowStockCount} <span className="text-sm font-sans font-bold text-slate-500">articles</span>
                </p>
                <p className="text-xs text-amber-700 font-medium">
                  Rupture imminente (&lt; 5 en stock)
                </p>
              </div>
            </div>

            {/* Quick Live Mode Callout */}
            {!store.isLiveActive && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Vous allez lancer un direct sur TikTok ?
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Activez le Live Studio pour afficher le produit en vedette et voir les commandes tomber en direct !
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('live-studio')}
                  className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  Ouvrir le Live Studio
                </button>
              </div>
            )}

            {/* Recent Orders Preview */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-lg">Dernières Commandes Payées</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-teal-600 hover:underline"
                >
                  Voir toutes les commandes ({orders.length}) →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-700 shrink-0">
                        {order.paymentMethod === 'WAVE' ? 'WAVE' : 'OM'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-500">{order.id}</span>
                          <span className="font-bold text-slate-900 text-sm">{order.customer.fullName}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {order.items.length} article(s) • {order.customer.deliveryZoneName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {order.total.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="block text-[11px] font-bold text-teal-600">✓ Payé</span>
                      </div>
                      <span className="text-xs text-slate-400">Détails →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: LIVE STUDIO ================= */}
        {activeTab === 'live-studio' && (
          <LiveStudio
            products={products}
            orders={orders}
            onOpenQR={() => setIsQRModalOpen(true)}
            onRefreshProducts={loadData}
            onPreviewPublicStore={onPreviewPublicStore}
          />
        )}

        {/* ================= TAB 3: PRODUCTS & STOCKS ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Catalogue des Articles</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gérez vos prix en FCFA, vos codes Live et ajustez vos stocks instantanément
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Article</span>
              </button>
            </div>

            {/* Filter bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, catégorie ou code Live (ex: L01)..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full text-sm bg-transparent focus:outline-none"
              />
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-4/3 bg-slate-100">
                    <img
                      src={prod.imageUrl}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/90 text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg">
                      CODE : {prod.liveCode}
                    </div>
                    {prod.compareAtPrice && (
                      <div className="absolute top-3 right-3 bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                        Promo
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{prod.category}</span>
                        <span
                          className={`font-mono font-bold ${
                            prod.stock <= 3 ? 'text-rose-600' : 'text-teal-700'
                          }`}
                        >
                          Stock : {prod.stock}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                        {prod.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-black text-slate-900 text-lg">
                          {prod.price.toLocaleString('fr-FR')} FCFA
                        </span>
                        {prod.compareAtPrice && (
                          <span className="block text-xs font-mono text-slate-400 line-through">
                            {prod.compareAtPrice.toLocaleString('fr-FR')} FCFA
                          </span>
                        )}
                      </div>

                      {/* Stock fast buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickStockChange(prod.id, -1)}
                          disabled={prod.stock <= 0}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-xs disabled:opacity-40"
                          title="-1 stock"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStockChange(prod.id, 1)}
                          className="w-8 h-8 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center justify-center font-bold text-xs"
                          title="+1 stock"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(prod);
                            setIsProductModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 text-xs ml-1"
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center text-xs"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Gestion des Commandes</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Suivez les livraisons et contactez directement les clients sur WhatsApp
                </p>
              </div>

              {/* Status filter buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {['ALL', 'PAYE', 'EN_PREPARATION', 'EN_LIVRAISON', 'LIVRE'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      orderStatusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st === 'ALL'
                      ? 'Toutes'
                      : st === 'PAYE'
                      ? 'Payées'
                      : st === 'EN_PREPARATION'
                      ? 'Préparation'
                      : st === 'EN_LIVRAISON'
                      ? 'En livraison'
                      : 'Livrées'}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders search bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro de commande, nom ou téléphone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full text-sm bg-transparent focus:outline-none"
              />
            </div>

            {/* Orders list */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-sm">
                  Aucune commande ne correspond à ces critères.
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-slate-900 text-base">
                          {order.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {order.paymentMethod === 'WAVE' ? 'Wave' : order.paymentMethod === 'ORANGE_MONEY' ? 'Orange Money' : 'Cash'} • {order.status}
                        </span>
                        {order.isLiveOrder && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            Vente Live TikTok
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                        <span>Client : <strong>{order.customer.fullName}</strong></span>
                        <span>•</span>
                        <span>Tél : <strong>{order.customer.phone}</strong></span>
                        <span>•</span>
                        <span>Zone : <strong>{order.customer.deliveryZoneName}</strong></span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium">
                        Articles : {order.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end lg:self-auto shrink-0">
                      <div className="text-right">
                        <span className="font-mono font-black text-slate-900 text-lg">
                          {order.total.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Livraison incluse ({order.deliveryFee} F)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(order.customer.fullName)},%20c'est%20au%20sujet%20de%20votre%20commande%20LiveJaay%20${order.id}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Gérer Commande
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <StoreSettings
            onOpenQR={() => setIsQRModalOpen(true)}
            onPreviewPublicStore={onPreviewPublicStore}
          />
        )}
      </div>

      {/* Product modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        onSaved={() => {
          loadData();
          setIsProductModalOpen(false);
        }}
      />

      {/* Order Details modal */}
      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusUpdated={(updated) => {
          loadData();
          setSelectedOrder(updated);
        }}
      />

      {/* QR Code modal */}
      <StoreQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        store={store}
      />
    </div>
  );
};
