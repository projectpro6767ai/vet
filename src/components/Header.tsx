import { useState, useEffect } from 'react';
import {
  PhoneCall,
  Scale,
  Mic,
  Store,
  Calendar,
  Award,
  Trophy,
  Cpu,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { IndiaTaluka, SupportedLanguage } from '../types';
import { UI_STRINGS } from '../data/translations';

interface HeaderProps {
  currentLang: SupportedLanguage;
  onLangChange: (lang: SupportedLanguage) => void;
  onOpenHelpline: () => void;
  onOpenOutbreak?: () => void;
  onOpenCalculator?: () => void;
  onOpenDialectVoice?: () => void;
  onOpenChemist?: () => void;
  onOpenEPashuhaat?: () => void;
  onOpenVaccination?: () => void;
  onOpenExhibitionPlaybook?: () => void;
  onOpenAiSettings?: () => void;
  onOpenTalukaSync?: () => void;
  activeTaluka?: IndiaTaluka | null;
  hasActiveDiagnosis?: boolean;
}

export function Header({
  currentLang,
  onLangChange,
  onOpenHelpline,
  onOpenOutbreak,
  onOpenCalculator,
  onOpenDialectVoice,
  onOpenChemist,
  onOpenEPashuhaat,
  onOpenVaccination,
  onOpenExhibitionPlaybook,
  onOpenAiSettings,
  onOpenTalukaSync,
  activeTaluka,
  hasActiveDiagnosis = false,
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

  return (
    <header className="sticky top-0 z-40 bg-[#0C0E0B]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      {/* Primary Top Bar: Brand, Language & 1962 Helpline */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6 min-w-max py-1">
          {/* Left: Logo & Identity */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/40 text-white font-extrabold text-lg sm:text-xl shrink-0">
              <span>V</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="font-black text-sm sm:text-xl tracking-tight text-white font-['Outfit'] whitespace-nowrap">
                  VET-MITRA <span className="text-emerald-400">AI</span>
                </h1>
                <span className="hidden lg:inline-flex px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full">
                  {t.ruralEngine}
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] text-slate-400 uppercase tracking-widest hidden sm:block truncate max-w-[200px] md:max-w-none">
                {t.headerSubtitle}
              </p>
            </div>
          </div>

          {/* Right: Language Selector & 1962 Helpline */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 pr-1">
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
                  title={t.headerSwitchLang}
                >
                  {lang === 'en' ? 'ENG' : lang === 'hi' ? 'HI' : 'MR'}
                </button>
              ))}
            </div>

            {/* 1962 Emergency Call Helpline Button (Hidden when diagnosis result is active) */}
            {!hasActiveDiagnosis && (
              <button
                type="button"
                onClick={onOpenHelpline}
                className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-red-950/80 hover:bg-red-900/90 border border-red-500/60 text-red-200 text-[10px] sm:text-xs font-bold transition shadow-[0_0_12px_rgba(239,68,68,0.3)] active:scale-95 cursor-pointer shrink-0"
                title={t.headerHelplineTitle}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <PhoneCall className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400 shrink-0" />
                <span className="font-mono tracking-wider text-red-100 font-extrabold text-[11px] sm:text-xs">1962</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Quick Action Feature Ribbon (Decoupled, never forces horizontal scroll on top bar) */}
      <div className="border-t border-white/5 bg-black/40 px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        <div className="max-w-7xl mx-auto flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar whitespace-nowrap">
          {/* 0. Groq AI Provider Status Button */}
          <button
            type="button"
            onClick={onOpenAiSettings}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/40 text-sky-300 text-[10px] sm:text-xs font-mono font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title="Groq AI Settings"
          >
            <Cpu className="w-3 h-3 text-sky-400 shrink-0" />
            <span>AI: Groq</span>
          </button>

          {/* 1. Talukas Option (349 Indian State Talukas Selector & Sync) */}
          <button
            type="button"
            onClick={onOpenTalukaSync}
            className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/50 text-emerald-200 text-[10px] sm:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title="View & Sync 349 Indian Talukas for Hyper-Local Health Alerts"
          >
            <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>
              {activeTaluka
                ? `Talukas: ${activeTaluka.taluka}, ${activeTaluka.stateCode}`
                : 'Talukas (349)'}
            </span>
            <ChevronDown className="w-3 h-3 text-emerald-400 shrink-0" />
          </button>

          {/* 3. Ayurvedic Feed & Remedy Calculator Trigger */}
          <button
            type="button"
            onClick={onOpenCalculator}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] sm:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title={t.headerRemedyTitle}
          >
            <Scale className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{t.remedy}</span>
          </button>

          {/* 4. Dialect Voice Assistant Trigger */}
          <button
            type="button"
            onClick={onOpenDialectVoice}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 text-[10px] sm:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title={t.headerVoiceTitle}
          >
            <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{t.voiceAssistant}</span>
          </button>

          {/* 5. Taluka Chemist & Herbal Store Finder */}
          <button
            type="button"
            onClick={onOpenChemist}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] sm:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title={t.headerChemistTitle}
          >
            <Store className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{t.chemist}</span>
          </button>

          {/* 6. Vaccination Calendar & Subsidies */}
          <button
            type="button"
            onClick={onOpenVaccination}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] sm:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title={t.headerVaccineTitle}
          >
            <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{t.vaccines}</span>
          </button>

          {/* 7. E-Pashuhaat Doorstep AI & Insurance */}
          <button
            type="button"
            onClick={onOpenEPashuhaat}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] sm:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title={t.headerEpashuhaatTitle}
          >
            <Award className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{t.epashuhaat}</span>
          </button>

          {/* 8. Exhibition Judges Demonstration Playbook (Trophy) */}
          <button
            type="button"
            onClick={onOpenExhibitionPlaybook}
            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 text-[10px] sm:text-xs font-extrabold transition shadow-sm active:scale-95 cursor-pointer"
            title={t.headerPlaybookTitle}
          >
            <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{t.playbook}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
