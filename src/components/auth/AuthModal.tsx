import React, { useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Store,
  Mail,
  Lock,
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../lib/api';
import { LegalModal } from './LegalModal';
import { validateSlug } from '../../lib/reservedTerms';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+221');
  const [regPhoneLocal, setRegPhoneLocal] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Forgot / Reset password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);

  if (!isOpen) return null;

  // Password strength calculations
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const pwdScore = calculatePasswordStrength(regPassword);

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Demo fill helper
  const handleFillDemo = () => {
    resetMessages();
    setMode('login');
    setLoginEmail('marieme@dakarstyle.sn');
    setLoginPassword('Password123!');
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!loginEmail || !loginPassword) {
      setErrorMessage('Veuillez renseigner votre e-mail et votre mot de passe.');
      return;
    }

    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      setSuccessMessage('Connexion réussie ! Bienvenue sur votre espace.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Identifiants invalides. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!regFullName.trim()) {
      setErrorMessage('Veuillez renseigner votre nom complet.');
      return;
    }
    if (!regStoreName.trim()) {
      setErrorMessage('Veuillez renseigner le nom de votre boutique.');
      return;
    }
    const slugPreview = regStoreName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/^-+|-+$/g, '');
    const slugValidation = validateSlug(slugPreview);
    if (!slugValidation.isValid) {
      setErrorMessage(slugValidation.error || 'Ce nom de boutique est réservé ou interdit.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Veuillez renseigner une adresse e-mail valide.');
      return;
    }
    if (!regPhoneLocal.trim()) {
      setErrorMessage('Veuillez renseigner votre numéro de téléphone.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }
    if (!/[A-Z]/.test(regPassword)) {
      setErrorMessage('Le mot de passe doit comporter au moins une lettre majuscule.');
      return;
    }
    if (!/[0-9]/.test(regPassword)) {
      setErrorMessage('Le mot de passe doit comporter au moins un chiffre.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setErrorMessage('Les deux mots de passe ne sont pas identiques.');
      return;
    }
    if (!termsAccepted || !privacyAccepted) {
      setErrorMessage('Veuillez accepter les Conditions Générales et la Politique de Confidentialité.');
      return;
    }

    const fullPhone = `${regCountryCode}${regPhoneLocal.replace(/^0+/, '').replace(/\s+/g, '')}`;

    setIsLoading(true);
    try {
      await register({
        fullName: regFullName,
        storeName: regStoreName,
        email: regEmail,
        phone: fullPhone,
        password: regPassword,
        passwordConfirmation: regPasswordConfirm,
        termsAccepted,
        privacyAccepted,
      });

      setSuccessMessage('Boutique créée avec succès ! Redirection vers votre tableau de bord...');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la création de la boutique.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!forgotEmail) {
      setErrorMessage('Veuillez saisir votre adresse e-mail.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(forgotEmail);
      setSuccessMessage(res.message);
      if (res.demoResetToken) {
        setResetToken(res.demoResetToken);
        // Switch to reset mode with token pre-filled for smooth testing
        setTimeout(() => {
          setMode('reset');
          setSuccessMessage('Lien de réinitialisation généré ! Définissez maintenant votre nouveau mot de passe.');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la demande de réinitialisation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!resetToken || !newPassword || !newPasswordConfirm) {
      setErrorMessage('Veuillez renseigner tous les champs.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setErrorMessage('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.resetPassword({
        token: resetToken,
        newPassword,
        newPasswordConfirmation: newPasswordConfirm,
      });
      setSuccessMessage(res.message);
      setTimeout(() => {
        setMode('login');
        setLoginEmail(forgotEmail);
        setLoginPassword('');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
          {/* Header banner */}
          <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white text-center">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Plateforme E-Commerce Live TikTok • Sénégal
            </div>

            <h2 className="text-2xl font-black tracking-tight font-serif">LiveJaay</h2>
            <p className="text-sm text-slate-300 mt-1">« Du live TikTok à la commande payée »</p>

            {/* Switch tabs */}
            {(mode === 'login' || mode === 'register') && (
              <div className="mt-5 grid grid-cols-2 p-1 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    resetMessages();
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-md font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    resetMessages();
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    mode === 'register'
                      ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Créer ma boutique
                </button>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
            {/* Feedback messages */}
            {errorMessage && (
              <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-teal-600" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            {/* Quick Demo Access Bar */}
            <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Test immédiat : <strong>Marième Ndiaye (Dakar Chic)</strong></span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-600 font-semibold rounded-lg border border-slate-200 shadow-xs transition-colors"
              >
                Remplir en 1 clic
              </button>
            </div>

            {/* ================= MODE: LOGIN ================= */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="votre-email@boutique.sn"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setForgotEmail(loginEmail);
                        resetMessages();
                      }}
                      className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Se connecter à ma boutique</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500 pt-2">
                  Pas encore de boutique LiveJaay ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      resetMessages();
                    }}
                    className="font-bold text-teal-600 hover:underline"
                  >
                    Créer mon compte vendeur
                  </button>
                </p>
              </form>
            )}

            {/* ================= MODE: REGISTER ================= */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom complet du vendeur *
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Ex: Aïda Diop"
                      required
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom de votre boutique TikTok *
                  </label>
                  <div className="relative">
                    <Store className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={regStoreName}
                      onChange={(e) => setRegStoreName(e.target.value)}
                      placeholder="Ex: Aïda Mode Dakar"
                      required
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                  {regStoreName && (() => {
                    const slugPreview = regStoreName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/^-+|-+$/g, '');
                    const check = validateSlug(slugPreview);
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
                        <span>Lien disponible : livejaay.com/boutique/{slugPreview}</span>
                      </p>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Adresse e-mail *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="contact@boutique.sn"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Téléphone (WhatsApp) *
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <select
                        value={regCountryCode}
                        onChange={(e) => setRegCountryCode(e.target.value)}
                        className="bg-slate-100 text-xs font-bold text-slate-700 px-2 py-2.5 border-r border-slate-200 focus:outline-none"
                      >
                        <option value="+221">🇸🇳 +221</option>
                        <option value="+225">🇨🇮 +225</option>
                        <option value="+223">🇲🇱 +223</option>
                        <option value="+224">🇬🇳 +224</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input
                        type="tel"
                        value={regPhoneLocal}
                        onChange={(e) => setRegPhoneLocal(e.target.value)}
                        placeholder="77 123 45 67"
                        required
                        className="w-full px-3 py-2.5 text-slate-900 text-sm bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 8 car. + maj + chif"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Confirmer mot de passe *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        placeholder="Répétez mot de passe"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Password strength indicators */}
                {regPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1.5 h-1.5">
                      <div className={`flex-1 rounded-full ${pwdScore >= 1 ? 'bg-red-500' : 'bg-slate-200'}`} />
                      <div className={`flex-1 rounded-full ${pwdScore >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                      <div className={`flex-1 rounded-full ${pwdScore >= 3 ? 'bg-teal-500' : 'bg-slate-200'}`} />
                      <div className={`flex-1 rounded-full ${pwdScore >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Exigences : au moins 8 caractères, une majuscule et un chiffre.
                    </p>
                  </div>
                )}

                {/* Terms and Privacy Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                      required
                    />
                    <span>
                      J’accepte les{' '}
                      <button
                        type="button"
                        onClick={() => setLegalModalType('terms')}
                        className="text-teal-600 font-semibold hover:underline"
                      >
                        Conditions Générales d’Utilisation
                      </button>{' '}
                      de LiveJaay.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                      required
                    />
                    <span>
                      J’accepte la{' '}
                      <button
                        type="button"
                        onClick={() => setLegalModalType('privacy')}
                        className="text-teal-600 font-semibold hover:underline"
                      >
                        Politique de Confidentialité
                      </button>{' '}
                      et la protection de mes données.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-slate-950 font-extrabold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                      <span>Création de votre boutique...</span>
                    </>
                  ) : (
                    <>
                      <span>Créer mon compte</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500 pt-1">
                  Vous possédez déjà une boutique ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      resetMessages();
                    }}
                    className="font-bold text-slate-900 hover:underline"
                  >
                    Se connecter
                  </button>
                </p>
              </form>
            )}

            {/* ================= MODE: FORGOT PASSWORD ================= */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="text-center pb-2">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-2">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Récupération de compte</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Saisissez l'adresse e-mail associée à votre boutique LiveJaay. Nous vous transmettrons un lien sécurisé pour définir un nouveau mot de passe.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="marieme@dakarstyle.sn"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                  ) : (
                    <span>Envoyer le lien de réinitialisation</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      resetMessages();
                    }}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    ← Retour à la connexion
                  </button>
                </div>
              </form>
            )}

            {/* ================= MODE: RESET PASSWORD ================= */}
            {mode === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="text-center pb-2">
                  <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl mx-auto flex items-center justify-center mb-2">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Nouveau mot de passe</h3>
                  <p className="text-xs text-slate-500">
                    Définissez un nouveau mot de passe robuste pour sécuriser votre boutique.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nouveau mot de passe *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 caractères"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirmer le nouveau mot de passe *
                  </label>
                  <input
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  ) : (
                    <span>Valider mon nouveau mot de passe</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Terms & Privacy modals */}
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
    </>
  );
};
