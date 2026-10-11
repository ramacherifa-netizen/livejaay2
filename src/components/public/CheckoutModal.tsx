import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Truck,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Store, CartItem, Order, PaymentMethod } from '../../types';
import { publicApi } from '../../lib/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
  cart: CartItem[];
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  store,
  cart,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  // Step 1: Information, Step 2: Payment Verification
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+221');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryZoneId, setDeliveryZoneId] = useState<string>(
    store.deliveryZones[0]?.id || ''
  );
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WAVE');
  const [paymentPhone, setPaymentPhone] = useState('');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculations
  const selectedZone =
    store.deliveryZones.find((z) => z.id === deliveryZoneId) ||
    store.deliveryZones[0];
  const deliveryFee = selectedZone ? selectedZone.price : 1500;
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const total = subtotal + deliveryFee;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Veuillez saisir votre nom et prénom.');
      return;
    }
    if (!phoneLocal.trim()) {
      setErrorMessage('Veuillez saisir un numéro de téléphone valide pour la livraison.');
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMessage('Veuillez préciser votre adresse exacte de livraison (quartier, repère).');
      return;
    }

    setPaymentPhone(phoneLocal);
    setStep(2);
  };

  const handleConfirmAndPay = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const fullPhone = `${countryCode}${phoneLocal.replace(/^0+/, '').replace(/\s+/g, '')}`;

    try {
      const res = await publicApi.verifyPaymentAndOrder({
        storeSlug: store.slug,
        customer: {
          fullName: fullName.trim(),
          phone: fullPhone,
          email: email.trim() || undefined,
          deliveryAddress: deliveryAddress.trim(),
          deliveryZoneId: selectedZone.id,
          deliveryZoneName: selectedZone.name,
          deliveryNotes: deliveryNotes.trim() || undefined,
        },
        items: cart.map((c) => ({
          productId: c.product.id,
          quantity: c.quantity,
        })),
        deliveryZoneId: selectedZone.id,
        paymentMethod,
        paymentSimulationPayload: {
          phone: paymentPhone,
          timestamp: Date.now(),
        },
      });

      if (res.success) {
        onOrderSuccess(res.order);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Le paiement a échoué. Veuillez vérifier vos informations.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs">
              LJ
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {step === 1 ? 'Livraison & Coordonnées' : 'Paiement Sécurisé Mobile Money'}
              </h3>
              <p className="text-xs text-slate-500">
                Commande auprès de <strong>{store.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="m-6 mb-0 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Customer & Delivery Info */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nom & Prénom *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Fatou Sow"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Téléphone (WhatsApp) *
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-slate-100 text-xs font-bold text-slate-700 px-2 py-2.5 border-r border-slate-200"
                  >
                    <option value="+221">🇸🇳 +221</option>
                    <option value="+225">🇨🇮 +225</option>
                    <option value="+223">🇲🇱 +223</option>
                    <option value="+33">🇫🇷 +33</option>
                  </select>
                  <input
                    type="tel"
                    value={phoneLocal}
                    onChange={(e) => setPhoneLocal(e.target.value)}
                    placeholder="77 123 45 67"
                    required
                    className="w-full px-3 py-2.5 text-slate-900 text-sm bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email (Facultatif)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fatou@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Zone de Livraison *
              </label>
              <select
                value={deliveryZoneId}
                onChange={(e) => setDeliveryZoneId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
              >
                {store.deliveryZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} (+{zone.price.toLocaleString('fr-FR')} FCFA • {zone.estimatedTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Adresse de livraison détaillée *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-red-500" />
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Ex: Almadies, en face de la pharmacie, Immeuble B, 2ème étage..."
                  required
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Indications pour le livreur (Facultatif)
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Ex: Appeler en arrivant, gardien devant le portail..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* Summary preview */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total articles ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="font-mono font-bold">{subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Livraison ({selectedZone.name})</span>
                <span className="font-mono font-bold">{deliveryFee.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total à régler</span>
                <span className="font-mono text-teal-700 text-base">
                  {total.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuer vers le paiement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Mobile Money Payment */}
        {step === 2 && (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Amount pill */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total de votre commande</span>
                <span className="text-xs text-slate-300">Livraison comprise</span>
              </div>
              <span className="font-mono font-black text-teal-400 text-xl">
                {total.toLocaleString('fr-FR')} FCFA
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Choisissez votre moyen de paiement au Sénégal :
              </span>

              {/* Wave */}
              {store.paymentSettings.waveEnabled && (
                <label
                  onClick={() => setPaymentMethod('WAVE')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'WAVE'
                      ? 'border-teal-500 bg-teal-50/30 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs">
                      W
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">Wave Sénégal</p>
                      <p className="text-xs text-slate-500">
                        {store.paymentSettings.waveAccountName} ({store.paymentSettings.waveNumber})
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'WAVE'}
                    onChange={() => setPaymentMethod('WAVE')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                </label>
              )}

              {/* Orange Money */}
              {store.paymentSettings.orangeMoneyEnabled && (
                <label
                  onClick={() => setPaymentMethod('ORANGE_MONEY')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'ORANGE_MONEY'
                      ? 'border-orange-500 bg-orange-50/30 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-sm shadow-xs">
                      OM
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">Orange Money Sénégal</p>
                      <p className="text-xs text-slate-500">
                        {store.paymentSettings.orangeMoneyAccountName} ({store.paymentSettings.orangeMoneyNumber})
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'ORANGE_MONEY'}
                    onChange={() => setPaymentMethod('ORANGE_MONEY')}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                </label>
              )}

              {/* Cash à la livraison */}
              {store.paymentSettings.cashOnDeliveryEnabled && (
                <label
                  onClick={() => setPaymentMethod('CASH_LIVRAISON')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'CASH_LIVRAISON'
                      ? 'border-slate-900 bg-slate-100 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-sm shadow-xs">
                      💵
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">Paiement à la Livraison</p>
                      <p className="text-xs text-slate-500">Règlement en espèces remis au livreur</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'CASH_LIVRAISON'}
                    onChange={() => setPaymentMethod('CASH_LIVRAISON')}
                    className="text-slate-900 focus:ring-slate-900"
                  />
                </label>
              )}
            </div>

            {/* Mobile Money Number confirmation */}
            {(paymentMethod === 'WAVE' || paymentMethod === 'ORANGE_MONEY') && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Numéro de téléphone de débit {paymentMethod === 'WAVE' ? 'Wave' : 'Orange Money'} :
                </label>
                <input
                  type="tel"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="77 123 45 67"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Validation serveur sécurisée avec débit instantané et confirmation.</span>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                ← Retour
              </button>

              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={isLoading}
                className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === 'WAVE'
                    ? 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                    : paymentMethod === 'ORANGE_MONEY'
                    ? 'bg-orange-500 hover:bg-orange-400 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Vérification et validation du paiement...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      {paymentMethod === 'CASH_LIVRAISON'
                        ? 'Confirmer ma Commande'
                        : `Payer ${total.toLocaleString('fr-FR')} FCFA`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
