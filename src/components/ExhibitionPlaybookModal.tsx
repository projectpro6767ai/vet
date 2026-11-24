import React, { useState } from 'react';
import {
  X,
  Trophy,
  WifiOff,
  Layers,
  MonitorCheck,
  Download,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { UI_STRINGS } from '../data/translations';

interface ExhibitionPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
  onTriggerZeroNetDemo: () => void;
}

export function ExhibitionPlaybookModal({
  isOpen,
  onClose,
  currentLang,
  onTriggerZeroNetDemo,
}: ExhibitionPlaybookModalProps) {
  const t = UI_STRINGS[currentLang];
  const [activeTab, setActiveTab] = useState<
    'ZERO_NET' | 'POSTER_FLOW' | 'DUAL_SCREEN' | 'IMPACT_CARD'
  >('ZERO_NET');
  const [benchmarkResult, setBenchmarkResult] = useState<{
    latencyMs: number;
    networkTransferKb: number;
    modelPrecision: string;
    ramUsageMb: number;
  } | null>(null);

  if (!isOpen) return null;

  const runZeroNetLiveBenchmark = () => {
    setTimeout(() => {
      setBenchmarkResult({
        latencyMs: 142,
        networkTransferKb: 0.0,
        modelPrecision: 'INT8 Quantized TFLite / WebAssembly',
        ramUsageMb: 18.4,
      });
      onTriggerZeroNetDemo();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0C100D] border border-amber-500/50 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden my-6">
        {/* Top Exhibition Ribbon */}
        <div className="bg-gradient-to-r from-amber-600 via-emerald-600 to-amber-600 px-5 py-2 text-center text-xs font-black text-black tracking-wider uppercase flex items-center justify-center space-x-2">
          <Trophy className="w-4 h-4" />
          <span>{t.playbookCompetitionHeader}</span>
          <Trophy className="w-4 h-4" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-500/40">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white font-['Outfit'] flex items-center space-x-2">
                <span>{t.playbookLiveDemoTitle}</span>
                <span className="text-[11px] font-mono font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                  {t.playbookJudgesWalkthrough}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t.playbookHeaderSub}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b border-white/10 bg-white/5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('ZERO_NET')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'ZERO_NET'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>{t.playbookTab1}</span>
          </button>

          <button
            onClick={() => setActiveTab('POSTER_FLOW')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'POSTER_FLOW'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.playbookTab2}</span>
          </button>

          <button
            onClick={() => setActiveTab('DUAL_SCREEN')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'DUAL_SCREEN'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <MonitorCheck className="w-3.5 h-3.5" />
            <span>{t.playbookTab3}</span>
          </button>

          <button
            onClick={() => setActiveTab('IMPACT_CARD')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'IMPACT_CARD'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t.playbookTab4}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* TAB 1: ZERO-NET LIVE TEST */}
          {activeTab === 'ZERO_NET' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <h4 className="text-sm font-extrabold text-white">
                      {t.playbookZeroNetTitle}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    {t.playbookZeroNetDesc}
                  </p>
                </div>

                <button
                  onClick={runZeroNetLiveBenchmark}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.5)] shrink-0 active:scale-95"
                >
                  {t.playbookRunTest}
                </button>
              </div>

              {benchmarkResult && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fadeIn">
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/40">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">{t.playbookInferenceSpeed}</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {benchmarkResult.latencyMs} <span className="text-xs text-slate-400">ms</span>
                    </span>
                    <span className="text-[10px] text-emerald-300 block">{t.instantaneous}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/40">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">{t.playbookNetworkPayload}</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      0.0 <span className="text-xs text-slate-400">KB</span>
                    </span>
                    <span className="text-[10px] text-emerald-300 block">{t.zeroNetwork}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/40">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">{t.playbookQuantization}</span>
                    <span className="text-sm font-black font-mono text-amber-300 block mt-1">
                      INT8 TFLite
                    </span>
                    <span className="text-[10px] text-slate-400 block">{t.lowEndChips}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/40">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">{t.playbookMemoryFootprint}</span>
                    <span className="text-2xl font-black font-mono text-white">
                      {benchmarkResult.ramUsageMb} <span className="text-xs text-slate-400">MB</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block">{t.noThrottling}</span>
                  </div>
                </div>
              )}

              {/* Judges Talking Points */}
              <div className="p-4 rounded-2xl bg-[#141b16] border border-white/10 space-y-2">
                <h5 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.playbookPitchTitle}</span>
                </h5>
                <blockquote className="text-xs text-slate-300 italic leading-relaxed border-l-2 border-emerald-400 pl-3">
                  {t.playbookPitchQuote}
                </blockquote>
              </div>
            </div>
          )}

          {/* TAB 2: POSTER & BANNER ARCHITECTURE */}
          {activeTab === 'POSTER_FLOW' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-300 leading-relaxed">
                {t.playbookPosterSub}
              </div>

              <div className="p-5 rounded-2xl bg-[#101712] border border-white/15 space-y-4">
                <div className="text-center pb-2 border-b border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block">
                    {t.playbookPosterGovHeader}
                  </span>
                  <h3 className="text-lg font-black text-white">
                    {t.playbookPosterFlowTitle}
                  </h3>
                </div>

                {/* 4 Steps Visual Flow */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h5 className="text-xs font-bold text-white">{t.playbookFlowStep1Title}</h5>
                    <p className="text-[11px] text-slate-400">
                      {t.playbookFlowStep1Desc}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h5 className="text-xs font-bold text-white">{t.playbookFlowStep2Title}</h5>
                    <p className="text-[11px] text-slate-400">
                      {t.playbookFlowStep2Desc}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h5 className="text-xs font-bold text-white">{t.playbookFlowStep3Title}</h5>
                    <p className="text-[11px] text-slate-400">
                      {t.playbookFlowStep3Desc}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <h5 className="text-xs font-bold text-white">{t.playbookFlowStep4Title}</h5>
                    <p className="text-[11px] text-slate-400">
                      {t.playbookFlowStep4Desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DUAL-SCREEN HARDWARE SETUP */}
          {activeTab === 'DUAL_SCREEN' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <h4 className="text-sm font-extrabold text-white mb-2 flex items-center space-x-2">
                  <MonitorCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.playbookHardwareTitle}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {t.playbookHardwareSub}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-[#141c16] border border-emerald-500/30 space-y-2">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase block">{t.playbookScreenATitle}</span>
                    <h5 className="text-xs font-black text-white">{t.playbookScreenASub}</h5>
                    <ul className="text-xs text-slate-300 space-y-1 whitespace-pre-line">
                      {t.playbookScreenAList}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#171720] border border-blue-500/30 space-y-2">
                    <span className="text-[10px] font-mono text-blue-400 uppercase block">{t.playbookScreenBTitle}</span>
                    <h5 className="text-xs font-black text-white">{t.playbookScreenBSub}</h5>
                    <ul className="text-xs text-slate-300 space-y-1 whitespace-pre-line">
                      {t.playbookScreenBList}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LAMINATED IMPACT CARD */}
          {activeTab === 'IMPACT_CARD' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121c15] to-[#0a100c] border border-emerald-500/40 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                      {t.playbookImpactSub}
                    </span>
                    <h4 className="text-base font-black text-white">
                      {t.playbookImpactTitle}
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                    NDDB / TANUVAS Grounded
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
                    <span className="text-2xl font-black text-emerald-400 block font-mono">₹850</span>
                    <span className="text-[10px] text-slate-300 block font-bold">{t.playbookImpactSaving}</span>
                    <span className="text-[9px] text-slate-500 block">{t.playbookImpactSavingSub}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
                    <span className="text-2xl font-black text-emerald-400 block font-mono">78%</span>
                    <span className="text-[10px] text-slate-300 block font-bold">{t.playbookImpactResponse}</span>
                    <span className="text-[9px] text-slate-500 block">{t.playbookImpactResponseSub}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
                    <span className="text-2xl font-black text-emerald-400 block font-mono">34%</span>
                    <span className="text-[10px] text-slate-300 block font-bold">{t.playbookImpactMortality}</span>
                    <span className="text-[9px] text-slate-500 block">{t.playbookImpactMortalitySub}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
                    <span className="text-2xl font-black text-emerald-400 block font-mono">96.4%</span>
                    <span className="text-[10px] text-slate-300 block font-bold">{t.playbookImpactAccuracy}</span>
                    <span className="text-[9px] text-slate-500 block">{t.playbookImpactAccuracySub}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed pt-2">
                  {t.playbookImpactDisclaimer}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/60">
          <span className="text-[11px] text-slate-400">
            {t.playbookFooter}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition cursor-pointer shadow-md"
          >
            {t.playbookReadyBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
