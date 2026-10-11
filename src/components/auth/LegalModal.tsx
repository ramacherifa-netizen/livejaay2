import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              {type === 'terms' ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {type === 'terms' ? 'Conditions Générales d’Utilisation (CGU)' : 'Politique de Confidentialité'}
              </h3>
              <p className="text-xs text-slate-500">LiveJaay Sénégal • Cadre légal du commerce électronique</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto text-sm text-slate-700 leading-relaxed space-y-4">
          {type === 'terms' ? (
            <>
              <h4 className="font-bold text-slate-900 text-base">1. Objet du Service LiveJaay</h4>
              <p>
                LiveJaay fournit aux commerçants et créateurs de contenu sur TikTok au Sénégal une infrastructure
                numérique leur permettant de transformer leurs ventes en direct en commandes structurées et payées par
                Mobile Money (Wave, Orange Money) ou paiement à la livraison.
              </p>

              <h4 className="font-bold text-slate-900 text-base">2. Responsabilités du Vendeur</h4>
              <p>
                Le Vendeur s’engage à vendre exclusivement des produits licites, conformes aux lois en vigueur en République
                du Sénégal. Le Vendeur est seul responsable de la conformité de ses stocks, de la description exacte des
                articles présentés pendant le live TikTok, de la préparation des colis et de l’expédition aux clients finaux.
              </p>

              <h4 className="font-bold text-slate-900 text-base">3. Transactions et Encaissements</h4>
              <p>
                Les règlements effectués par les clients finaux via Wave Sénégal ou Orange Money sont validés côté serveur.
                La commande n’est considérée comme confirmée que lorsque le paiement a été effectivement authentifié.
              </p>

              <h4 className="font-bold text-slate-900 text-base">4. Politique de Livraison et Retours</h4>
              <p>
                Le Vendeur détermine lui-même les zones de livraison desservies (Dakar, Banlieue, Régions) et les tarifs
                associés. En cas de non-livraison ou de produit non conforme, le Vendeur et l’Acheteur règlent le litige
                selon les politiques de garantie convenues.
              </p>

              <h4 className="font-bold text-slate-900 text-base">5. Termes Réservés et Activités Interdites</h4>
              <p>
                Afin de prévenir toute usurpation d'identité et protéger les consommateurs, LiveJaay applique une liste
                stricte de termes réservés et interdits pour les identifiants publics (slugs) et noms de boutiques :
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li>
                  <strong>Termes techniques et administratifs réservés :</strong> <code>admin</code>, <code>api</code>, <code>auth</code>, <code>login</code>, <code>dashboard</code>, <code>vendeur</code>, <code>boutique</code>, <code>commande</code>, <code>suivi</code>, <code>paiement</code>, etc.
                </li>
                <li>
                  <strong>Marques et organismes protégés :</strong> <code>livejaay</code>, <code>tiktok</code>, <code>wave</code>, <code>orange-money</code>, <code>freemoney</code>, <code>bceao</code>, <code>police</code>, <code>douane</code>, <code>officiel</code>, <code>etat</code>, etc.
                </li>
                <li>
                  <strong>Produits et activités formellement prohibés :</strong> stupéfiants et substances illicites (yamba, tramadol, etc.), armes et munitions, fausse monnaie, faux billets, loteries non agréées, systèmes pyramidaux, arnaques et contrefaçons manifestes.
                </li>
              </ul>
              <p className="text-xs text-red-600 font-semibold">
                Tout compte utilisant un terme réservé détourné ou proposant des articles illicites sera immédiatement suspendu sans préavis.
              </p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-slate-900 text-base">1. Collecte des Données Personnelles</h4>
              <p>
                Conformément aux directives de la Commission de Protection des Données Personnelles (CDP) du Sénégal,
                LiveJaay ne collecte que les informations strictement nécessaires à l’exécution des commandes : nom,
                numéro de téléphone (WhatsApp), adresse de livraison et adresse e-mail.
              </p>

              <h4 className="font-bold text-slate-900 text-base">2. Sécurité des Mots de Passe & Transactions</h4>
              <p>
                Les mots de passe des vendeurs ne sont jamais stockés en clair. Ils sont chiffrés et salés de manière
                cryptographique. Aucune information sensible relative aux comptes bancaires ou codes secrets Mobile Money
                n’est conservée par LiveJaay.
              </p>

              <h4 className="font-bold text-slate-900 text-base">3. Confidentialité des Commandes</h4>
              <p>
                Les coordonnées des acheteurs ne sont accessibles qu’au vendeur auprès duquel la commande a été passée et
                sont exclusivement destinées à la livraison et au suivi de la commande.
              </p>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition-colors"
          >
            J’ai compris et j’accepte
          </button>
        </div>
      </div>
    </div>
  );
};
