import React from 'react';
import {
  CheckCircle2,
  MessageCircle,
  Truck,
  Phone,
  Share2,
  Copy,
  ExternalLink,
  Sparkles,
  Download,
} from 'lucide-react';
import { Order, Store } from '../../types';

interface OrderConfirmationModalProps {
  order: Order | null;
  store: Store;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  store,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const waMessage = `Bonjour ${store.name} ! Je viens de commander et payer sur LiveJaay.\n\n📦 Commande : ${order.id}\n👤 Client : ${order.customer.fullName}\n📍 Adresse : ${order.customer.deliveryAddress} (${order.customer.deliveryZoneName})\n💰 Total : ${order.total.toLocaleString('fr-FR')} FCFA\n\nMerci de me confirmer la prise en charge de la livraison !`;

  const waLink = `https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-8 text-center">
        {/* Celebration Header */}
        <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 p-8 text-slate-950 relative">
          <div className="w-16 h-16 rounded-3xl bg-white shadow-xl mx-auto flex items-center justify-center text-teal-600 mb-3 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/15 text-slate-950 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Paiement Validé Côté Serveur
          </span>

          <h2 className="text-2xl font-black font-serif">Commande Confirmée !</h2>
          <p className="text-xs font-semibold text-slate-900/80 mt-1">
            Merci pour votre achat chez <strong>{store.name}</strong>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-left max-h-[70vh] overflow-y-auto">
          {/* Order ID & Status */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Numéro de Commande :</span>
              <span className="font-mono font-black text-slate-900 text-lg">
                {order.id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Mode de paiement :</span>
              <span className="font-black text-teal-700 text-xs uppercase">
                {order.paymentMethod === 'WAVE' ? 'Wave Sénégal' : order.paymentMethod === 'ORANGE_MONEY' ? 'Orange Money' : 'À la livraison'}
              </span>
            </div>
          </div>

          {/* Delivery Recap */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Truck className="w-4 h-4 text-teal-600" />
              <span>Livraison prévue à : {order.customer.deliveryZoneName}</span>
            </div>
            <p className="pl-6 text-slate-600">
              {order.customer.deliveryAddress}
            </p>
            <p className="pl-6 text-slate-500">
              Téléphone : {order.customer.phone}
            </p>
          </div>

          {/* Items Recap */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">{item.title}</span>
                    <span className="text-slate-500 font-mono">
                      Qté: {item.quantity} • Code: {item.liveCode}
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            ))}

            <div className="p-3 bg-slate-50 flex items-center justify-between font-extrabold text-slate-900 text-sm">
              <span>Total Payé</span>
              <span className="font-mono text-teal-700 text-base">
                {order.total.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Direct WhatsApp Callout */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <h4 className="font-extrabold text-emerald-950 text-xs">
              💬 Envoyez votre confirmation au vendeur sur WhatsApp :
            </h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Pour une préparation encore plus rapide de votre colis par la boutique, transmettez-lui votre reçu en 1 clic.
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contacter la Boutique sur WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            Retourner à la boutique
          </button>
        </div>
      </div>
    </div>
  );
};
