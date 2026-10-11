import React, { useState } from 'react';
import {
  Sparkles,
  Store,
  User,
  LogOut,
  ShoppingBag,
  PackageSearch,
  Radio,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: 'dashboard' | 'public-store' | 'tracking' | 'landing';
  onNavigate: (view: 'dashboard' | 'public-store' | 'tracking' | 'landing') => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
}) => {
  const { user, store, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    onNavigate('landing');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('landing')}
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center font-black text-teal-400 text-lg shadow-md group-hover:scale-105 transition-transform">
              LJ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight font-serif">
                  LiveJaay
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  🇸🇳 Sénégal
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                « Du live TikTok à la commande payée »
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Présentation
            </button>

            <button
              onClick={() => onNavigate('public-store')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'public-store'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-teal-600" />
              <span>Boutique TikTok (Acheteur)</span>
            </button>

            <button
              onClick={() => onNavigate('tracking')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'tracking'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PackageSearch className="w-3.5 h-3.5 text-indigo-600" />
              <span>Suivre une Commande</span>
            </button>
          </nav>

          {/* User actions / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                    currentView === 'dashboard'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-teal-50 text-teal-900 hover:bg-teal-100'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-teal-500" />
                  <span>Mon Espace Vendeur</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-slate-700 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Créer ma boutique
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drop menu */}
      {mobileMenuOpen && (
        <div className="md:hidden p-4 bg-white border-b border-slate-200 space-y-2 animate-fade-in">
          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-slate-800 rounded-lg hover:bg-slate-50"
          >
            Présentation LiveJaay
          </button>
          <button
            onClick={() => {
              onNavigate('public-store');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-slate-800 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <Store className="w-4 h-4 text-teal-600" />
            <span>Boutique TikTok (Acheteur)</span>
          </button>
          <button
            onClick={() => {
              onNavigate('tracking');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-slate-800 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <PackageSearch className="w-4 h-4 text-indigo-600" />
            <span>Suivre une Commande</span>
          </button>

          <div className="pt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-teal-500 text-slate-950 text-xs font-black rounded-xl text-center"
                >
                  Mon Espace Vendeur
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-red-600 text-xs font-bold text-center"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-slate-100 text-slate-900 text-xs font-bold rounded-xl text-center"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-slate-900 text-white text-xs font-black rounded-xl text-center"
                >
                  Créer ma boutique
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
