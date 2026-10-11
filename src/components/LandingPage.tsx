import React from 'react';
import {
  Radio,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Truck,
  MessageCircle,
  QrCode,
  Zap,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onExplorePublicStore: () => void;
  onGoToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onExplorePublicStore,
  onGoToDashboard,
}) => {
  const { isAuthenticated, store } = useAuth();

  return (
    <div className="space-y-16 pb-20 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#1dc3b2_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 animate-pulse">
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>Spécial Vendeurs TikTok au Sénégal</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight font-serif max-w-4xl mx-auto">
            Du Live TikTok à la Commande Payée.
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Fini le désordre des commentaires et les faux acheteurs. Vos spectateurs TikTok
            commandent sur votre boutique dédiée et règlent instantanément par{' '}
            <strong className="text-teal-400">Wave</strong> ou{' '}
            <strong className="text-orange-400">Orange Money</strong>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onGoToDashboard}
                className="w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Accéder à mon Espace Vendeur ({store?.name})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Créer ma Boutique Gratuitement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onExplorePublicStore}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Tester la Boutique Acheteur Démo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Payment Badges Trust */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
              Encaissement Wave Sénégal (1%)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              Orange Money Maxit & OTP
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              Paiement à la livraison
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Validation Côté Serveur
            </span>
          </div>
        </div>
      </section>

      {/* The 4 Pain Points Solved */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs uppercase font-extrabold text-teal-600 tracking-wider">
            Les Réalités du Commerce TikTok à Dakar
          </span>
          <h2 className="text-3xl font-black text-slate-900 font-serif">
            Pourquoi les Vendeurs Choisissent LiveJaay
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Résolvez les 4 grands blocages qui font perdre des millions de FCFA aux commerçants en direct.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Plus de DM Perdues</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Les commentaires TikTok défilent trop vite. LiveJaay centralise tous les achats en commandes nettes avec nom, téléphone et panier complet.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black">
              2
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Stocks en Direct</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dès qu'une cliente achète la robe Bazin, le stock se décrémente en direct. Plus aucune double réservation impossible à honorer.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              3
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Commandes 100% Payées</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Les « je prends » non payés vous font bloquer la marchandise pour rien. Sur LiveJaay, la commande est confirmée une fois le Mobile Money reçu.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              4
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Livraisons Claires</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zones paramétrées d'avance (Plateau, Almadies, Guédiawaye, Thiès...) avec tarifs clairs en FCFA et bouton WhatsApp pour le livreur.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works for a TikTok Live Seller */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Parcours Simple en 4 Étapes
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-serif">
            Comment Fonctionne Votre Soirée de Live ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/10">
            <span className="font-mono font-black text-teal-400 text-xl">01</span>
            <h4 className="font-extrabold text-sm">Ajoutez vos Articles</h4>
            <p className="text-xs text-slate-300">
              Photos, prix en FCFA, stock et code Live (ex: <code>L01</code>).
            </p>
          </div>

          <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/10">
            <span className="font-mono font-black text-rose-400 text-xl">02</span>
            <h4 className="font-extrabold text-sm">Lancez votre Live</h4>
            <p className="text-xs text-slate-300">
              Affichez votre Code QR à la caméra ou mettez le lien dans votre biographie.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/10">
            <span className="font-mono font-black text-teal-400 text-xl">03</span>
            <h4 className="font-extrabold text-sm">Les Clients Payent</h4>
            <p className="text-xs text-slate-300">
              Paiement Wave ou Orange Money vérifié côté serveur sans intervention manuelle.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/10">
            <span className="font-mono font-black text-emerald-400 text-xl">04</span>
            <h4 className="font-extrabold text-sm">Expédiez les Colis</h4>
            <p className="text-xs text-slate-300">
              Imprimez ou consultez les adresses exactes et confiez les paquets aux livreurs.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6 pt-8">
        <h2 className="text-3xl font-black text-slate-900 font-serif">
          Prêt à Booster vos Ventes TikTok à Dakar ?
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Rejoignez les boutiques qui professionnalisent leurs lives avec LiveJaay.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => onOpenAuth('register')}
            className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl transition-all cursor-pointer"
          >
            Créer ma Boutique Maintenant
          </button>
          <button
            type="button"
            onClick={onExplorePublicStore}
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm transition-all cursor-pointer"
          >
            Voir la Boutique Démo
          </button>
        </div>
      </section>
    </div>
  );
};
