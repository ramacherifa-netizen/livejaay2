import React, { useState } from 'react';
import {
  Radio,
  Sparkles,
  QrCode,
  TrendingUp,
  PackageCheck,
  Plus,
  Minus,
  CheckCircle2,
  Phone,
  MessageCircle,
  ExternalLink,
  Flame,
  Volume2,
} from 'lucide-react';
import { Store, Product, Order } from '../../types';
import { sellerApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface LiveStudioProps {
  products: Product[];
  orders: Order[];
  onOpenQR: () => void;
  onRefreshProducts: () => void;
  onPreviewPublicStore: () => void;
}

export const LiveStudio: React.FC<LiveStudioProps> = ({
  products,
  orders,
  onOpenQR,
  onRefreshProducts,
  onPreviewPublicStore,
}) => {
  const { store, updateStoreLocally } = useAuth();
  if (!store) return null;

  const [isLiveActive, setIsLiveActive] = useState(store.isLiveActive);
  const [liveTitle, setLiveTitle] = useState(
    store.liveTitle || '🔴 LIVE EN DIRECT SUR TIKTOK - PAIEMENT WAVE & ORANGE MONEY'
  );
  const [featuredProductId, setFeaturedProductId] = useState<string>(
    store.liveFeaturedProductId || (products[0]?.id || '')
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Live filtered orders
  const recentLiveOrders = orders.slice(0, 6);
  const liveTotalSales = orders
    .filter((o) => o.status !== 'ANNULE' && o.paymentStatus === 'COMPLETE')
    .reduce((sum, o) => sum + o.total, 0);

  const handleToggleLive = async () => {
    setIsUpdating(true);
    const nextState = !isLiveActive;
    try {
      const res = await sellerApi.updateLiveSession({
        isLiveActive: nextState,
        liveTitle,
        liveFeaturedProductId: featuredProductId,
      });
      setIsLiveActive(nextState);
      updateStoreLocally(res.store);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetFeaturedProduct = async (prodId: string) => {
    setFeaturedProductId(prodId);
    try {
      const res = await sellerApi.updateLiveSession({
        isLiveActive,
        liveTitle,
        liveFeaturedProductId: prodId,
      });
      updateStoreLocally(res.store);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustStock = async (prodId: string, delta: number) => {
    try {
      await sellerApi.updateStock(prodId, delta);
      onRefreshProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const featuredProd = products.find((p) => p.id === featuredProductId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Top Live Control Hero */}
      <div
        className={`p-6 md:p-8 rounded-3xl transition-all shadow-xl ${
          isLiveActive
            ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-2 border-rose-500/50 text-white'
            : 'bg-slate-900 border border-slate-800 text-white'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isLiveActive
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                {isLiveActive ? 'Mode Live TikTok Activé' : 'Mode Live Hors-Ligne'}
              </span>

              <span className="text-xs text-slate-400">
                Vos spectateurs TikTok commandent et payent en temps réel
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black font-serif">
              Live Studio Vendeur
            </h2>

            <div className="pt-2 max-w-xl">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Titre diffusé sur la boutique :
              </label>
              <input
                type="text"
                value={liveTitle}
                onChange={(e) => setLiveTitle(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleToggleLive}
              disabled={isUpdating}
              className={`px-6 py-4 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer flex-1 lg:flex-none ${
                isLiveActive
                  ? 'bg-white text-rose-700 hover:bg-slate-100'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              <Radio className={`w-5 h-5 ${isLiveActive ? 'animate-spin' : ''}`} />
              <span>{isLiveActive ? '🔴 ARRÊTER LE LIVE' : '🚀 DÉMARRER LE LIVE'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenQR}
              className="px-5 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              <span>Code QR à l'Écran</span>
            </button>

            <button
              type="button"
              onClick={onPreviewPublicStore}
              className="px-4 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition-all border border-white/10 flex items-center justify-center cursor-pointer"
              title="Aperçu Acheteur"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Featured Live Product & Quick Stock Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Featured Product in Live (1/3) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                Produit Vedette du Live
              </h3>
            </div>
            <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              En direct
            </span>
          </div>

          {featuredProd ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-200">
                <img
                  src={featuredProd.imageUrl}
                  alt={featuredProd.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-rose-600 text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
                  CODE : {featuredProd.liveCode}
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-sm text-teal-300 font-mono font-black text-sm px-3 py-1 rounded-lg">
                  {featuredProd.price.toLocaleString('fr-FR')} FCFA
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-base leading-tight">
                  {featuredProd.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {featuredProd.description}
                </p>
              </div>

              {/* Stock in live quick adjust */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Stock restant :</span>
                  <span
                    className={`font-mono font-black text-lg ${
                      featuredProd.stock <= 3 ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {featuredProd.stock} pièces
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAdjustStock(featuredProd.id, -1)}
                    disabled={featuredProd.stock <= 0}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-800 disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustStock(featuredProd.id, 1)}
                    className="w-9 h-9 rounded-xl bg-teal-500 hover:bg-teal-400 flex items-center justify-center font-bold text-slate-950 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              Aucun produit vedette sélectionné. Choisissez-en un dans la liste ci-contre !
            </p>
          )}

          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            💡 Astuce : Pendant que vous parlez d’un article à la caméra, cliquez dessus
            ci-contre pour l’afficher au sommet de l’écran de tous vos clients !
          </p>
        </div>

        {/* Middle & Right Column: Fast Catalog Selector during Live (2/3) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Sélection Rapide des Articles Présentés
              </h3>
              <p className="text-xs text-slate-500">
                Cliquez pour changer le produit vedette ou ajuster les stocks en direct
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-500">
              {products.length} articles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {products.map((prod) => {
              const isSelected = prod.id === featuredProductId;
              return (
                <div
                  key={prod.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50/40 border-rose-500 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
                  }`}
                  onClick={() => handleSetFeaturedProduct(prod.id)}
                >
                  <img
                    src={prod.imageUrl}
                    alt={prod.title}
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-slate-900 text-white">
                        {prod.liveCode}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                          En direct
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {prod.title}
                    </h4>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-mono font-extrabold text-slate-900">
                        {prod.price.toLocaleString('fr-FR')} F
                      </span>
                      <span
                        className={`text-[11px] font-mono font-bold ${
                          prod.stock <= 3 ? 'text-rose-600' : 'text-slate-500'
                        }`}
                      >
                        Stock: {prod.stock}
                      </span>
                    </div>
                  </div>

                  {/* Micro adjust button */}
                  <div
                    className="flex flex-col gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(prod.id, 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-800 shadow-2xs"
                      title="Ajouter +1 stock"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(prod.id, -1)}
                      disabled={prod.stock <= 0}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-800 shadow-2xs disabled:opacity-30"
                      title="Retirer -1 stock"
                    >
                      -
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time incoming orders during live stream */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Commandes Reçues en Direct
              </h3>
              <p className="text-xs text-slate-500">
                Paiements validés côté serveur par Wave ou Orange Money
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total Live Encaissé</span>
            <span className="font-mono font-black text-teal-600 text-lg">
              {liveTotalSales.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {recentLiveOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              En attente des premières commandes du live... Partagez votre lien ou montrez le Code QR !
            </div>
          ) : (
            recentLiveOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-black font-mono text-xs shrink-0">
                    {order.paymentMethod === 'WAVE' ? 'WAVE' : 'OM'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">
                        {order.customer.fullName}
                      </span>
                      <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                        {order.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {order.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')} • {order.customer.deliveryZoneName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="font-mono font-black text-slate-900 text-base">
                      {order.total.toLocaleString('fr-FR')} FCFA
                    </span>
                    <span className="block text-[11px] font-bold text-teal-600">
                      ✓ Payé ({order.paymentReference.slice(0, 14)}...)
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(order.customer.fullName)},%20merci%20pour%20votre%20commande%20LiveJaay%20${order.id}%20pendant%20notre%20Live%20TikTok%20!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-colors"
                    title="Envoyer confirmation WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
