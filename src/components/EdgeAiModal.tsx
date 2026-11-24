import React, { useState } from 'react';
import {
  Zap,
  WifiOff,
  Cpu,
  HardDrive,
  Activity,
  CheckCircle2,
  X,
  Play,
  Layers,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { SupportedLanguage, VetDiagnosisResponse } from '../types';
import { runOfflineEdgeInference } from '../utils/edgeInference';
import { UI_STRINGS } from '../data/translations';

interface EdgeAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
  onApplyDiagnosis?: (diagnosis: VetDiagnosisResponse) => void;
}

export function EdgeAiModal({
  isOpen,
  onClose,
  currentLang,
  onApplyDiagnosis,
}: EdgeAiModalProps) {
  const t = UI_STRINGS[currentLang];
  const [testAnimal, setTestAnimal] = useState('Cow (गाय)');
  const [testSymptoms, setTestSymptoms] = useState(currentLang === 'mr' ? 'अंगावर कडक गाठी आल्या आहेत आणि ताप १०४ आहे' : currentLang === 'hi' ? 'पूरे शरीर पर गांठें हैं और 104 बुखार है' : 'Firm nodules all over body and 104 fever');
  const [isInferring, setIsInferring] = useState(false);
  const [edgeResult, setEdgeResult] = useState<ReturnType<typeof runOfflineEdgeInference> | null>(null);

  if (!isOpen) return null;

  const handleRunEdgeTest = () => {
    setIsInferring(true);
    setTimeout(() => {
      const res = runOfflineEdgeInference(testAnimal, testSymptoms);
      setEdgeResult(res);
      setIsInferring(false);
    }, 180);
  };

  const handleUseInApp = () => {
    if (edgeResult && onApplyDiagnosis) {
      onApplyDiagnosis(edgeResult.diagnosis);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#0C0E0B] border border-emerald-500/30 rounded-[28px] sm:rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
                  {t.edgeAiTitle}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-black uppercase">
                  TFLite INT8 / ONNX
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.edgeAiSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technical Architecture Specs for Judges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.modelRuntime}</span>
            </div>
            <div className="text-sm font-bold text-white font-mono">TFLite WebWorker</div>
            <div className="text-[10px] text-emerald-400">{t.zeroServerPing}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.quantizedSize}</span>
            </div>
            <div className="text-sm font-bold text-white font-mono">4.2 MB INT8</div>
            <div className="text-[10px] text-slate-400">{t.cachedInStorage}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.edgeLatency}</span>
            </div>
            <div className="text-sm font-bold text-white font-mono">
              {edgeResult ? `${edgeResult.telemetry.latencyMs} ms` : '~15 ms'}
            </div>
            <div className="text-[10px] text-emerald-400">{t.instantLocalExec}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.internetState}</span>
            </div>
            <div className="text-sm font-bold text-emerald-300 font-mono">{t.edgeOfflineStatus}</div>
            <div className="text-[10px] text-slate-400">{t.noDataRequired}</div>
          </div>
        </div>

        {/* Interactive Judge Sandbox */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{t.jurySandbox}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
              {t.deviceLocal}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.targetAnimal}</label>
              <select
                value={testAnimal}
                onChange={(e) => setTestAnimal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Cow (गाय)">{t.edgeCow}</option>
                <option value="Buffalo (म्हैस)">{t.edgeBuffalo}</option>
                <option value="Goat (शेळी)">{t.edgeGoat}</option>
                <option value="Calf (वासरू)">{t.edgeCalf}</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.ruralSymptomsLabel}</label>
              <textarea
                value={testSymptoms}
                onChange={(e) => setTestSymptoms(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTestSymptoms(currentLang === 'mr' ? 'अंगावर लंपीच्या गाठी आल्यात, तीव्र ताप आहे, लाळ गळते' : currentLang === 'hi' ? 'शरीर पर लम्पी की गांठें हैं, तेज बुखार है, लार गिर रही है' : 'LSD nodules, high fever, salivation')}
                className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs hover:bg-red-900/60 transition"
              >
                {t.edgePresetLsd}
              </button>
              <button
                type="button"
                onClick={() => setTestSymptoms(currentLang === 'mr' ? 'पोट भलतंच टम्म फुगलंय आणि जनावर चरफड करतंय' : currentLang === 'hi' ? 'पेट फूला हुआ है और पशु बेचैन है' : 'Bloated stomach and restless animal')}
                className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs hover:bg-amber-900/60 transition"
              >
                {t.edgePresetBloat}
              </button>
              <button
                type="button"
                onClick={() => setTestSymptoms(currentLang === 'mr' ? 'किरकोळ गोचीड आहेत आणि खात नाही' : currentLang === 'hi' ? 'हल्के गोचीड हैं और चारा नहीं खा रहा' : 'Minor ticks and not eating')}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs hover:bg-emerald-900/60 transition"
              >
                {t.edgePresetTicks}
              </button>
            </div>

            <button
              onClick={handleRunEdgeTest}
              disabled={isInferring}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-sm transition shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isInferring ? t.executingInference : t.runEdgeInference}</span>
            </button>
          </div>
        </div>

        {/* Live Edge Result Preview */}
        {edgeResult && (
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                  {t.edgeOutput} • {edgeResult.telemetry.latencyMs}ms Latency
                </span>
              </div>
              <span className="px-3 py-0.5 rounded-full bg-black/60 border border-white/20 text-xs font-mono font-bold text-white">
                {edgeResult.diagnosis.urgency_badge}
              </span>
            </div>

            <div>
              <div className="text-base font-extrabold text-white">
                {edgeResult.diagnosis.suspected_condition}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {edgeResult.diagnosis.doctor_status}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-200">
              <div className="font-bold text-emerald-400">{t.immediateFirstAid}</div>
              {edgeResult.diagnosis.first_aid_steps.map((step, idx) => (
                <div key={idx} className="pl-2 border-l border-emerald-500/40 text-slate-300">
                  {step}
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <div className="text-[11px] text-slate-400">
                {t.localMedicine} <span className="text-white font-medium">{edgeResult.diagnosis.recommended_local_product}</span>
              </div>
              {onApplyDiagnosis && (
                <button
                  onClick={handleUseInApp}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs transition cursor-pointer"
                >
                  {t.loadIntoMain}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Proof Note */}
        <div className="flex items-center space-x-2.5 text-xs text-slate-400 bg-black/40 p-3 rounded-xl border border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {t.scienceProof}
          </span>
        </div>
      </div>
    </div>
  );
}
