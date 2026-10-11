import React, { useState, useEffect } from 'react';
import { X, Download, Copy, CheckCircle2, Share2, Sparkles, Loader2 } from 'lucide-react';
import { sellerApi } from '../../lib/api';
import { Store } from '../../types';

interface StoreQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
}

export const StoreQRModal: React.FC<StoreQRModalProps> = ({ isOpen, onClose, store }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      sellerApi
        .getStoreQR()
        .then((res) => {
          setQrUrl(res.qrCodeDataUrl);
          setPublicUrl(res.publicUrl);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen || !store) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `LiveJaay-QRCode-${store.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden text-center">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Spécial Live TikTok
          </div>
          <h3 className="font-extrabold text-xl">Code QR de Votre Boutique</h3>
          <p className="text-xs text-slate-300 mt-1">
            À montrer à la caméra ou à afficher sur un second écran pendant votre direct !
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-xs text-slate-500 font-medium">Génération du QR Code haute résolution...</p>
            </div>
          ) : qrUrl ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner mx-auto">
              <img
                src={qrUrl}
                alt={`Code QR ${store.name}`}
                className="w-56 h-56 mx-auto rounded-xl shadow-xs"
              />
              <p className="text-xs font-mono font-bold text-slate-600 mt-2 truncate max-w-[220px]">
                {store.slug}.livejaay.com
              </p>
            </div>
          ) : (
            <p className="text-sm text-red-500">Erreur de génération du code QR.</p>
          )}

          {/* Quick link */}
          <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs font-mono text-slate-700">
            <span className="truncate pr-2">{publicUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-white rounded-lg text-slate-900 transition-colors shrink-0"
              title="Copier le lien"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownload}
              disabled={!qrUrl}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger l'image</span>
            </button>

            <button
              onClick={handleCopy}
              className="py-3 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Lien copié !' : 'Partager le lien'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
