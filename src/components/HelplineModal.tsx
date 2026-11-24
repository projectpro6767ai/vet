import { X, Phone, ShieldAlert, HeartPulse, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { UI_STRINGS } from '../data/translations';

interface HelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
}

export function HelplineModal({
  isOpen,
  onClose,
  currentLang,
}: HelplineModalProps) {
  if (!isOpen) return null;
  const t = UI_STRINGS[currentLang];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0C0E0B] rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950 via-red-900 to-black text-white flex items-center justify-between border-b border-red-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg font-['Outfit'] text-white">
                {t.emergencyService}
              </h3>
              <p className="text-xs text-red-200/80">
                {t.emergencyServiceSub}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-red-300 hover:text-white bg-white/5 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-200 text-sm">
          {/* Primary Toll Free Callout */}
          <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                {t.nationalTollFree}
              </div>
              <div className="text-3xl font-black text-white mt-0.5 tracking-wider font-mono">
                1962
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {t.mvuSubtitle}
              </div>
            </div>
            <a
              href="tel:1962"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95 transition whitespace-nowrap cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>{t.callNow1962}</span>
            </a>
          </div>

          {/* Guidelines on what to tell the doctor */}
          <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/10">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>
                {t.infoToProvide}
              </span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {t.animalInfo}
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {t.symptomInfo}
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {t.feedInfo}
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {t.herdInfo}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-bold transition border border-white/10 cursor-pointer"
          >
            {t.closeEmergency}
          </button>
        </div>
      </div>
    </div>
  );
}
