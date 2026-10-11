import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { sellerApi } from '../../lib/api';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updatedOrder: Order) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  if (!isOpen || !order) return null;

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      const res = await sellerApi.updateOrderStatus(order.id, newStatus);
      setCurrentStatus(newStatus);
      onStatusUpdated(res.order);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAYE':
        return <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-bold">✓ Payé</span>;
      case 'EN_PREPARATION':
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">⏳ En préparation</span>;
      case 'EN_LIVRAISON':
        return <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">🚚 En cours de livraison</span>;
      case 'LIVRE':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">📦 Livré avec succès</span>;
      case 'ANNULE':
        return <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold">✕ Annulée</span>;
    }
  };

  const waLink = `https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(order.customer.fullName)},%20c'est%20au%20sujet%20de%20votre%20commande%20LiveJaay%20${order.id}.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-black text-slate-900 text-lg">{order.id}</h3>
              {getStatusBadge(currentStatus)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status selector */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Changer le Statut de Livraison
              </span>
              <span className="text-xs text-slate-500">Mise à jour en temps réel pour l'acheteur</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                disabled={isUpdating}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
              >
                <option value="PAYE">Payé</option>
                <option value="EN_PREPARATION">En préparation</option>
                <option value="EN_LIVRAISON">En cours de livraison</option>
                <option value="LIVRE">Livré</option>
                <option value="ANNULE">Annulé</option>
              </select>
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-teal-600" />}
            </div>
          </div>

          {/* Customer info & contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client & Contact</h4>
              <p className="font-extrabold text-slate-900 text-base">{order.customer.fullName}</p>
              <p className="font-mono text-sm text-slate-700 font-bold">{order.customer.phone}</p>
              {order.customer.email && (
                <p className="text-xs text-slate-500">{order.customer.email}</p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <a
                  href={`tel:${order.customer.phone}`}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-700" />
                  <span>Appeler</span>
                </a>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lieu de Livraison</h4>
              <p className="font-bold text-slate-900 text-sm">{order.customer.deliveryZoneName}</p>
              <p className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{order.customer.deliveryAddress}</span>
              </p>
              {order.customer.deliveryNotes && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
                  <strong>Notes du client :</strong> {order.customer.deliveryNotes}
                </div>
              )}
            </div>
          </div>

          {/* Payment summary */}
          <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-black flex items-center justify-center text-xs">
                {order.paymentMethod === 'WAVE' ? 'WAVE' : order.paymentMethod === 'ORANGE_MONEY' ? 'OM' : 'CASH'}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900">
                  {order.paymentMethod === 'WAVE'
                    ? 'Paiement Wave Sénégal'
                    : order.paymentMethod === 'ORANGE_MONEY'
                    ? 'Paiement Orange Money'
                    : 'Paiement à la livraison'}
                </span>
                <p className="text-[11px] font-mono text-slate-500">
                  Réf. Transaction : {order.paymentReference}
                </p>
              </div>
            </div>

            <div className="text-right self-end sm:self-auto">
              <span className="text-xs text-slate-500 block">Total Réglé</span>
              <span className="font-mono font-black text-teal-800 text-lg">
                {order.total.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Articles commandés ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {item.quantity} x {item.price.toLocaleString('fr-FR')} FCFA
                        {item.liveCode && ` • Code Live: ${item.liveCode}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-extrabold text-slate-900 text-sm">
                    {(item.quantity * item.price).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              ))}

              <div className="p-3.5 bg-slate-50 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Sous-total articles</span>
                <span className="font-mono font-bold">{order.subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="p-3.5 bg-slate-50 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Frais de livraison ({order.customer.deliveryZoneName})</span>
                <span className="font-mono font-bold">{order.deliveryFee.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="p-3.5 bg-slate-100 flex items-center justify-between font-bold text-slate-900 text-sm">
                <span>Total Commande</span>
                <span className="font-mono font-black text-teal-700 text-base">
                  {order.total.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
