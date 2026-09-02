import { ShieldCheck, Stethoscope, AlertOctagon } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { UI_STRINGS } from '../data/translations';

interface SafetyDisclaimerProps {
  currentLang: SupportedLanguage;
}

export function SafetyDisclaimer({ currentLang }: SafetyDisclaimerProps) {
  const t = UI_STRINGS[currentLang];
  const isHindi = currentLang === 'hi';
  const isMarathi = currentLang === 'mr';

  return (
    <footer className="mt-8 pt-6 pb-12 border-t border-white/10 text-slate-400 text-xs space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start space-x-3.5 backdrop-blur-md">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
          <AlertOctagon className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="font-bold text-amber-300 font-mono tracking-wide uppercase text-xs">
            {isHindi
              ? 'सख्त चिकित्सा सुरक्षा नियम (Medical Safety Protocols)'
              : isMarathi
              ? 'वैद्यकीय सुरक्षा नियमावली'
              : 'Strict Veterinary Safety & Medical Protocol'}
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            {t.disclaimer}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2 text-center sm:text-left">
        <div>
          <span>SYS_ID: VM-AI-8832 | VERSION: 4.2.0-STABLE</span>
        </div>
        <div className="text-emerald-400 font-semibold">
          <span>Created by <strong className="text-white">Rajvardhan Vitthal Suryavanshi</strong></span>
        </div>
        <div className="flex items-center space-x-3">
          <span>EMERGENCY: 1962</span>
          <span>•</span>
          <span>FIELD TRIAGE READY</span>
        </div>
      </div>
    </footer>
  );
}
