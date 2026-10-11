import React, { useState } from 'react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { publicApi } from '../../lib/api';
import { Order } from '../../types';

export const OrderTrackingView: React.FC = () => {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [storeInfo, setStoreInfo] = useState<{
    name: string;
    slug: string;
    whatsapp: string;
    phone: string;
    logoUrl?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await publicApi.getOrder(orderIdInput.trim().toUpperCase());
      setOrder(res.order);
      setStoreInfo(res.store);
    } catch (err: any) {
      setError(err.message || 'Numéro de commande introuvable.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'PAYE', label: 'Paiement Validé', desc: 'Confirmé côté serveur' },
    { key: 'EN_PREPARATION', label: 'En Préparation', desc: 'Colis en cours d’emballage' },
    { key: 'EN_LIVRAISON', label: 'En Livraison', desc: 'Remis au coursier' },
    { key: 'LIVRE', label: 'Colis Livré', desc: 'Réceptionné à votre adresse' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PAYE':
        return 0;
      case 'EN_PREPARATION':
        return 1;
      case 'EN_LIVRAISON':
        return 2;
      case 'LIVRE':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Suivi des Ventes Live TikTok
        </span>
        <h2 className="text-3xl font-black text-slate-900 font-serif">
          Suivre ma Commande LiveJaay
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Saisissez votre référence de commande (ex: <strong>LJ-2026-9041</strong>) pour consulter l'avancement de votre livraison en temps réel.
        </p>
      </div>

      {/* Search box */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <Package className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
            placeholder="LJ-2026-9041"
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !orderIdInput.trim()}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-teal-400" /> : <Search className="w-4 h-4" />}
          <span>Rechercher</span>
        </button>
      </form>

      {/* Feedback error */}
      {error && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Details Card */}
      {order && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden animate-fade-in space-y-6 p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-mono font-black text-slate-900 text-xl">{order.id}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {order.paymentMethod === 'WAVE' ? 'Wave' : order.paymentMethod === 'ORANGE_MONEY' ? 'Orange Money' : 'Cash'} • {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Boutique : <strong>{storeInfo?.name || 'LiveJaay'}</strong> • Commandé le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>

            {storeInfo?.whatsapp && (
              <a
                href={`https://wa.me/${storeInfo.whatsapp.replace(/[^0-9]/g, '')}?text=Bonjour,%20je%20suis%20au%20sujet%20de%20la%20commande%20${order.id}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contacter le vendeur</span>
              </a>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Progression de la livraison :
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {steps.map((st, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={st.key}
                    className={`p-4 rounded-2xl border text-center space-y-1 transition-all ${
                      isCurrent
                        ? 'bg-teal-50 border-teal-500 shadow-xs'
                        : isPassed
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-white border-slate-100 opacity-40'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-black ${
                        isPassed ? 'bg-teal-500 text-slate-950' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p className="font-extrabold text-slate-900 text-xs">{st.label}</p>
                    <p className="text-[10px] text-slate-500">{st.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Items Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider block">
                Adresse de Destination
              </span>
              <p className="font-extrabold text-slate-900">{order.customer.fullName}</p>
              <p className="text-slate-600">{order.customer.deliveryAddress}</p>
              <p className="text-teal-700 font-bold">{order.customer.deliveryZoneName}</p>
              <p className="text-slate-500">Tél : {order.customer.phone}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider block">
                Articles & Réf. Paiement
              </span>
              <div className="space-y-1">
                {order.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{i.quantity}x {i.title}</span>
                    <span className="font-mono font-bold">{(i.price * i.quantity).toLocaleString('fr-FR')} F</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900">
                <span>Total Payé</span>
                <span className="font-mono text-teal-700">{order.total.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Transaction : {order.paymentReference}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
