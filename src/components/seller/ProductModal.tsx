import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2, Sparkles, Tag, DollarSign, Layers } from 'lucide-react';
import { Product } from '../../types';
import { sellerApi } from '../../lib/api';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSaved: (product: Product) => void;
}

const CATEGORIES = [
  'Robes & Cérémonie',
  'Ensembles & Tailleurs',
  'Maroquinerie & Sacs',
  'Chaussures & Babouches',
  'Bijoux & Accessoires',
  'Cosmétique & Senteurs',
  'Tissus & Bazin',
  'Mode Homme',
  'Maison & Décoration',
  'Général',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaved,
}) => {
  const isEditing = !!product;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [liveCode, setLiveCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isAvailable, setIsAvailable] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setCompareAtPrice(product.compareAtPrice ? product.compareAtPrice.toString() : '');
      setStock(product.stock.toString());
      setLiveCode(product.liveCode || '');
      setImageUrl(product.imageUrl || '');
      setCategory(product.category || CATEGORIES[0]);
      setIsAvailable(product.isAvailable);
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setCompareAtPrice('');
      setStock('10');
      setLiveCode(`L0${Math.floor(1 + Math.random() * 9)}`);
      setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');
      setCategory(CATEGORIES[0]);
      setIsAvailable(true);
    }
    setErrorMessage(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Le nom de l’article est obligatoire.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Le prix en FCFA doit être supérieur à zéro.');
      return;
    }
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      setErrorMessage('La quantité en stock doit être positive.');
      return;
    }

    setIsLoading(true);
    try {
      const payload: Partial<Product> = {
        title: title.trim(),
        description: description.trim(),
        price: numPrice,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        stock: numStock,
        liveCode: liveCode.trim().toUpperCase(),
        imageUrl: imageUrl.trim(),
        category,
        isAvailable,
      };

      let resultProduct: Product;
      if (isEditing && product) {
        const res = await sellerApi.updateProduct(product.id, payload);
        resultProduct = res.product;
      } else {
        const res = await sellerApi.createProduct(payload);
        resultProduct = res.product;
      }

      onSaved(resultProduct);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de l’enregistrement de l’article.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              {isEditing ? 'Modifier l’Article' : 'Ajouter un Nouvel Article'}
            </h3>
            <p className="text-xs text-slate-500">
              Disponible instantanément dans votre boutique et vos Lives TikTok
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title & Live Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Titre de l’article *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Robe Bazin Getzner Doré"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Code Live TikTok *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pink-600" />
                <input
                  type="text"
                  value={liveCode}
                  onChange={(e) => setLiveCode(e.target.value.toUpperCase())}
                  placeholder="Ex: L01"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-pink-50/50 border border-pink-200 rounded-xl text-sm font-black text-pink-700 uppercase font-mono"
                />
              </div>
            </div>
          </div>

          {/* Prices & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Prix de vente (FCFA) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="25000"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Prix barré (Promo)
              </label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="30000"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Stock disponible *
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-teal-800 font-mono"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              URL de la Photo du Produit
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
            />
            {imageUrl && (
              <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={imageUrl}
                  alt="Aperçu"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                  onError={(e) => {
                    (e.target as any).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <span className="text-xs text-slate-500">Aperçu de la photo du produit</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Tailles disponibles
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails du tissu, coupe, couleurs, tailles (S, M, L, XL)..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          {/* Active switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider block">
                Statut de mise en vente
              </span>
              <span className="text-xs text-slate-500">Visible par les acheteurs sur votre boutique</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isEditing ? 'Mettre à jour' : 'Ajouter l’Article'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
