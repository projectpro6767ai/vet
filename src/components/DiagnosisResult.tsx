import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  PhoneCall,
  ShieldAlert,
  ShoppingBag,
  Copy,
  Check,
  Printer,
  Download,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  QrCode,
  Scale,
  Store,
  Navigation,
  Award,
  Calendar,
} from 'lucide-react';
import { VetDiagnosisResponse, SupportedLanguage } from '../types';
import { UI_STRINGS } from '../data/translations';
import { SpeechVoiceManager } from '../utils/audio';
import { downloadClinicalReportPdf } from '../utils/pdfExport';

interface DiagnosisResultProps {
  diagnosis: VetDiagnosisResponse;
  currentLang: SupportedLanguage;
  onReset: () => void;
  onOpenPdfReport?: () => void;
  onOpenRemedyCalculator?: () => void;
  onOpenIvrRelay?: () => void;
  onOpenChemist?: () => void;
  onOpenEPashuhaat?: () => void;
  onOpenVaccination?: () => void;
  onOpenTrackHospital?: () => void;
}

export function DiagnosisResult({
  diagnosis,
  currentLang,
  onReset,
  onOpenPdfReport,
  onOpenRemedyCalculator,
  onOpenIvrRelay,
  onOpenChemist,
  onOpenEPashuhaat,
  onOpenVaccination,
  onOpenTrackHospital,
}: DiagnosisResultProps) {
  const t = UI_STRINGS[currentLang];
  const [activeVoiceLang, setActiveVoiceLang] = useState<'mr' | 'hi' | 'en' | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // Determine Urgency level styling
  const badgeStr = (diagnosis.urgency_badge || '').toUpperCase();
  const isRed =
    badgeStr.includes('RED') ||
    badgeStr.includes('🔴') ||
    diagnosis.is_emergency_dispatch_needed;
  const isYellow =
    !isRed && (badgeStr.includes('YELLOW') || badgeStr.includes('🟡'));

  // Audio Playback handler supporting Marathi, Hindi, and English
  const handlePlayVoice = (targetLang: 'mr' | 'hi' | 'en') => {
    if (activeVoiceLang === targetLang) {
      SpeechVoiceManager.stop();
      setActiveVoiceLang(null);
      return;
    }

    SpeechVoiceManager.stop();

    let textToSpeak = '';
    if (targetLang === 'mr') {
      textToSpeak =
        diagnosis.local_voice_script_marathi ||
        `सावधान! ${diagnosis.animal_identified || 'प्राणी'} मध्ये ${diagnosis.suspected_condition} चे लक्षण आढळले आहे. तातडीने प्रथमोपचार करा आणि १९६२ वर संपर्क करा.`;
    } else if (targetLang === 'hi') {
      textToSpeak =
        diagnosis.local_voice_script_hindi ||
        `सावधान! ${diagnosis.animal_identified || 'पशु'} में ${diagnosis.suspected_condition} के लक्षण पाए गए हैं। तुरंत प्राथमिक उपचार करें और 1962 पर संपर्क करें।`;
    } else {
      textToSpeak =
        diagnosis.local_voice_script_english ||
        `Alert! Suspected condition in ${diagnosis.animal_identified || 'animal'}: ${diagnosis.suspected_condition}. Please follow first-aid instructions.`;
    }

    setActiveVoiceLang(targetLang);
    SpeechVoiceManager.speakText(
      textToSpeak,
      targetLang,
      () => setActiveVoiceLang(targetLang),
      () => setActiveVoiceLang(null),
      () => setActiveVoiceLang(null)
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

  // Dedicated Print action
  const handlePrint = () => {
    window.print();
  };

  // Dedicated Save as PDF action
  const handleSavePdf = () => {
    downloadClinicalReportPdf(diagnosis, {
      currentLang,
      animalType: diagnosis.animal_identified,
    });
    setPdfDownloaded(true);
    setTimeout(() => setPdfDownloaded(false), 3000);
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
                  ? t.emergencyDispatchTitle
                  : isYellow
                  ? t.moderateInterventionTitle
                  : t.homeCareTitle}
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

          {/* Quick Actions (Call 1962 if Red, Print, Save as PDF, QR Docket, New Analysis) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {diagnosis.is_emergency_dispatch_needed && (
              <>
                <a
                  href="tel:1962"
                  className="inline-flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(239,68,68,0.5)] transition active:scale-95 animate-bounce"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span className="font-mono tracking-wider">{t.callDoctor} (1962)</span>
                </a>

                {onOpenTrackHospital && (
                  <button
                    onClick={onOpenTrackHospital}
                    className="inline-flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-red-600/90 hover:bg-red-500 border border-white/20 text-white font-black text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] transition active:scale-95 cursor-pointer"
                    title={currentLang === 'mr' ? 'जवळचे पशुवैद्यकीय रुग्णालय शोधा' : currentLang === 'hi' ? 'निकटतम पशु चिकित्सालय खोजें' : 'Track Nearest Veterinary Hospital'}
                  >
                    <Navigation className="w-4 h-4" />
                    <span>
                      {currentLang === 'mr' ? 'रुग्णालय' : currentLang === 'hi' ? 'अस्पताल' : 'Hospital'}
                    </span>
                  </button>
                )}
              </>
            )}

            {/* 1. Working Save as PDF Button */}
            <button
              onClick={handleSavePdf}
              className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs flex items-center space-x-1.5 border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition cursor-pointer active:scale-95"
              title="Download structured clinical report PDF"
            >
              {pdfDownloaded ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>{t.pdfDownloaded || 'Saved!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-black" />
                  <span>{t.savePdf || 'Save as PDF'}</span>
                </>
              )}
            </button>

            {/* 2. Working Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-100 font-bold text-xs flex items-center space-x-1.5 border border-white/10 transition cursor-pointer active:scale-95"
              title="Open browser print preview"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>{t.print || 'Print'}</span>
            </button>

            {/* 3. Official Doctor QR Docket Modal */}
            {onOpenPdfReport && (
              <button
                onClick={onOpenPdfReport}
                className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center space-x-1.5 border border-white/10 transition cursor-pointer active:scale-95"
                title="Generate Official Clinical Paperwork with Doctor QR Code"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{t.doctorQrDocket || 'Doctor QR Docket'}</span>
              </button>
            )}

            {/* 4. New Analysis Reset */}
            <button
              onClick={onReset}
              className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center space-x-1.5 border border-white/10 transition cursor-pointer"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <Volume2 className="w-4 h-4" />
              </div>
              <span>
                {t.audioGuidanceTitle}
              </span>
            </h3>

            <div className="flex items-center space-x-2">
              {onOpenIvrRelay && (
                <button
                  type="button"
                  onClick={onOpenIvrRelay}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
                  title="Deliver audio report to basic keypad phone"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {t.keypadIvrRelay || 'Keypad Phone IVR Relay'}
                  </span>
                </button>
              )}

              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full hidden sm:inline">
                {activeVoiceLang === 'mr'
                  ? 'मराठीत वाचन सुरू आहे...'
                  : activeVoiceLang === 'hi'
                  ? 'हिंदी में वाचन शुरू है...'
                  : activeVoiceLang === 'en'
                  ? 'NOW PLAYING ENGLISH AUDIO...'
                  : (currentLang === 'mr' ? 'ध्वनी वाचन उपलब्ध' : currentLang === 'hi' ? 'ध्वनि वाचन उपलब्ध' : 'AUDIO AVAILABLE')}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            {currentLang === 'hi'
              ? 'नीचे दिए गए बटन पर क्लिक करके सीधे मराठी, हिंदी या अंग्रेजी में सटीक ऑडियो सलाह सुनें।'
              : currentLang === 'mr'
              ? 'खालील बटणावर क्लिक करून थेट मराठी, हिंदी किंवा इंग्रजीत अचूक ऑडिओ सल्ला ऐका.'
              : 'Click on the buttons below to listen to clear voice advice in Marathi, Hindi, or English.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. Marathi Voice Card */}
            <div
              className={`p-4 rounded-2xl border transition ${
                activeVoiceLang === 'mr'
                  ? 'bg-emerald-950/70 border-emerald-400 ring-2 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-white/5 border-white/10 hover:border-emerald-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-bold text-xs text-emerald-400 flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${activeVoiceLang === 'mr' ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`}></span>
                  <span>ऑडिओ (मराठी)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handlePlayVoice('mr')}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer ${
                    activeVoiceLang === 'mr'
                      ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {activeVoiceLang === 'mr' ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>थांबवा (Stop)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>मराठीत ऐका</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{diagnosis.local_voice_script_marathi || `सावधान! ${diagnosis.animal_identified || 'प्राणी'} मध्ये ${diagnosis.suspected_condition} चे लक्षण आढळले आहे. तातडीने प्रथमोपचार करा आणि १९६२ वर संपर्क करा.`}"
              </p>
            </div>

            {/* 2. Hindi Voice Card */}
            <div
              className={`p-4 rounded-2xl border transition ${
                activeVoiceLang === 'hi'
                  ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : 'bg-white/5 border-white/10 hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-bold text-xs text-amber-300 flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${activeVoiceLang === 'hi' ? 'bg-red-400 animate-ping' : 'bg-amber-400'}`}></span>
                  <span>ऑडियो (हिन्दी)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handlePlayVoice('hi')}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer ${
                    activeVoiceLang === 'hi'
                      ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  }`}
                >
                  {activeVoiceLang === 'hi' ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>रोकें (Stop)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>हिंदी में सुनें</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{diagnosis.local_voice_script_hindi || `सावधान! ${diagnosis.animal_identified || 'पशु'} में ${diagnosis.suspected_condition} के लक्षण पाए गए हैं। तुरंत प्राथमिक उपचार करें और 1962 पर संपर्क करें।`}"
              </p>
            </div>

            {/* 3. English Voice Card */}
            <div
              className={`p-4 rounded-2xl border transition ${
                activeVoiceLang === 'en'
                  ? 'bg-sky-950/70 border-sky-400 ring-2 ring-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                  : 'bg-white/5 border-white/10 hover:border-sky-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-bold text-xs text-sky-300 flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${activeVoiceLang === 'en' ? 'bg-red-400 animate-ping' : 'bg-sky-400'}`}></span>
                  <span>Audio (English)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handlePlayVoice('en')}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer ${
                    activeVoiceLang === 'en'
                      ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
                      : 'bg-sky-700 hover:bg-sky-600 text-white shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                  }`}
                >
                  {activeVoiceLang === 'en' ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen in English</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{diagnosis.local_voice_script_english || `Alert! In ${diagnosis.animal_identified || 'animal'}, suspected condition is ${diagnosis.suspected_condition}. Follow veterinary guidance.`}"
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
              {t.lowCostCareLabel}
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
                {t.availableAtLabel}
              </div>
            </div>
          </div>

          {onOpenChemist && (
            <button
              onClick={onOpenChemist}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center space-x-2 transition cursor-pointer self-start sm:self-auto shrink-0 active:scale-95"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {t.findNearbyChemist || 'Find Nearby Chemist'}
              </span>
            </button>
          )}
        </div>

        {/* 6. Action Footer: Save PDF, Print, Doctor QR Docket, Remedy, Pashuhaat, Vaccine (NO 1962 Track) */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-2.5">
            {/* Save as PDF Button */}
            <button
              onClick={handleSavePdf}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-[11px] sm:text-xs transition cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
              title="Download Clinical Report PDF"
            >
              {pdfDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>{t.pdfDownloaded || 'PDF Saved'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-black" />
                  <span>{t.savePdf || 'Save as PDF'}</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-100 hover:text-white border border-white/10 text-[11px] sm:text-xs font-bold transition cursor-pointer whitespace-nowrap active:scale-95"
              title="Print Clinical Docket"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.print || 'Print'}</span>
            </button>

            {/* Doctor QR Docket */}
            {onOpenPdfReport && (
              <button
                onClick={onOpenPdfReport}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-[11px] sm:text-xs font-bold transition cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.doctorQrDocket || 'Doctor QR Docket'}</span>
              </button>
            )}

            {/* Remedy Calculator */}
            {onOpenRemedyCalculator && (
              <button
                onClick={onOpenRemedyCalculator}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-[11px] sm:text-xs font-bold transition cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.remedyCalculator || 'Remedy'}</span>
              </button>
            )}

            {/* E-Pashuhaat */}
            {onOpenEPashuhaat && (
              <button
                onClick={onOpenEPashuhaat}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-[11px] sm:text-xs font-bold transition cursor-pointer active:scale-95 whitespace-nowrap"
                title="E-Pashuhaat AI Technicians & Insurance"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.epashuhaat || 'Pashuhaat'}</span>
              </button>
            )}

            {/* Vaccination */}
            {onOpenVaccination && (
              <button
                onClick={onOpenVaccination}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-[11px] sm:text-xs font-bold transition cursor-pointer active:scale-95 whitespace-nowrap"
                title="Vaccination Calendar & Subsidies"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.vaccines || 'Vaccines'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="text-[10px] sm:text-xs font-mono text-slate-500 hover:text-slate-300 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>{t.telemetryJson || 'Telemetry JSON'}</span>
            {showRawJson ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* 7. Raw JSON Accordion (Output Verification) */}
        {showRawJson && (
          <div className="relative mt-3 rounded-2xl bg-black/80 text-emerald-400 p-5 font-mono text-xs overflow-x-auto border border-white/10 shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-slate-400">
              <span className="text-[11px] font-mono font-bold">
                {currentLang === 'mr'
                  ? 'वेट-मित्र एआय स्ट्रक्चर्ड डेटा'
                  : currentLang === 'hi'
                  ? 'वेट-मित्र एआई संरचित डेटा'
                  : 'Vet-Mitra AI Structured JSON Schema'}
              </span>
              <button
                onClick={handleCopyJson}
                className="flex items-center space-x-1.5 px-3 py-1 bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg text-xs cursor-pointer"
              >
                {copiedJson ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{t.copied || 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t.copyJson || 'Copy JSON'}</span>
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
