import React, { useState } from 'react';
import {
  Store as StoreIcon,
  Globe,
  Phone,
  MessageCircle,
  MapPin,
  Truck,
  CreditCard,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  QrCode,
  Image as ImageIcon,
  X,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Store, DeliveryZone } from '../../types';
import { sellerApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  validateSlug,
  SYSTEM_RESERVED_SLUGS,
  BRAND_AND_OFFICIAL_RESERVED,
  FORBIDDEN_KEYWORDS,
} from '../../lib/reservedTerms';

interface StoreSettingsProps {
  onOpenQR: () => void;
  onPreviewPublicStore: () => void;
}

export const StoreSettings: React.FC<StoreSettingsProps> = ({ onOpenQR, onPreviewPublicStore }) => {
  const { store, updateStoreLocally } = useAuth();

  if (!store) return null;

  // Form states
  const [name, setName] = useState(store.name);
  const [slug, setSlug] = useState(store.slug);
  const [description, setDescription] = useState(store.description);
  const [phone, setPhone] = useState(store.phone);
  const [whatsapp, setWhatsapp] = useState(store.whatsapp);
  const [tiktokHandle, setTiktokHandle] = useState(store.tiktokHandle || '');
  const [instagramHandle, setInstagramHandle] = useState(store.instagramHandle || '');
  const [logoUrl, setLogoUrl] = useState(store.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState(store.bannerUrl || '');
  const [dispatchAddress, setDispatchAddress] = useState(store.dispatchAddress || '');

  // Delivery zones
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(store.deliveryZones || []);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZonePrice, setNewZonePrice] = useState('2000');
  const [newZoneTime, setNewZoneTime] = useState('2h - 4h');

  // Payment settings
  const [waveEnabled, setWaveEnabled] = useState(store.paymentSettings.waveEnabled);
  const [waveNumber, setWaveNumber] = useState(store.paymentSettings.waveNumber);
  const [waveAccountName, setWaveAccountName] = useState(store.paymentSettings.waveAccountName);

  const [orangeMoneyEnabled, setOrangeMoneyEnabled] = useState(store.paymentSettings.orangeMoneyEnabled);
  const [orangeMoneyNumber, setOrangeMoneyNumber] = useState(store.paymentSettings.orangeMoneyNumber);
  const [orangeMoneyAccountName, setOrangeMoneyAccountName] = useState(store.paymentSettings.orangeMoneyAccountName);

  const [cashOnDeliveryEnabled, setCashOnDeliveryEnabled] = useState(store.paymentSettings.cashOnDeliveryEnabled);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showReservedModal, setShowReservedModal] = useState(false);

  const publicUrl = `${window.location.origin}/boutique/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddZone = () => {
    if (!newZoneName.trim() || !newZonePrice) return;
    const newZone: DeliveryZone = {
      id: 'zone_' + Date.now(),
      name: newZoneName.trim(),
      price: Number(newZonePrice) || 1500,
      estimatedTime: newZoneTime.trim() || '2h - 4h',
    };
    setDeliveryZones([...deliveryZones, newZone]);
    setNewZoneName('');
    setNewZonePrice('2000');
    setNewZoneTime('2h - 4h');
  };

  const handleRemoveZone = (id: string) => {
    if (deliveryZones.length <= 1) {
      alert('Vous devez conserver au moins une zone de livraison.');
      return;
    }
    setDeliveryZones(deliveryZones.filter(z => z.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validate slug against reserved and forbidden terms
    const slugCheck = validateSlug(slug);
    if (!slugCheck.isValid) {
      setErrorMessage(slugCheck.error || 'Cet identifiant est réservé ou interdit.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await sellerApi.updateStore({
        name,
        slug,
        description,
        phone,
        whatsapp,
        tiktokHandle,
        instagramHandle,
        logoUrl,
        bannerUrl,
        dispatchAddress,
        deliveryZones,
        paymentSettings: {
          waveEnabled,
          waveNumber,
          waveAccountName,
          orangeMoneyEnabled,
          orangeMoneyNumber,
          orangeMoneyAccountName,
          cashOnDeliveryEnabled,
        },
      });

      updateStoreLocally(res.store);
      setSuccessMessage('Paramètres de la boutique enregistrés avec succès !');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Top Banner with Public Store Link */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-teal-400">Lien Public de Votre Boutique</span>
          <p className="text-xl md:text-2xl font-black mt-1 break-all font-mono text-teal-300">
            {publicUrl}
          </p>
          <p className="text-xs text-slate-300 mt-1">
            À coller dans votre bio TikTok ou à partager pendant vos lives !
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
          >
            {copiedLink ? <CheckCircle2 className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Lien copié !' : 'Copier le lien'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenQR}
            className="flex-1 md:flex-none px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Code QR Live</span>
          </button>

          <button
            type="button"
            onClick={onPreviewPublicStore}
            className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center border border-white/10 cursor-pointer"
            title="Ouvrir la boutique"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Informations Générales */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Identité de la Boutique</h3>
              <p className="text-xs text-slate-500">Nom commercial, identifiant unique et visuels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nom Commercial *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Identifiant Public (Slug de l'URL) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowReservedModal(true)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  Termes réservés & interdits ℹ️
                </button>
              </div>
              <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                <span className="text-xs text-slate-500 pl-3 font-mono">/boutique/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                  className="w-full px-2 py-2.5 bg-transparent text-sm font-mono font-bold text-teal-700 focus:outline-none"
                />
              </div>
              {slug && (() => {
                const check = validateSlug(slug);
                if (!check.isValid) {
                  return (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{check.error}</span>
                    </p>
                  );
                }
                return (
                  <p className="text-[11px] text-teal-600 mt-1 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-teal-600" />
                    <span>Lien disponible : livejaay.com/boutique/{slug}</span>
                  </p>
                );
              })()}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description de la boutique
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre boutique, vos articles tendance et les horaires de vos lives..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                URL du Logo
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                URL Image de Couverture (Bannière)
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Réseaux Sociaux */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Contacts & Réseaux Sociaux</h3>
              <p className="text-xs text-slate-500">Pour permettre à vos clients TikTok de vous joindre</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Numéro WhatsApp Professionnel *
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Compte TikTok Officiel
              </label>
              <div className="relative">
                <span className="text-xs font-bold absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-600">TT</span>
                <input
                  type="text"
                  value={tiktokHandle}
                  onChange={(e) => setTiktokHandle(e.target.value)}
                  placeholder="@votre_boutique_tiktok"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Compte Instagram (Facultatif)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600" />
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="@votre_boutique_ig"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Adresse de Départ des Livraisons
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-red-500" />
                <input
                  type="text"
                  value={dispatchAddress}
                  onChange={(e) => setDispatchAddress(e.target.value)}
                  placeholder="Ex: Marché HLM, Boutique n°44, Dakar"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Zones & Tarifs de Livraison */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Zones & Tarifs de Livraison (FCFA)</h3>
              <p className="text-xs text-slate-500">Configurez les frais facturés aux clients selon leur zone</p>
            </div>
          </div>

          <div className="space-y-3">
            {deliveryZones.map((zone, idx) => (
              <div
                key={zone.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">{zone.name}</p>
                  <p className="text-xs text-slate-500">Délai estimé : {zone.estimatedTime}</p>
                </div>
                <div className="flex items-center gap-3 self-end md:self-auto">
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-xl font-mono font-black text-slate-900 text-sm">
                    {zone.price.toLocaleString('fr-FR')} FCFA
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveZone(zone.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Supprimer la zone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add custom zone */}
          <div className="p-4 rounded-2xl bg-slate-100/60 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              + Ajouter une zone de livraison
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nom (Ex: Diamniadio / Sébikotane)"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
              />
              <input
                type="number"
                placeholder="Tarif en FCFA (Ex: 3000)"
                value={newZonePrice}
                onChange={(e) => setNewZonePrice(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono"
              />
              <input
                type="text"
                placeholder="Délai (Ex: 4h - 6h)"
                value={newZoneTime}
                onChange={(e) => setNewZoneTime(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleAddZone}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter cette zone</span>
            </button>
          </div>
        </div>

        {/* Section 4: Paramètres des Moyens de Paiement */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Informations de Paiement & Encaissement</h3>
              <p className="text-xs text-slate-500">Comptes sur lesquels vous recevez les paiements de vos ventes</p>
            </div>
          </div>

          {/* Wave */}
          <div className="p-5 rounded-2xl border-2 border-teal-500/20 bg-teal-50/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">
                  W
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Wave Sénégal</h4>
                  <p className="text-xs text-slate-500">Paiement instantané à 1% de frais</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={waveEnabled}
                  onChange={(e) => setWaveEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>

            {waveEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Numéro Wave Destinataire
                  </label>
                  <input
                    type="text"
                    value={waveNumber}
                    onChange={(e) => setWaveNumber(e.target.value)}
                    placeholder="77 123 45 67"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom du Titulaire Wave
                  </label>
                  <input
                    type="text"
                    value={waveAccountName}
                    onChange={(e) => setWaveAccountName(e.target.value)}
                    placeholder="Nom du marchand"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Orange Money */}
          <div className="p-5 rounded-2xl border-2 border-orange-500/20 bg-orange-50/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  OM
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Orange Money Sénégal</h4>
                  <p className="text-xs text-slate-500">Encaissement via Maxit / code marchand</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={orangeMoneyEnabled}
                  onChange={(e) => setOrangeMoneyEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {orangeMoneyEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Numéro Orange Money Destinataire
                  </label>
                  <input
                    type="text"
                    value={orangeMoneyNumber}
                    onChange={(e) => setOrangeMoneyNumber(e.target.value)}
                    placeholder="78 456 78 90"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom du Titulaire OM
                  </label>
                  <input
                    type="text"
                    value={orangeMoneyAccountName}
                    onChange={(e) => setOrangeMoneyAccountName(e.target.value)}
                    placeholder="Nom du titulaire"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cash à la livraison */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Paiement à la Livraison (Espèces)</h4>
              <p className="text-xs text-slate-500">Le client remet l'argent liquide au livreur à la réception</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cashOnDeliveryEnabled}
                onChange={(e) => setCashOnDeliveryEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>
        </div>

        {/* Save button sticky/fixed bar */}
        <div className="sticky bottom-6 p-4 bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-between text-white border border-slate-800">
          <span className="text-xs text-slate-300 hidden sm:inline">
            Toutes les modifications sont synchronisées avec vos acheteurs en direct.
          </span>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ml-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer la Boutique</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal: Liste des Termes Réservés et Interdits */}
      {showReservedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    Termes Réservés & Interdits sur LiveJaay
                  </h3>
                  <p className="text-xs text-slate-500">
                    Règles d'attribution des identifiants (slugs) et conformité légale au Sénégal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReservedModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-sm space-y-6">
              {/* Category 1: System */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    1. Termes Techniques & Système (Réservés)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ces termes sont réservés pour l'infrastructure technique, les routes de l'application et les fonctionnalités de LiveJaay :
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Array.from(SYSTEM_RESERVED_SLUGS).slice(0, 32).map((term) => (
                    <span
                      key={term}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[11px] rounded-md border border-slate-200"
                    >
                      {term}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 text-slate-400 font-mono text-[11px]">...</span>
                </div>
              </div>

              {/* Category 2: Brands & Officials */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    2. Marques Protégées & Usurpation Officielle (Réservés)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Il est strictement interdit de faire croire à une boutique officielle affiliée à des institutions bancaires, régulateurs ou plateformes partenaires :
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Array.from(BRAND_AND_OFFICIAL_RESERVED).map((term) => (
                    <span
                      key={term}
                      className="px-2 py-0.5 bg-teal-50 text-teal-800 font-mono text-[11px] rounded-md border border-teal-200"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* Category 3: Prohibited keywords */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    3. Termes & Activités Formellement Interdits (Sanction Immédiate)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Conformément au Code pénal et aux lois régissant le commerce en République du Sénégal, tout produit ou terme relatif aux fraudes, contrefaçons, armes ou stupéfiants est bloqué et sanctionné :
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {FORBIDDEN_KEYWORDS.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 bg-red-50 text-red-700 font-mono text-[11px] rounded-md border border-red-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReservedModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
