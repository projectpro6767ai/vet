import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  QrCode as QrIcon,
  X,
  Check,
  ShieldCheck,
  Building2,
  Stethoscope,
} from 'lucide-react';
import { VetDiagnosisResponse, SupportedLanguage } from '../types';
import { generateReportQrCode } from '../utils/qrCode';
import { downloadClinicalReportPdf } from '../utils/pdfExport';
import { UI_STRINGS } from '../data/translations';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosis: VetDiagnosisResponse;
  currentLang: SupportedLanguage;
  animalType?: string;
  symptomsText?: string;
}

export function PdfExportModal({
  isOpen,
  onClose,
  diagnosis,
  currentLang,
  animalType,
  symptomsText,
}: PdfExportModalProps) {
  const t = UI_STRINGS[currentLang];
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isPdfSaved, setIsPdfSaved] = useState<boolean>(false);
  const [docketNumber] = useState(
    `VET-BRM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
  );

  useEffect(() => {
    if (!isOpen) return;

    // Create doctor-scannable diagnostic payload
    const qrPayload = {
      docket: docketNumber,
      app: 'Vet-Mitra AI',
      animal: diagnosis.animal_identified || animalType || 'Livestock',
      condition: diagnosis.suspected_condition,
      urgency: diagnosis.urgency_badge,
      emergencyNeeded: diagnosis.is_emergency_dispatch_needed,
      firstAid: diagnosis.first_aid_steps,
      medicine: diagnosis.recommended_local_product,
      issuedAt: new Date().toISOString(),
      helpline: '1962',
    };

    generateReportQrCode(qrPayload, { width: 300, margin: 1 }).then((url) => {
      setQrCodeDataUrl(url);
    });
  }, [isOpen, diagnosis, docketNumber, animalType]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSavePdf = () => {
    downloadClinicalReportPdf(diagnosis, {
      docketNumber,
      animalType: diagnosis.animal_identified || animalType,
      currentLang,
      symptomsText,
    });
    setIsPdfSaved(true);
    setTimeout(() => setIsPdfSaved(false), 3000);
  };

  const handleDownloadJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(diagnosis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${docketNumber}_Clinical_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl max-h-[94vh] overflow-y-auto bg-[#0C0E0B] border border-white/20 rounded-[28px] sm:rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:p-4 print:max-h-none print:overflow-visible">
        {/* Modal Controls (Hidden when Printing) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-['Outfit'] text-white">
                {currentLang === 'mr'
                  ? 'वैद्यकीय तपासणी इतिहास व डॉक्टर QR पत्रक'
                  : currentLang === 'hi'
                  ? 'चिकित्सकीय रोगी इतिहास और डॉक्टर QR पर्ची'
                  : 'Clinical Patient History & Doctor QR Docket'}
              </h3>
              <p className="text-xs text-slate-400">
                {currentLang === 'mr'
                  ? 'तालुका पशुवैद्यकीय दवाखान्यासाठी अधिकृत अहवाल'
                  : currentLang === 'hi'
                  ? 'तालुका पशु चिकित्सालय के लिए आधिकारिक पर्ची'
                  : 'Print or export official diagnostic paperwork for Taluka Para-vets and Dispensaries'}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* 1. Dedicated Save as PDF Button */}
            <button
              onClick={handleSavePdf}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs transition cursor-pointer shadow-lg active:scale-95 whitespace-nowrap"
              title="Download PDF File"
            >
              {isPdfSaved ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>{t.pdfDownloaded || 'PDF Saved!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-black" />
                  <span>{t.savePdf || 'Save as PDF'}</span>
                </>
              )}
            </button>

            {/* 2. Dedicated Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition cursor-pointer shadow active:scale-95 whitespace-nowrap"
              title="Open System Print Dialog"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>{t.print || 'Print'}</span>
            </button>

            {/* 3. JSON Export */}
            <button
              onClick={handleDownloadJson}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs transition"
              title="Download JSON Telemetry"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* 4. Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CLINICAL VETERINARY DOCKET BODY */}
        <div
          id="printable-triage-docket"
          className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-xl space-y-5 font-['Plus_Jakarta_Sans']"
        >
          {/* Government / Taluka Header */}
          <div className="border-b-2 border-emerald-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-extrabold text-xl">
                VM
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-800 font-bold">
                  {currentLang === 'mr'
                    ? 'तालुका पशुवैद्यकीय दवाखाना • राष्ट्रीय पशुरोग नियंत्रण'
                    : currentLang === 'hi'
                    ? 'तालुका पशु चिकित्सालय • राष्ट्रीय पशु रोग नियंत्रण'
                    : 'Taluka Veterinary Dispensary • National Animal Disease Control'}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {currentLang === 'mr'
                    ? 'वेट-मित्र एआय वैद्यकीय तपासणी पत्रक'
                    : currentLang === 'hi'
                    ? 'वेट-मित्र एआई चिकित्सकीय जांच पर्ची'
                    : 'VET-MITRA AI CLINICAL TRIAGE DOCKET'}
                </h2>
                <p className="text-xs text-slate-500">
                  {currentLang === 'mr'
                    ? '१९६२ फिरते पशुवैद्यकीय पथक (MVU) टेलीमेडिसिन प्रणाली'
                    : currentLang === 'hi'
                    ? '1962 मोबाइल वेटरनरी यूनिट (MVU) टेलीमेडिसिन प्रणाली'
                    : 'Integrated 1962 Mobile Veterinary Unit (MVU) Telemedicine System'}
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right font-mono text-xs text-slate-700 bg-slate-100 p-2 rounded-lg border border-slate-300">
              <div className="font-bold text-slate-900">{docketNumber}</div>
              <div>{currentLang === 'mr' || currentLang === 'hi' ? 'दिनांक:' : 'Date:'} {new Date().toLocaleDateString('en-IN')}</div>
              <div>{currentLang === 'mr' || currentLang === 'hi' ? 'वेळ:' : 'Time:'} {new Date().toLocaleTimeString('en-IN')}</div>
            </div>
          </div>

          {/* Patient Details & Urgency Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">
                {currentLang === 'mr' ? 'तपासलेले जनावर:' : currentLang === 'hi' ? 'पहचाना गया पशु:' : 'Identified Subject:'}
              </span>
              <span className="font-bold text-slate-900 text-sm">{diagnosis.animal_identified}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">
                {currentLang === 'mr' ? 'धोक्याची पातळी:' : currentLang === 'hi' ? 'गंभीरता स्तर:' : 'Triage Urgency:'}
              </span>
              <span className="font-black text-sm text-slate-900">{diagnosis.urgency_badge}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">
                {currentLang === 'mr' ? 'डॉक्टर पाचारण:' : currentLang === 'hi' ? 'डॉक्टर आवश्यकता:' : 'Dispatch Escalation:'}
              </span>
              <span className="font-bold text-slate-900">
                {diagnosis.is_emergency_dispatch_needed
                  ? (currentLang === 'mr' ? '१९६२ रुग्णवाहिका पाचारण' : currentLang === 'hi' ? '1962 एम्बुलेंस बुलाई गई' : 'RED 1962 Dispatched')
                  : (currentLang === 'mr' ? 'घरगुती निगा व देखरेख' : currentLang === 'hi' ? 'घरेलू देखभाल व निगरानी' : 'Routine Home Care')}
              </span>
            </div>
          </div>

          {/* Suspected Diagnosis */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="text-[10px] font-mono font-bold text-emerald-800 uppercase">
              {currentLang === 'mr' ? 'संभाव्य आजार / स्थिती' : currentLang === 'hi' ? 'संभावित रोग / स्थिति' : 'Suspected Pathological Condition'}
            </div>
            <div className="text-lg font-extrabold text-emerald-950 mt-0.5">
              {diagnosis.suspected_condition}
            </div>
            <p className="text-xs text-emerald-800/90 mt-1 font-medium">
              {diagnosis.doctor_status}
            </p>
          </div>

          {/* Symptoms Stated */}
          {symptomsText && (
            <div className="text-xs text-slate-700">
              <span className="font-bold uppercase font-mono text-[10px] text-slate-500 block">
                {currentLang === 'mr' ? 'पशुपालकाने नोंदवलेली लक्षणे:' : currentLang === 'hi' ? 'पशुपालक द्वारा बताए गए लक्षण:' : 'Farmer Reported Symptoms / Field Notes:'}
              </span>
              <p className="p-2 bg-slate-50 rounded border border-slate-200 mt-1 italic">
                "{symptomsText}"
              </p>
            </div>
          )}

          {/* First Aid & Para-vet Protocol */}
          <div className="space-y-2">
            <div className="text-xs font-bold font-mono uppercase text-slate-700 border-b pb-1">
              {currentLang === 'mr'
                ? 'तातडीचे प्राथमिक उपचार व स्थिरीकरण पद्धती:'
                : currentLang === 'hi'
                ? 'तुरंत प्राथमिक उपचार व स्थिरीकरण प्रोटोकॉल:'
                : 'Field First-Aid & Stabilization Protocol (NDDB/TANUVAS):'}
            </div>
            <div className="space-y-1.5 text-xs text-slate-800">
              {diagnosis.first_aid_steps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="font-bold text-emerald-700">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings & Local Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="font-bold text-amber-900 block font-mono text-[10px] uppercase">
                {currentLang === 'mr' ? '⚠️ काय करू नये (सक्त ताकीद):' : currentLang === 'hi' ? '⚠️ क्या भूलकर भी न करें (चेतावनी):' : '⚠️ Contraindications / What NOT to Do:'}
              </span>
              <p className="text-amber-950 mt-1">{diagnosis.what_not_to_do}</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
              <span className="font-bold text-teal-900 block font-mono text-[10px] uppercase">
                {currentLang === 'mr' ? 'शिफारस केलेले स्थानिक औषध / साहित्य:' : currentLang === 'hi' ? 'नजदीकी स्टोर से उपयोगी दवा/सामग्री:' : 'Recommended Chemist / Co-op Product:'}
              </span>
              <p className="text-teal-950 mt-1 font-bold">{diagnosis.recommended_local_product}</p>
            </div>
          </div>

          {/* QR Code and Veterinary Attestation Block */}
          <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Doctor Verification QR"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-slate-300 p-1 bg-white shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <QrIcon className="w-8 h-8" />
                </div>
              )}
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>
                    {currentLang === 'mr' ? 'डॉक्टर पडताळणी QR कोड' : currentLang === 'hi' ? 'डॉक्टर सत्यापन QR कोड' : 'Doctor Verification QR Code'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] max-w-[240px]">
                  {currentLang === 'mr'
                    ? 'संपूर्ण वैद्यकीय माहिती तपासण्यासाठी कोणत्याही स्मार्टफोनने स्कॅन करा.'
                    : currentLang === 'hi'
                    ? 'पूरी चिकित्सकीय जानकारी लोड करने के लिए किसी भी स्मार्टफोन से स्कैन करें।'
                    : 'Scan with any smartphone or hospital terminal to load full cryptographic case telemetry.'}
                </p>
                <div className="text-[10px] font-mono text-emerald-800 font-bold mt-1">
                  1962 MVU Verified Docket
                </div>
              </div>
            </div>

            <div className="text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
              <div className="w-44 h-12 border-b border-dashed border-slate-400 mb-1 ml-auto flex items-end justify-center text-[10px] text-slate-400">
                {currentLang === 'mr' ? '[पशुवैद्यकीय अधिकाऱ्याची स्वाक्षरी]' : currentLang === 'hi' ? '[अधिकृत पशु चिकित्सक हस्ताक्षर]' : '[Authorized Para-vet Signature]'}
              </div>
              <div className="text-[11px] font-bold text-slate-800">
                {currentLang === 'mr' ? 'पशुधन विकास अधिकारी (LDO)' : currentLang === 'hi' ? 'पशुधन विकास अधिकारी (LDO)' : 'Attending Livestock Development Officer (LDO)'}
              </div>
              <div className="text-[10px] text-slate-500">
                {currentLang === 'mr' ? 'तालुका पशुवैद्यकीय सर्वचिकित्सालय' : currentLang === 'hi' ? 'तालुका पशु चिकित्सालय' : 'Taluka Veterinary Dispensary'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
