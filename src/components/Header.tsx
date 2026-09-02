import { useState, useEffect } from 'react';
import { PhoneCall, History, User as UserIcon, LogIn, LogOut } from 'lucide-react';
import { SupportedLanguage, AppUser } from '../types';
import { UI_STRINGS } from '../data/translations';

interface HeaderProps {
  currentLang: SupportedLanguage;
  onLangChange: (lang: SupportedLanguage) => void;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenHelpline: () => void;
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  onSignOut?: () => void;
}

export function Header({
  currentLang,
  onLangChange,
  historyCount,
  onOpenHistory,
  onOpenHelpline,
  currentUser,
  onOpenAuth,
  onSignOut,
}: HeaderProps) {
  const t = UI_STRINGS[currentLang];
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const userDisplayName =
    currentUser?.user_metadata?.fullName ||
    currentUser?.email?.split('@')[0] ||
    'Farmer';

  return (
    <header className="sticky top-0 z-40 bg-[#0C0E0B]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/40 text-white font-extrabold text-xl">
              <span>V</span>
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-white font-['Outfit']">
                  VET-MITRA <span className="text-emerald-400">AI</span>
                </h1>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full">
                  Rural LLM Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest hidden md:block">
                Livestock Diagnostic Assistant • 24x7 AI Triage
              </p>
            </div>
          </div>

          {/* Telemetry & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Connection & Offline Capability Status Indicator */}
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-mono backdrop-blur-md ${
                isOnline
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
              }`}
              title={
                isOnline
                  ? 'Connected to Network • Live AI Triage & Supabase Sync Ready'
                  : 'Offline Mode • Local Presets & Cached Triage Active'
              }
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isOnline
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]'
                    : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                }`}
              />
              <span>
                {isOnline ? (
                  currentLang === 'hi'
                    ? 'ऑनलाइन • लाइव AI'
                    : currentLang === 'mr'
                    ? 'ऑनलाइन • थेट AI'
                    : 'Online • Live'
                ) : (
                  currentLang === 'hi'
                    ? 'ऑफ़लाइन मोड'
                    : currentLang === 'mr'
                    ? 'ऑफलाइन मोड'
                    : 'Offline'
                )}
              </span>
            </div>

            {/* User Auth (Sign In / Sign Out / Profile) */}
            {currentUser ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold transition shadow-[0_0_12px_rgba(16,185,129,0.2)] active:scale-95 cursor-pointer"
                  title={`Logged in as ${currentUser.email}`}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={userDisplayName}
                      className="w-5 h-5 rounded-full object-cover border border-emerald-400/60"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-extrabold text-[10px]">
                      {userDisplayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {userDisplayName}
                  </span>
                </button>
                <button
                  onClick={onSignOut || onOpenAuth}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer flex items-center space-x-1"
                  title="Sign Out / Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">
                    {currentLang === 'hi'
                      ? 'लॉग आउट'
                      : currentLang === 'mr'
                      ? 'लॉग आउट'
                      : 'Log Out'}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-400 text-white text-xs font-bold transition shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>
                  {currentLang === 'hi'
                    ? 'साइन इन / लॉग इन'
                    : currentLang === 'mr'
                    ? 'साइन इन / लॉग इन'
                    : 'Sign In / Log In'}
                </span>
              </button>
            )}

            {/* 1962 Emergency Call Badge */}
            <button
              onClick={onOpenHelpline}
              className="flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-red-950/80 hover:bg-red-900/90 border border-red-500/50 text-red-200 text-xs font-bold transition shadow-[0_0_12px_rgba(239,68,68,0.3)] active:scale-95 cursor-pointer"
              title="24x7 National Veterinary Helpline"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span className="font-mono tracking-wider text-red-100 font-extrabold">1962</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10">
              <button
                onClick={() => onLangChange('hi')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  currentLang === 'hi'
                    ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => onLangChange('mr')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  currentLang === 'mr'
                    ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                मराठी
              </button>
              <button
                onClick={() => onLangChange('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  currentLang === 'en'
                    ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* History Button */}
            <button
              onClick={onOpenHistory}
              className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
              title={t.historyTitle}
            >
              <History className="w-4 h-4" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_#10b981]">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
