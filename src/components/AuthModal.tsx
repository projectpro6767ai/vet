import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Lock,
  Mail,
  Building,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage, AppUser } from '../types';
import {
  signInWithGooglePopup,
  signUpWithEmailPass,
  signInWithEmailPass,
  signOutFirebase,
} from '../lib/firebase';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  signInWithGoogle,
} from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  currentLang: SupportedLanguage;
  onAuthSuccess?: (user: AppUser) => void;
  onSignOut?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  currentLang,
  onAuthSuccess,
  onSignOut,
}: AuthModalProps) {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [role, setRole] = useState<'farmer' | 'dairy_owner' | 'vet_officer' | 'paravet'>('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isHindi = currentLang === 'hi';
  const isMarathi = currentLang === 'mr';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setFarmName('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(
        isHindi
          ? 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें।'
          : isMarathi
          ? 'कृपया ईमेल आणि पासवर्ड दोन्ही टाका.'
          : 'Please enter both email and password.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    // Try Firebase first
    const fbRes = await signInWithEmailPass(email.trim(), password);
    if (fbRes.user) {
      setLoading(false);
      setSuccessMsg(
        isHindi
          ? 'सफलतापूर्वक लॉग इन किया गया!'
          : isMarathi
          ? 'यशस्वीरित्या लॉग इन केले!'
          : 'Successfully signed in!'
      );
      const mappedUser: AppUser = {
        id: fbRes.user.uid,
        email: fbRes.user.email,
        displayName: fbRes.user.displayName,
        photoURL: fbRes.user.photoURL,
        user_metadata: {
          fullName: fbRes.user.displayName || email.split('@')[0],
          role,
        },
      };
      if (onAuthSuccess) onAuthSuccess(mappedUser);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
      return;
    }

    // Fallback to Supabase
    const res = await signInWithEmail(email.trim(), password);
    setLoading(false);

    if (res.error) {
      setError(fbRes.error || res.error);
    } else if (res.user) {
      setSuccessMsg(
        isHindi
          ? 'सफलतापूर्वक लॉग इन किया गया!'
          : isMarathi
          ? 'यशस्वीरित्या लॉग इन केले!'
          : 'Successfully signed in!'
      );
      const mappedUser: AppUser = {
        id: res.user.id,
        email: res.user.email,
        displayName: res.user.user_metadata?.fullName || res.user.email?.split('@')[0],
        user_metadata: res.user.user_metadata,
      };
      if (onAuthSuccess) onAuthSuccess(mappedUser);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(
        isHindi
          ? 'कृपया ईमेल और पासवर्ड दर्ज करें।'
          : isMarathi
          ? 'कृपया ईमेल आणि पासवर्ड प्रविष्ट करा.'
          : 'Please provide email and password.'
      );
      return;
    }

    if (password.length < 6) {
      setError(
        isHindi
          ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'
          : isMarathi
          ? 'पासवर्ड किमान ६ वर्णांचा असावा.'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        isHindi
          ? 'पासवर्ड मेल नहीं खा रहे हैं।'
          : isMarathi
          ? 'पासवर्ड जुळत नाहीत.'
          : 'Passwords do not match.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    // Try Firebase signup
    const fbRes = await signUpWithEmailPass(email.trim(), password, fullName.trim() || 'Dairy Farmer');
    if (fbRes.user) {
      setLoading(false);
      setSuccessMsg(
        isHindi
          ? 'खाता सफलतापूर्वक बनाया गया! आप अब लॉग इन हैं।'
          : isMarathi
          ? 'खाते यशस्वीरित्या तयार केले! तुम्ही आता लॉग इन आहात.'
          : 'Account created successfully! You are now logged in.'
      );
      const mappedUser: AppUser = {
        id: fbRes.user.uid,
        email: fbRes.user.email,
        displayName: fbRes.user.displayName || fullName.trim(),
        user_metadata: {
          fullName: fullName.trim() || 'Dairy Farmer',
          farmName: farmName.trim() || 'Rural Livestock Farm',
          role,
        },
      };
      if (onAuthSuccess) onAuthSuccess(mappedUser);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1200);
      return;
    }

    const res = await signUpWithEmail(email.trim(), password, {
      fullName: fullName.trim() || 'Dairy Farmer',
      farmName: farmName.trim() || 'Rural Livestock Farm',
      role,
    });
    setLoading(false);

    if (res.error) {
      setError(fbRes.error || res.error);
    } else if (res.user) {
      setSuccessMsg(
        isHindi
          ? 'खाता सफलतापूर्वक बनाया गया! आप अब लॉग इन हैं।'
          : isMarathi
          ? 'खाते यशस्वीरित्या तयार केले! तुम्ही आता लॉग इन आहात.'
          : 'Account created successfully! You are now logged in.'
      );
      const mappedUser: AppUser = {
        id: res.user.id,
        email: res.user.email,
        displayName: res.user.user_metadata?.fullName,
        user_metadata: res.user.user_metadata,
      };
      if (onAuthSuccess) onAuthSuccess(mappedUser);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1200);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    // 1. Try Firebase Google Popup OAuth
    const fbResult = await signInWithGooglePopup();
    if (fbResult.user) {
      setLoading(false);
      setSuccessMsg(
        isHindi
          ? `नमस्ते, ${fbResult.user.displayName || 'किसान मित्र'}! गूगल से लॉग इन हो गए।`
          : isMarathi
          ? `नमस्कार, ${fbResult.user.displayName || 'शेतकरी मित्र'}! गुगलवरून लॉग इन झाले.`
          : `Welcome, ${fbResult.user.displayName || 'Member'}! Signed in with Google.`
      );
      const mappedUser: AppUser = {
        id: fbResult.user.uid,
        email: fbResult.user.email,
        displayName: fbResult.user.displayName,
        photoURL: fbResult.user.photoURL,
        user_metadata: {
          fullName: fbResult.user.displayName || '',
          role: 'farmer',
        },
      };
      if (onAuthSuccess) onAuthSuccess(mappedUser);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
      return;
    }

    // 2. Fallback to Supabase OAuth
    const res = await signInWithGoogle();
    setLoading(false);
    if (res.error && fbResult.error) {
      setError(fbResult.error || res.error);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOutFirebase();
    const res = await signOutUser();
    if (onSignOut) onSignOut();
    setLoading(false);
    setSuccessMsg(
      isHindi
        ? 'सफलतापूर्वक लॉग आउट किया गया।'
        : isMarathi
        ? 'यशस्वीरित्या लॉग आउट केले.'
        : 'Successfully signed out.'
    );
    setTimeout(() => {
      onClose();
      resetForm();
    }, 800);
  };

  const userMeta = currentUser?.user_metadata || {};
  const displayName = userMeta.fullName || currentUser?.email?.split('@')[0] || 'Member';
  const displayFarm = userMeta.farmName || 'Rural Livestock Unit';
  const displayRole = userMeta.role || 'Livestock Farmer';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0C0E0B] rounded-3xl w-full max-w-md shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {currentUser ? <ShieldCheck className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white font-['Outfit']">
                {currentUser
                  ? isHindi
                    ? 'उपयोगकर्ता प्रोफाइल (User Account)'
                    : isMarathi
                    ? 'वापरकर्ता खाते (User Account)'
                    : 'User Profile & Account'
                  : mode === 'signin'
                  ? isHindi
                    ? 'लॉग इन करें (Sign In)'
                    : isMarathi
                    ? 'लॉग इन करा (Sign In)'
                    : 'Sign In / Log In'
                  : isHindi
                  ? 'नया खाता बनाएं (Sign Up)'
                  : isMarathi
                  ? 'नवीन खाते तयार करा (Sign Up)'
                  : 'Create New Account'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {currentUser
                  ? currentUser.email
                  : isHindi
                  ? 'पशु चिकित्सा रिपोर्ट सिंक व सुरक्षित डेटा'
                  : isMarathi
                  ? 'पशु वैद्यकीय अहवाल सिंक व सुरक्षित डेटा'
                  : 'Supabase Cloud Authentication'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[75vh] space-y-4">
          {/* Alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start space-x-2.5 shadow-lg">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start space-x-2.5 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* If already signed in: Display User Card and Sign Out */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center space-x-3.5">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={displayName}
                      className="w-12 h-12 rounded-2xl object-cover border border-emerald-400/50 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-white text-base">{displayName}</h4>
                    <p className="text-xs text-emerald-400 font-mono">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                      {displayRole.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-500 block text-[10px]">FARM / UNIT</span>
                    <span className="text-slate-200 font-bold truncate block">{displayFarm}</span>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-500 block text-[10px]">STATUS</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 text-xs text-slate-300">
                <p className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isHindi ? 'क्लाउड बैकअप सक्रिय' : isMarathi ? 'क्लाउड बॅकअप सक्रिय' : 'Cloud Sync Active'}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isHindi
                    ? 'आपकी सभी प्राथमिक पशु रिपोर्टें आपके सुपबेस खाते में सुरक्षित रूप से सिंक हो रही हैं।'
                    : isMarathi
                    ? 'तुमचे सर्व पशुवैद्यकीय अहवाल सुरक्षितपणे सुपबेस खात्यात सेव्ह केले जात आहेत.'
                    : 'All your livestock diagnostic logs and triage records are securely persisted to your cloud database.'}
                </p>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>
                  {loading
                    ? isHindi
                      ? 'लॉग आउट हो रहा है...'
                      : isMarathi
                      ? 'लॉग आउट होत आहे...'
                      : 'Signing out...'
                    : isHindi
                    ? 'लॉग आउट करें (Sign Out)'
                    : isMarathi
                    ? 'लॉग आउट करा (Sign Out)'
                    : 'Sign Out / Log Out'}
                </span>
              </button>
            </div>
          ) : (
            /* Authentication Form (Sign In / Sign Up) */
            <div className="space-y-4">
              {/* Continue with Google Action */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm tracking-wide transition shadow-lg active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-3 border border-slate-200"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {isHindi
                      ? 'गूगल से जारी रखें (Continue with Google)'
                      : isMarathi
                      ? 'गुगलसह सुरू ठेवा (Continue with Google)'
                      : 'Continue with Google'}
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center space-x-3 my-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  {isHindi ? 'या ईमेल से' : isMarathi ? 'किंवा ईमेलने' : 'Or with email'}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Tab Switcher */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'लॉग इन' : isMarathi ? 'लॉग इन' : 'Sign In'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'नया खाता' : isMarathi ? 'नवीन खाते' : 'Sign Up'}</span>
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}
                className="space-y-3.5"
              >
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                        {isHindi ? 'पूरा नाम' : isMarathi ? 'पूर्ण नाव' : 'Full Name'}
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={isHindi ? 'उदा. रमेश पाटिल' : isMarathi ? 'उदा. रमेश पाटील' : 'e.g. Rajesh Kumar'}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                        {isHindi ? 'डेयरी / फार्म का नाम' : isMarathi ? 'डेअरी / फार्मचे नाव' : 'Dairy Farm / Unit Name'}
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={farmName}
                          onChange={(e) => setFarmName(e.target.value)}
                          placeholder={isHindi ? 'उदा. जय किसान डेयरी फार्म' : isMarathi ? 'उदा. जय किसान डेअरी फार्म' : 'e.g. Krishna Dairy Farm'}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                        {isHindi ? 'भूमिका (Role)' : isMarathi ? 'भूमिका (Role)' : 'Role / Occupation'}
                      </label>
                      <select
                        value={role}
                        onChange={(e: any) => setRole(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                      >
                        <option value="farmer">Livestock Farmer / Dairy Owner (पशुपालक / डेयरी किसान)</option>
                        <option value="paravet">Para-Veterinary Assistant / AI Technician (पशु मित्र / कृत्रिम गर्भाधान कार्यकर्ता)</option>
                        <option value="vet_officer">Veterinary Doctor / Officer (पशु चिकित्सक)</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                    {isHindi ? 'ईमेल पता' : isMarathi ? 'ईमेल पत्ता' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="farmer@dairy.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                    {isHindi ? 'पासवर्ड' : isMarathi ? 'पासवर्ड' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                      {isHindi ? 'पासवर्ड की पुष्टि करें' : isMarathi ? 'पासवर्डची पुष्टी करा' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm tracking-wide transition shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>
                    {loading
                      ? isHindi
                        ? 'प्रक्रिया जारी है...'
                        : isMarathi
                        ? 'प्रक्रिया सुरू आहे...'
                        : 'Processing...'
                      : mode === 'signin'
                      ? isHindi
                        ? 'लॉग इन करें (Sign In)'
                        : isMarathi
                        ? 'लॉग इन करा (Sign In)'
                        : 'Sign In'
                      : isHindi
                      ? 'खाता बनाएं (Sign Up)'
                      : isMarathi
                      ? 'खाते तयार करा (Sign Up)'
                      : 'Create Account'}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
