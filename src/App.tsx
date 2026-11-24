/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  AlertTriangle,
  Stethoscope,
  Info,
  RotateCcw,
  CheckCircle2,
  BellRing,
  MapPin,
} from 'lucide-react';
import {
  VetDiagnosisResponse,
  SupportedLanguage,
  PresetSymptomCase,
  IndiaTaluka,
} from './types';
import { UI_STRINGS } from './data/translations';
import { Header } from './components/Header';
import { HelplineBanner } from './components/HelplineBanner';
import { AnimalSelector } from './components/AnimalSelector';
import { SymptomInput } from './components/SymptomInput';
import { DiagnosisResult } from './components/DiagnosisResult';
import { PresetCasesGrid } from './components/PresetCasesGrid';
import { HelplineModal } from './components/HelplineModal';
import { SafetyDisclaimer } from './components/SafetyDisclaimer';
import { EdgeAiModal } from './components/EdgeAiModal';
import { MvuDispatchModal } from './components/MvuDispatchModal';
import { DialectVoiceModal } from './components/DialectVoiceModal';
import { OutbreakMapModal } from './components/OutbreakMapModal';
import { RemedyCalculatorModal } from './components/RemedyCalculatorModal';
import { PdfExportModal } from './components/PdfExportModal';
import { VisualBodyMapModal } from './components/VisualBodyMapModal';
import { FodderMoldScannerModal } from './components/FodderMoldScannerModal';
import { ChemistFinderModal } from './components/ChemistFinderModal';
import { EPashuhaatModal } from './components/EPashuhaatModal';
import { VaccinationTrackerModal } from './components/VaccinationTrackerModal';
import { NearestHospitalModal } from './components/NearestHospitalModal';
import { ExhibitionPlaybookModal } from './components/ExhibitionPlaybookModal';
import { AiSettingsModal } from './components/AiSettingsModal';
import { TalukaSyncModal } from './components/TalukaSyncModal';
import { runOfflineEdgeInference } from './utils/edgeInference';

export default function App() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [selectedAnimal, setSelectedAnimal] = useState<string>('Cow');
  const [symptomsText, setSymptomsText] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<VetDiagnosisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals state
  const [isHelplineOpen, setIsHelplineOpen] = useState<boolean>(false);
  const [isEdgeAiOpen, setIsEdgeAiOpen] = useState<boolean>(false);
  const [isMvuOpen, setIsMvuOpen] = useState<boolean>(false);
  const [isDialectVoiceOpen, setIsDialectVoiceOpen] = useState<boolean>(false);
  const [isOutbreakOpen, setIsOutbreakOpen] = useState<boolean>(false);
  const [isRemedyOpen, setIsRemedyOpen] = useState<boolean>(false);
  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(false);
  const [isBodyMapOpen, setIsBodyMapOpen] = useState<boolean>(false);
  const [isFodderOpen, setIsFodderOpen] = useState<boolean>(false);
  const [isChemistOpen, setIsChemistOpen] = useState<boolean>(false);
  const [isEPashuhaatOpen, setIsEPashuhaatOpen] = useState<boolean>(false);
  const [isVaccinationOpen, setIsVaccinationOpen] = useState<boolean>(false);
  const [isTrackHospitalOpen, setIsTrackHospitalOpen] = useState<boolean>(false);
  const [isExhibitionPlaybookOpen, setIsExhibitionPlaybookOpen] = useState<boolean>(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState<boolean>(false);
  const [isTalukaSyncOpen, setIsTalukaSyncOpen] = useState<boolean>(false);
  const [activeTaluka, setActiveTaluka] = useState<IndiaTaluka | null>(() => {
    try {
      const saved = localStorage.getItem('vet_mitra_active_taluka');
      return saved ? (JSON.parse(saved) as IndiaTaluka) : null;
    } catch {
      return null;
    }
  });

  const t = UI_STRINGS[currentLang];

  const handleSelectTaluka = (taluka: IndiaTaluka) => {
    setActiveTaluka(taluka);
    try {
      localStorage.setItem('vet_mitra_active_taluka', JSON.stringify(taluka));
    } catch {}
  };

  // Perform AI Diagnosis (Supports Live Server & On-Device Offline TFLite Edge Inference)
  const handleAnalyze = async (overrideAnimal?: string, overrideSymptoms?: string) => {
    const animalToUse =
      typeof overrideAnimal === 'string' && overrideAnimal.trim().length > 0
        ? overrideAnimal
        : selectedAnimal;
    const symptomsToUse =
      typeof overrideSymptoms === 'string' ? overrideSymptoms : symptomsText;

    if (!symptomsToUse && !imagePreview && !audioBase64) {
      setErrorMsg(t.pleaseEnterSymptoms);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // 1. Instant On-Device Edge AI Check if completely offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('⚡ Offline detected: Running on-device TFLite/ONNX Edge AI inference...');
      try {
        const edgeRes = runOfflineEdgeInference(animalToUse, symptomsToUse, imagePreview, currentLang);
        setDiagnosis(edgeRes.diagnosis);
        window.scrollTo({ top: 120, behavior: 'smooth' });
        return;
      } catch (edgeErr) {
        console.error('Edge inference error:', edgeErr);
      } finally {
        setIsLoading(false);
      }
    }

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animalType: animalToUse,
          symptomsText: symptomsToUse,
          imageBase64: imagePreview,
          imageMimeType,
          audioBase64,
          audioMimeType,
          language: currentLang,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `${t.serverError}: ${response.status}`);
      }

      const data: VetDiagnosisResponse = await response.json();
      setDiagnosis(data);

      // Scroll to diagnosis result
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (err: any) {
      const errReason = err?.message || String(err || 'Unknown error');
      console.error('Network diagnosis failed, attempting On-Device Edge fallback:', errReason);
      // Seamless On-Device Edge AI Fallback for rural Taluka zones
      try {
        const edgeRes = runOfflineEdgeInference(animalToUse, symptomsToUse, imagePreview, currentLang);
        setDiagnosis(edgeRes.diagnosis);
        window.scrollTo({ top: 120, behavior: 'smooth' });
        return;
      } catch (edgeErr) {
        console.error('Fallback edge failed:', edgeErr);
      }

      let displayMsg = '';
      const rawMsg = String(err?.message || '');

      if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
        displayMsg = 'AI Service is experiencing temporary high demand. Please try once more.';
      } else if (rawMsg.startsWith('{') || rawMsg.includes('"error"')) {
        displayMsg = 'Temporary service error occurred. Please try again.';
      } else {
        displayMsg = err.message || 'Failed to complete triage. Please try again.';
      }

      setErrorMsg(displayMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Select Preset Case
  const handleSelectPreset = (preset: PresetSymptomCase) => {
    const animal = preset.animalType[currentLang] || preset.animalType.en;
    const symptoms = preset.sampleSymptoms;
    setSelectedAnimal(animal);
    setSymptomsText(symptoms);
    setImagePreview(null);
    setAudioBase64(null);
    setDiagnosis(null);
    setErrorMsg(null);

    // Smooth scroll to input
    window.scrollTo({ top: 180, behavior: 'smooth' });

    // Automatically trigger analysis
    setTimeout(() => {
      handleAnalyze(animal, symptoms);
    }, 200);
  };

  // Reset form for fresh case
  const handleResetForm = () => {
    setDiagnosis(null);
    setSymptomsText('');
    setImagePreview(null);
    setAudioBase64(null);
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0C0E0B] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      {/* Immersive Ambient Glow Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 z-0"
        style={{
          background:
            'radial-gradient(circle at 80% 15%, #166534 0%, transparent 45%), radial-gradient(circle at 15% 85%, #991b1b 0%, transparent 45%), radial-gradient(circle at 50% 50%, #064e3b 0%, transparent 60%)',
          filter: 'blur(90px)',
        }}
      />

      {/* 1. Header Navigation */}
      <Header
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        onOpenHelpline={() => setIsHelplineOpen(true)}
        onOpenOutbreak={() => setIsOutbreakOpen(true)}
        onOpenCalculator={() => setIsRemedyOpen(true)}
        onOpenDialectVoice={() => setIsDialectVoiceOpen(true)}
        onOpenChemist={() => setIsChemistOpen(true)}
        onOpenEPashuhaat={() => setIsEPashuhaatOpen(true)}
        onOpenVaccination={() => setIsVaccinationOpen(true)}
        onOpenExhibitionPlaybook={() => setIsExhibitionPlaybookOpen(true)}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        onOpenTalukaSync={() => setIsTalukaSyncOpen(true)}
        activeTaluka={activeTaluka}
        hasActiveDiagnosis={diagnosis !== null}
      />

      {/* 2. Emergency 1962 Helpline Banner */}
      <HelplineBanner
        currentLang={currentLang}
        onOpenHelpline={() => setIsHelplineOpen(true)}
      />

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        {/* Selected Taluka Hyper-Local Health Alert Banner */}
        {activeTaluka && (
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm backdrop-blur-md shadow-lg ${
              activeTaluka.alertLevel === 'ALERT'
                ? 'bg-red-950/40 border-red-500/40 text-red-100'
                : activeTaluka.alertLevel === 'ADVISORY'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-100'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
            }`}
          >
            <div className="flex items-start space-x-3">
              <BellRing className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-extrabold flex items-center flex-wrap gap-2">
                  <span className="inline-flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {activeTaluka.taluka}, {activeTaluka.district} ({activeTaluka.state})
                    </span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-black/40 border border-white/10">
                    {activeTaluka.alertLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-200">
                  {currentLang === 'hi'
                    ? activeTaluka.healthAlertHi
                    : currentLang === 'mr'
                    ? activeTaluka.healthAlertMr
                    : activeTaluka.healthAlert}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsTalukaSyncOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition shrink-0 cursor-pointer self-start sm:self-center"
            >
              Change Taluka
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-start space-x-3 text-sm shadow-xl backdrop-blur-md animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-red-300">Notice: </span>
              {errorMsg}
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400 font-bold hover:text-red-200 text-xs px-2 py-1 bg-red-900/50 rounded-lg"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Display: Diagnosis Results or Input Form */}
        <AnimatePresence mode="wait">
          {diagnosis ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <DiagnosisResult
                diagnosis={diagnosis}
                currentLang={currentLang}
                onReset={handleResetForm}
                onOpenPdfReport={() => setIsPdfOpen(true)}
                onOpenRemedyCalculator={() => setIsRemedyOpen(true)}
                onOpenChemist={() => setIsChemistOpen(true)}
                onOpenEPashuhaat={() => setIsEPashuhaatOpen(true)}
                onOpenVaccination={() => setIsVaccinationOpen(true)}
                onOpenTrackHospital={() => setIsTrackHospitalOpen(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* 1. Animal Selection */}
              <div className="bg-white/5 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] border border-white/10 p-5 sm:p-7 pb-6 sm:pb-8 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm sm:text-base font-bold text-slate-100 flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 text-xs flex items-center justify-center font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      1
                    </span>
                    <span className="tracking-tight">{t.selectAnimal}</span>
                  </label>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full shadow-inner">
                    {selectedAnimal}
                  </span>
                </div>

                <AnimalSelector
                  selectedAnimal={selectedAnimal}
                  onSelect={setSelectedAnimal}
                  currentLang={currentLang}
                />
              </div>

              {/* 2 & 3. Multimodal Input (Photo, Voice, Text Symptoms) */}
              <SymptomInput
                currentLang={currentLang}
                selectedAnimal={selectedAnimal}
                onSelectAnimal={setSelectedAnimal}
                symptomsText={symptomsText}
                setSymptomsText={setSymptomsText}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                imageMimeType={imageMimeType}
                setImageMimeType={setImageMimeType}
                audioBase64={audioBase64}
                setAudioBase64={setAudioBase64}
                audioMimeType={audioMimeType}
                setAudioMimeType={setAudioMimeType}
                onAnalyze={() => handleAnalyze()}
                isLoading={isLoading}
                onOpenVisualBodyMap={() => setIsBodyMapOpen(true)}
                onOpenFodderScanner={() => setIsFodderOpen(true)}
              />

              {/* 4. Quick Field Test Cases */}
              <PresetCasesGrid
                currentLang={currentLang}
                onSelectCase={handleSelectPreset}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Medical Protocol & Safety Disclaimer */}
        <SafetyDisclaimer currentLang={currentLang} />
      </main>

      {/* 24x7 1962 Helpline Modal */}
      <HelplineModal
        isOpen={isHelplineOpen}
        onClose={() => setIsHelplineOpen(false)}
        currentLang={currentLang}
      />

      {/* 1. Offline-First AI Edge Inference Modal */}
      <EdgeAiModal
        isOpen={isEdgeAiOpen}
        onClose={() => setIsEdgeAiOpen(false)}
        currentLang={currentLang}
        onApplyDiagnosis={(d) => {
          setDiagnosis(d);
        }}
      />

      {/* 2. Direct 1962 Helpline & Mobile Veterinary Unit (MVU) Dispatch Integration */}
      <MvuDispatchModal
        isOpen={isMvuOpen}
        onClose={() => setIsMvuOpen(false)}
        diagnosis={diagnosis}
        currentLang={currentLang}
        activeTaluka={activeTaluka}
      />

      {/* 3. Audio-First Interactive AI (Full Local Dialect Voice Assistant) */}
      <DialectVoiceModal
        isOpen={isDialectVoiceOpen}
        onClose={() => setIsDialectVoiceOpen(false)}
        currentLang={currentLang}
        onDispatchVoiceCommand={(command, animal) => {
          setSymptomsText(command);
          if (animal) setSelectedAnimal(animal);
          handleAnalyze();
        }}
        onOpenMvu={() => setIsMvuOpen(true)}
        onOpenCalculator={() => setIsRemedyOpen(true)}
        onOpenOutbreak={() => setIsOutbreakOpen(true)}
      />

      {/* 4. Local Outbreak Early Warning & Geofencing System */}
      <OutbreakMapModal
        isOpen={isOutbreakOpen}
        onClose={() => setIsOutbreakOpen(false)}
        currentLang={currentLang}
        activeTaluka={activeTaluka}
      />

      {/* 5. Smart Feed & Ayurvedic Medicine Calculator */}
      <RemedyCalculatorModal
        isOpen={isRemedyOpen}
        onClose={() => setIsRemedyOpen(false)}
        currentLang={currentLang}
      />

      {/* 6. Exportable Clinical Patient History PDF Docket with QR Code */}
      {diagnosis && (
        <PdfExportModal
          isOpen={isPdfOpen}
          onClose={() => setIsPdfOpen(false)}
          diagnosis={diagnosis}
          currentLang={currentLang}
          animalType={selectedAnimal}
          symptomsText={symptomsText}
        />
      )}

      {/* 7. Interactive Visual Animal Body Map Modal */}
      <VisualBodyMapModal
        isOpen={isBodyMapOpen}
        onClose={() => setIsBodyMapOpen(false)}
        currentLang={currentLang}
        onSelectSymptomQuery={(query, animal) => {
          if (animal) setSelectedAnimal(animal);
          setSymptomsText((prev) => (prev ? `${prev}; ${query}` : query));
        }}
      />

      {/* 8. Fodder & Silage Mold Quality Scanner Modal */}
      <FodderMoldScannerModal
        isOpen={isFodderOpen}
        onClose={() => setIsFodderOpen(false)}
        currentLang={currentLang}
        onApplyFodderReport={(report) => {
          const type = currentLang === 'mr' ? report.sampleTypeMarathi : report.sampleType;
          const status = report.moldDetected 
            ? (currentLang === 'hi' ? 'पाया गया' : currentLang === 'mr' ? 'आढळली' : 'Detected') 
            : (currentLang === 'hi' ? 'नहीं' : currentLang === 'mr' ? 'नाही' : 'Negative');
          const riskLabel = currentLang === 'hi' ? 'जोखिम' : currentLang === 'mr' ? 'धोका' : 'Risk';
          const note = `[${t.fodderAi}: ${type} - ${t.fodderSafetyScore}: ${report.safetyScore}/100, Aflatoxin ${riskLabel}: ${report.aflatoxinRiskLevel}, Mold: ${status}, Est. ${report.estimatedPpb} ppb]`;
          setSymptomsText((prev) => (prev ? `${prev}\n${note}` : note));
        }}
      />

      {/* 10. Taluka Chemist & Herbal Store Directory Modal */}
      <ChemistFinderModal
        isOpen={isChemistOpen}
        onClose={() => setIsChemistOpen(false)}
        currentLang={currentLang}
      />

      {/* 11. E-Pashuhaat Doorstep AI Technician & Insurance Portal Modal */}
      <EPashuhaatModal
        isOpen={isEPashuhaatOpen}
        onClose={() => setIsEPashuhaatOpen(false)}
        currentLang={currentLang}
      />

      {/* 12. Government Vaccination Calendar & Subsidy Tracker Modal */}
      <VaccinationTrackerModal
        isOpen={isVaccinationOpen}
        onClose={() => setIsVaccinationOpen(false)}
        currentLang={currentLang}
      />

      {/* 13. Nearest Veterinary Hospital & Emergency Route Tracker */}
      <NearestHospitalModal
        isOpen={isTrackHospitalOpen}
        onClose={() => setIsTrackHospitalOpen(false)}
        currentLang={currentLang}
      />

      {/* 14. Live Exhibition Judges Demonstration & Zero-Net Benchmark Playbook Modal */}
      <ExhibitionPlaybookModal
        isOpen={isExhibitionPlaybookOpen}
        onClose={() => setIsExhibitionPlaybookOpen(false)}
        currentLang={currentLang}
        onTriggerZeroNetDemo={() => {
          setIsExhibitionPlaybookOpen(false);
          setIsEdgeAiOpen(true);
        }}
      />

      {/* 15. AI Provider Settings Modal (Groq AI) */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
        currentLang={currentLang}
      />

      {/* 16. India 349 State Talukas Sync Modal */}
      <TalukaSyncModal
        isOpen={isTalukaSyncOpen}
        onClose={() => setIsTalukaSyncOpen(false)}
        currentLang={currentLang}
        activeTaluka={activeTaluka}
        onSelectTaluka={handleSelectTaluka}
      />
    </div>
  );
}

