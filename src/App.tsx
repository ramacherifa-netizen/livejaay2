import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { PublicStoreView } from './components/public/PublicStoreView';
import { OrderTrackingView } from './components/public/OrderTrackingView';
import { AuthModal } from './components/auth/AuthModal';

function AppContent() {
  const { user, store, isAuthenticated, loading } = useAuth();

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'public-store' | 'tracking'>('landing');
  const [storeSlug, setStoreSlug] = useState<string>('dakar-chic');

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Handle URL paths on mount and popstate (e.g., /boutique/nomdelaboutique)
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      if (path.startsWith('/boutique/')) {
        const slug = path.replace('/boutique/', '').trim();
        if (slug) {
          setStoreSlug(slug);
          setCurrentView('public-store');
          return;
        }
      } else if (path === '/suivi' || path.startsWith('/commande/')) {
        setCurrentView('tracking');
        return;
      } else if (path === '/vendeur' || path === '/dashboard') {
        setCurrentView('dashboard');
        return;
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  // Update slug when user has a store
  useEffect(() => {
    if (store && store.slug) {
      setStoreSlug(store.slug);
    }
  }, [store]);

  const handleNavigate = (view: 'landing' | 'dashboard' | 'public-store' | 'tracking') => {
    if (view === 'dashboard' && !isAuthenticated) {
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      return;
    }

    setCurrentView(view);
    if (view === 'public-store') {
      const targetSlug = store?.slug || 'dakar-chic';
      setStoreSlug(targetSlug);
      window.history.pushState({}, '', `/boutique/${targetSlug}`);
    } else if (view === 'tracking') {
      window.history.pushState({}, '', '/suivi');
    } else if (view === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-black text-lg animate-pulse">
            LJ
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
            Chargement de LiveJaay...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onExplorePublicStore={() => handleNavigate('public-store')}
            onGoToDashboard={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'dashboard' && isAuthenticated && (
          <SellerDashboard
            onPreviewPublicStore={() => handleNavigate('public-store')}
          />
        )}

        {currentView === 'public-store' && (
          <PublicStoreView
            storeSlug={storeSlug}
            onBackToApp={() => handleNavigate('landing')}
          />
        )}

        {currentView === 'tracking' && <OrderTrackingView />}
      </main>

      <Footer />

      {/* Auth Modal for Login / Register / Password Reset */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
        onSuccess={() => {
          setAuthModalOpen(false);
          handleNavigate('dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
