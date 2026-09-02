import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  PhoneCall,
  ShieldAlert,
  ShoppingBag,
  Share2,
  Copy,
  Check,
  Printer,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { VetDiagnosisResponse, SupportedLanguage } from '../types';
import { UI_STRINGS } from '../data/translations';
import { SpeechVoiceManager, buildCompleteTriageNarration } from '../utils/audio';

interface DiagnosisResultProps {
  diagnosis: VetDiagnosisResponse;
  currentLang: SupportedLanguage;
  onReset: () => void;
}

export function DiagnosisResult({
  diagnosis,
  currentLang,
  onReset,
}: DiagnosisResultProps) {
  const t = UI_STRINGS[currentLang];
  const [playingLang, setPlayingLang] = useState<'hi' | 'mr' | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Determine Urgency level styling
  const badgeStr = (diagnosis.urgency_badge || '').toUpperCase();
  const isRed =
    badgeStr.includes('RED') ||
    badgeStr.includes('🔴') ||
    diagnosis.is_emergency_dispatch_needed;
  const isYellow =
    !isRed && (badgeStr.includes('YELLOW') || badgeStr.includes('🟡'));
  const isGreen = !isRed && !isYellow;

  // Audio Playback - Speaks EVERYTHING (Animal, Urgency, First Aid Steps, What Not To Do, Medicine)
  const handlePlayVoice = (lang: 'hi' | 'mr') => {
    if (playingLang === lang) {
      SpeechVoiceManager.stop();
      setPlayingLang(null);
      return;
    }

    const textToSpeak = buildCompleteTriageNarration(diagnosis, lang);

    if (!textToSpeak) return;

    setPlayingLang(lang);
    SpeechVoiceManager.speakText(
      textToSpeak,
      lang,
      () => setPlayingLang(lang),
      () => setPlayingLang(null),
      () => setPlayingLang(null)
    );
  };

  useEffect(() => {
    return () => {
      SpeechVoiceManager.stop();
    };
  }, []);

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(diagnosis, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleShareReport = () => {
    const summary = `🚨 Vet-Mitra AI Triage Report 🚨\nAnimal: ${diagnosis.animal_identified}\nCondition: ${diagnosis.suspected_condition}\nUrgency: ${diagnosis.urgency_badge}\n\nFirst Aid:\n${diagnosis.first_aid_steps.join('\n')}\n\n⚠️ What NOT to do: ${diagnosis.what_not_to_do}\nRecommended Store Product: ${diagnosis.recommended_local_product}\n\nHelpline: 1962`;
    
    if (navigator.share) {
      navigator
        .share({
          title: `Vet-Mitra AI Report - ${diagnosis.suspected_condition}`,
          text: summary,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] border border-white/10 shadow-2xl overflow-hidden space-y-6 print:border-none print:shadow-none">
      {/* 1. Urgency Alert Header */}
      <div
        className={`p-6 sm:p-8 text-white relative overflow-hidden border-b ${
          isRed
            ? 'bg-gradient-to-r from-red-950/90 via-red-900/80 to-[#0C0E0B] border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
            : isYellow
            ? 'bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-[#0C0E0B] border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
            : 'bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-[#0C0E0B] border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-xs font-mono font-black tracking-wider uppercase border border-white/20">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRed
                    ? 'bg-red-500 animate-ping shadow-[0_0_8px_#ef4444]'
                    : isYellow
                    ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]'
                    : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                }`}
              ></span>
              <span className="text-white">{diagnosis.urgency_badge}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">
                {isRed
                  ? 'EMERGENCY DISPATCH RECOMMENDED'
                  : isYellow
                  ? 'MONITOR & HERBAL INTERVENTION'
                  : 'HOME CARE & MONITORING'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] text-white">
              {diagnosis.suspected_condition}
            </h2>

            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <span className="font-semibold text-slate-400">{t.identifiedAnimal}:</span>
              <span className="bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-lg font-bold text-white">
                {diagnosis.animal_identified}
              </span>
            </div>
          </div>

          {/* Quick Actions (Call 1962 if Red, or Print) */}
          <div className="flex items-center space-x-3">
            {diagnosis.is_emergency_dispatch_needed && (
              <a
                href="tel:1962"
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(239,68,68,0.5)] transition active:scale-95 animate-bounce"
              >
                <PhoneCall className="w-4 h-4" />
                <span className="font-mono tracking-wider">{t.callDoctor} (1962)</span>
              </a>
            )}
            <button
              onClick={onReset}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center space-x-2 border border-white/10 transition cursor-pointer"
              title={t.newAnalysis}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.newAnalysis}</span>
            </button>
          </div>
        </div>

        {/* Emergency Dispatch Box if Red */}
        {diagnosis.is_emergency_dispatch_needed && (
          <div className="mt-5 p-4 bg-red-950/60 rounded-2xl border border-red-500/50 text-white flex items-start space-x-3.5 text-xs sm:text-sm backdrop-blur-md">
            <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-200 tracking-wide uppercase font-mono">
                {t.emergencyDispatch}
              </div>
              <div className="text-slate-200 mt-1 leading-relaxed">
                {t.emergencyDispatchSub}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-8 space-y-7">
        {/* 2. Audio Voice Scripts (Hindi & Marathi Text-to-Speech) */}
        <div className="bg-black/30 rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <Volume2 className="w-4 h-4" />
              </div>
              <span>
                {currentLang === 'hi'
                  ? 'आवाज में पूरी सलाह सुनें (Full Voice Guidance)'
                  : currentLang === 'mr'
                  ? 'ऑडिओ संपूर्ण सल्ला ऐका (Full Voice Guidance)'
                  : 'Complete Audio Guidance & Spoken Advice'}
              </span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              {playingLang ? 'NOW SPEAKING...' : 'SPEECH SYNTHESIS'}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            {currentLang === 'hi'
              ? 'बटन दबाने पर यह पशु का रोग, डॉक्टर की स्थिति, सभी प्राथमिक उपचार के कदम, सावधानियां और दवा की जानकारी पूरी तरह बोलकर सुनाएगा।'
              : currentLang === 'mr'
              ? 'बटण दाबल्यावर हे जनावराचा आजार, डॉक्टरांची निकड, सर्व प्राथमिक उपचाराच्या पायऱ्या, काय करू नये व औषधांची माहिती संपूर्ण बोलून ऐकवेल.'
              : 'Clicking listen will sequentially read the entire diagnostic report: identified condition, urgency, all first aid steps, safety warnings, and recommended products.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Hindi Voice Script */}
            <div
              className={`p-4 rounded-2xl border transition ${
                playingLang === 'hi'
                  ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-bold text-xs text-orange-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]"></span>
                  <span>हिन्दी आवाज (Hindi Script)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handlePlayVoice('hi')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer ${
                    playingLang === 'hi'
                      ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {playingLang === 'hi' ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>रोकें (Stop)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t.listenHindi}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-['Tiro_Devanagari_Hindi']">
                "{diagnosis.local_voice_script_hindi}"
              </p>
            </div>

            {/* Marathi Voice Script */}
            <div
              className={`p-4 rounded-2xl border transition ${
                playingLang === 'mr'
                  ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-bold text-xs text-emerald-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
                  <span>मराठी आवाज (Marathi Script)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handlePlayVoice('mr')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer ${
                    playingLang === 'mr'
                      ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {playingLang === 'mr' ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>थांबवा (Stop)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t.listenMarathi}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-['Tiro_Devanagari_Hindi']">
                "{diagnosis.local_voice_script_marathi}"
              </p>
            </div>
          </div>
        </div>

        {/* 3. Actionable Low-Cost First Aid Steps */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>{t.firstAidTitle}</span>
            </h3>
            <span className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full font-mono">
              LOW-COST INDIGENOUS CARE
            </span>
          </div>

          <div className="space-y-3">
            {diagnosis.first_aid_steps.map((step, idx) => {
              const isChecked = completedSteps[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`flex items-start space-x-3.5 p-4 rounded-2xl border transition cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-500 line-through opacity-75'
                      : 'bg-white/5 border-white/10 hover:border-emerald-500/40 text-slate-200 shadow-sm'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_8px_#10b981]'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-sm font-medium leading-relaxed">
                    {step}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. What NOT to Do (Safety Warning Alert) */}
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2 text-amber-200">
          <div className="flex items-center space-x-2.5 font-bold text-sm sm:text-base text-amber-300">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="tracking-wide uppercase font-mono">{t.whatNotToDoTitle}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed pl-7">
            {diagnosis.what_not_to_do}
          </p>
        </div>

        {/* 5. Recommended Local Store Product Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-black/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                {t.localProductTitle}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                {diagnosis.recommended_local_product}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Available at local Dairy Co-op / Krishi Seva Kendra / Rural Chemist
              </div>
            </div>
          </div>
        </div>

        {/* 6. Action Footer: Share, Print, New Case */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleShareReport}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition cursor-pointer"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t.shareReport}</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>

          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Telemetry JSON Schema</span>
            {showRawJson ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* 7. Raw JSON Accordion (Output Verification) */}
        {showRawJson && (
          <div className="relative mt-3 rounded-2xl bg-black/80 text-emerald-400 p-5 font-mono text-xs overflow-x-auto border border-white/10 shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-slate-400">
              <span className="text-[11px] font-mono font-bold">
                Vet-Mitra AI Structured JSON Schema
              </span>
              <button
                onClick={handleCopyJson}
                className="flex items-center space-x-1.5 px-3 py-1 bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg text-xs"
              >
                {copiedJson ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(diagnosis, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
