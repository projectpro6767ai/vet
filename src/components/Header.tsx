import { useState, useEffect } from 'react';
import {
  PhoneCall,
  History,
  User as UserIcon,
  LogIn,
  LogOut,
  Zap,
  Radio,
  Scale,
  Mic,
  Store,
  Calendar,
  Award,
  Trophy,
} from 'lucide-react';
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
  onOpenEdgeAi?: () => void;
  onOpenOutbreak?: () => void;
  onOpenCalculator?: () => void;
  onOpenDialectVoice?: () => void;
  onOpenChemist?: () => void;
  onOpenEPashuhaat?: () => void;
  onOpenVaccination?: () => void;
  onOpenExhibitionPlaybook?: () => void;
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
  onOpenEdgeAi,
  onOpenOutbreak,
  onOpenCalculator,
  onOpenDialectVoice,
  onOpenChemist,
  onOpenEPashuhaat,
  onOpenVaccination,
  onOpenExhibitionPlaybook,
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
    <header className="sticky top-0 z-40 bg-[#0C0E0B]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      {/* Primary Top Bar: Brand, Language, Email ID / User Profile, 1962 & History */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          {/* Left: Logo & Identity */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 flex-shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/40 text-white font-extrabold text-lg sm:text-xl shrink-0">
              <span>V</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-base sm:text-xl tracking-tight text-white font-['Outfit'] whitespace-nowrap">
                  VET-MITRA <span className="text-emerald-400">AI</span>
                </h1>
                <span className="hidden lg:inline-flex px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full">
                  {t.ruralEngine || 'Rural LLM Engine'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-widest hidden sm:block truncate max-w-[280px] md:max-w-none">
                {t.headerSubtitle || 'Livestock Diagnostic Assistant • 24x7 AI Triage'}
              </p>
            </div>
          </div>

          {/* Right: Language Selector, Email ID Profile / Login, 1962, and History (ALWAYS VISIBLE) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-white/5 rounded-full p-0.5 sm:p-1 border border-white/10 shrink-0 shadow-inner">
              {(['en', 'hi', 'mr'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onLangChange(lang)}
                  className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                    currentLang === lang
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={lang === 'en' ? 'Switch to English' : lang === 'hi' ? 'हिंदी में बदलें' : 'मराठीत बदला'}
                >
                  {lang === 'en' ? 'ENG' : lang === 'hi' ? 'HI' : 'MR'}
                </button>
              ))}
            </div>

            {/* Email ID Logo / User Account Option (NEVER DISAPPEARS) */}
            {currentUser ? (
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/60 text-emerald-200 text-[10px] sm:text-xs font-bold transition shadow-[0_0_12px_rgba(16,185,129,0.25)] active:scale-95 cursor-pointer shrink-0"
                  title={`Logged in as ${currentUser.email || userDisplayName}`}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={userDisplayName}
                      className="w-5 h-5 rounded-full object-cover border border-emerald-400 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-extrabold text-[10px] shrink-0 shadow-sm">
                      {(currentUser.email || userDisplayName).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="inline-block max-w-[70px] sm:max-w-[120px] md:max-w-[160px] truncate text-slate-100 font-medium text-[11px] sm:text-xs">
                    {currentUser.email ? currentUser.email.split('@')[0] : userDisplayName}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onSignOut || onOpenAuth}
                  className="p-1 sm:p-1.5 rounded-full bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer shrink-0"
                  title="Sign Out / Log Out"
                >
                  <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/80 text-white text-[10px] sm:text-xs font-bold transition shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer shrink-0"
                title="Sign in with Email ID / Google Account"
              >
                <UserIcon className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="inline-block text-[11px] sm:text-xs font-semibold">
                  {currentLang === 'hi' ? 'लॉगिन' : currentLang === 'mr' ? 'लॉगिन' : 'Email ID / Sign In'}
                </span>
              </button>
            )}

            {/* 1962 Emergency Call Helpline Button */}
            <button
              type="button"
              onClick={onOpenHelpline}
              className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-red-950/80 hover:bg-red-900/90 border border-red-500/60 text-red-200 text-[10px] sm:text-xs font-bold transition shadow-[0_0_12px_rgba(239,68,68,0.3)] active:scale-95 cursor-pointer shrink-0"
              title="24x7 National Veterinary Helpline: 1962"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <PhoneCall className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400 shrink-0" />
              <span className="font-mono tracking-wider text-red-100 font-extrabold text-[11px] sm:text-xs">1962</span>
            </button>

            {/* History Button */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="relative p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer shrink-0"
              title={t.historyTitle || 'Past Triage History'}
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[9px] sm:text-[10px] font-black w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_#10b981]">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Quick Action Feature Ribbon (Decoupled, never forces horizontal scroll on top bar) */}
      <div className="border-t border-white/5 bg-black/40 px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        <div className="max-w-7xl mx-auto flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar whitespace-nowrap">
          {/* 1. Offline Edge AI Inspector Trigger */}
          <button
            type="button"
            onClick={onOpenEdgeAi}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-mono font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title="Offline-First Edge AI Engine (TFLite/ONNX - 0% Internet)"
          >
            <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{currentLang === 'hi' ? 'एज एआई' : currentLang === 'mr' ? 'एज एआय' : 'Edge AI'}</span>
            <span className="text-[9px] bg-emerald-500/20 px-1 rounded text-emerald-300">TFLite</span>
          </button>

          {/* 2. Outbreak Geofence Radar Trigger */}
          <button
            type="button"
            onClick={onOpenOutbreak}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title="Taluka Disease Outbreak & Geofencing Radar"
          >
            <Radio className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
            <span>{currentLang === 'hi' ? 'बीमारी अलर्ट' : currentLang === 'mr' ? 'रोग अलर्ट' : 'Outbreak'}</span>
          </button>

          {/* 3. Ayurvedic Feed & Remedy Calculator Trigger */}
          <button
            type="button"
            onClick={onOpenCalculator}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] sm:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title="Smart Feed & Ethno-Veterinary Medicine Calculator"
          >
            <Scale className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{currentLang === 'hi' ? 'उपचार' : currentLang === 'mr' ? 'उपचार' : 'Remedy'}</span>
          </button>

          {/* 4. Dialect Voice Assistant Trigger */}
          <button
            type="button"
            onClick={onOpenDialectVoice}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 text-[10px] sm:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title="Regional Marathi Dialect Voice Assistant (बोला आणि विचारा)"
          >
            <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{currentLang === 'hi' ? 'आवाज सहायक' : currentLang === 'mr' ? 'आवाज सहायक' : 'Voice Assistant'}</span>
          </button>

          {/* 5. Taluka Chemist & Herbal Store Finder */}
          <button
            type="button"
            onClick={onOpenChemist}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] sm:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title="Taluka Chemist & Herbal Store Finder (औषध भांडार)"
          >
            <Store className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{currentLang === 'mr' ? 'औषध दुकान' : currentLang === 'hi' ? 'दवा दुकान' : 'Chemist'}</span>
          </button>

          {/* 6. Vaccination Calendar & Subsidies */}
          <button
            type="button"
            onClick={onOpenVaccination}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] sm:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title="Government Vaccination Calendar & Subsidies (लसीकरण)"
          >
            <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{t.vaccines || 'Vaccines'}</span>
          </button>

          {/* 7. E-Pashuhaat Doorstep AI & Insurance */}
          <button
            type="button"
            onClick={onOpenEPashuhaat}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] sm:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title="E-Pashuhaat AI Technicians & Livestock Insurance"
          >
            <Award className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{t.epashuhaat || 'E-Pashuhaat'}</span>
          </button>

          {/* 8. Exhibition Judges Demonstration Playbook (Trophy) */}
          <button
            type="button"
            onClick={onOpenExhibitionPlaybook}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 text-[10px] sm:text-xs font-extrabold transition shadow-sm active:scale-95 cursor-pointer"
            title="Live Exhibition Setup & Judges Demonstration Playbook"
          >
            <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{t.playbook || 'Playbook'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
