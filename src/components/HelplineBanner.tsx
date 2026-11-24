import { Phone, HeartPulse, Info } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { UI_STRINGS } from '../data/translations';

interface HelplineBannerProps {
  currentLang: SupportedLanguage;
  onOpenHelpline?: () => void;
}

export function HelplineBanner({ currentLang, onOpenHelpline }: HelplineBannerProps) {
  const t = UI_STRINGS[currentLang];
  return (
    <div className="bg-gradient-to-r from-red-950/50 via-emerald-950/30 to-[#0C0E0B] backdrop-blur-md text-slate-200 border-y border-white/10 px-4 py-2.5 sm:py-3 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="w-8 h-8 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
            <HeartPulse className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-amber-300">
              {t.helplineBannerTitle}
            </span>{' '}
            <span className="text-slate-300">
              {t.helplineBannerDesc}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onOpenHelpline && (
            <button
              onClick={onOpenHelpline}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-full font-bold text-xs border border-white/10 flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-slate-300" />
              <span>
                {t.helplineBannerInfo}
              </span>
            </button>
          )}
          <a
            href="tel:1962"
            className="inline-flex items-center space-x-2 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full font-extrabold shadow-[0_0_15_rgba(220,38,38,0.4)] transition active:scale-95 text-xs whitespace-nowrap cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="font-mono tracking-wider">
              {t.helplineBannerCall}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
