import { Sparkles, AlertTriangle, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { PresetSymptomCase, SupportedLanguage } from '../types';
import { PRESET_CASES } from '../data/presets';
import { UI_STRINGS } from '../data/translations';

interface PresetCasesGridProps {
  currentLang: SupportedLanguage;
  onSelectCase: (caseItem: PresetSymptomCase) => void;
}

export function PresetCasesGrid({
  currentLang,
  onSelectCase,
}: PresetCasesGridProps) {
  const t = UI_STRINGS[currentLang];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>{t.testPresetsTitle}</span>
        </h3>
        <span className="text-xs font-mono text-slate-400">
          {currentLang === 'hi'
            ? '6 प्रमुख ग्रामीण रोग नमूने'
            : currentLang === 'mr'
            ? '६ प्रमुख आजार नमुने'
            : '6 field case templates'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {PRESET_CASES.map((item) => {
          const isRed = item.expectedUrgency === '🔴 RED';
          const isYellow = item.expectedUrgency === '🟡 YELLOW';
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectCase(item)}
              className="flex flex-col text-left p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 transition duration-200 group cursor-pointer relative shadow-xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {item.animalType}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    isRed
                      ? 'bg-red-950/80 text-red-300 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                      : isYellow
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {item.expectedUrgency}
                </span>
              </div>

              <div className="font-extrabold text-sm sm:text-base text-slate-100 group-hover:text-emerald-300 transition line-clamp-1">
                {item.title[currentLang]}
              </div>

              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {item.description[currentLang]}
              </p>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>
                  {currentLang === 'hi'
                    ? 'सैंपल लोड करें'
                    : currentLang === 'mr'
                    ? 'नमुना तपासा'
                    : 'Load Preset Case'}
                </span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition text-emerald-400" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
