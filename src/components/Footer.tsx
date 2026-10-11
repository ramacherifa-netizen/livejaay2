import React, { useState } from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { LegalModal } from './auth/LegalModal';

export const Footer: React.FC = () => {
  const [legalType, setLegalType] = useState<'terms' | 'privacy' | null>(null);

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-serif font-black text-xl text-white">LiveJaay</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Sénégal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              « Du live TikTok à la commande payée » • Infrastructure de vente en direct
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => setLegalType('terms')}
              className="hover:text-teal-400 transition-colors cursor-pointer"
            >
              Conditions Générales d'Utilisation
            </button>
            <button
              onClick={() => setLegalType('privacy')}
              className="hover:text-teal-400 transition-colors cursor-pointer"
            >
              Politique de Confidentialité
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LiveJaay. Tous droits réservés. Dakar, République du Sénégal.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-teal-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Paiements Sécurisés Wave & Orange Money
            </span>
          </div>
        </div>
      </div>

      <LegalModal type={legalType} onClose={() => setLegalType(null)} />
    </footer>
  );
};
