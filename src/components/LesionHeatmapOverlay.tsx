import React, { useState } from 'react';
import {
  Scan,
  Eye,
  EyeOff,
  Flame,
  ShieldCheck,
  AlertTriangle,
  ZoomIn,
  Activity,
  Layers,
} from 'lucide-react';
import { LesionBoundingBox, SupportedLanguage } from '../types';

interface LesionHeatmapOverlayProps {
  imageSrc: string;
  lesions: LesionBoundingBox[];
  currentLang: SupportedLanguage;
  onSelectLesion?: (lesion: LesionBoundingBox) => void;
}

export function LesionHeatmapOverlay({
  imageSrc,
  lesions,
  currentLang,
  onSelectLesion,
}: LesionHeatmapOverlayProps) {
  const [viewMode, setViewMode] = useState<'both' | 'heatmap' | 'boxes' | 'raw'>('both');
  const [activeLesionId, setActiveLesionId] = useState<string | null>(lesions[0]?.id || null);

  const activeLesion = lesions.find((l) => l.id === activeLesionId) || lesions[0];

  return (
    <div className="bg-[#111612] border border-emerald-500/30 rounded-2xl p-3 sm:p-4 shadow-xl">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>{currentLang === 'hi' ? 'स्मार्ट विजुअल हीटमैप व घाव डिटेक्शन' : currentLang === 'mr' ? 'स्मार्ट व्हिज्युअल हीटमॅप व गाठी तपासणी' : 'AI Lesion & Heatmap Segmenter'}</span>
              <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                Grad-CAM AI
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {currentLang === 'hi' ? 'सटीक एआई बाउंडिंग बॉक्स और थर्मल हीटमैप' : currentLang === 'mr' ? 'अचूक एआय बाउंडिंग बॉक्स आणि थर्मल हीटमॅप' : 'Visual neural attention map highlighting affected epidermal tissues'}
            </p>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10 text-xs font-bold">
          <button
            onClick={() => setViewMode('both')}
            className={`px-2.5 py-1 rounded-lg transition ${
              viewMode === 'both'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1 ${
              viewMode === 'heatmap'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-orange-200" />
            <span>Heatmap</span>
          </button>
          <button
            onClick={() => setViewMode('boxes')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1 ${
              viewMode === 'boxes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3 text-blue-200" />
            <span>Boxes</span>
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-2.5 py-1 rounded-lg transition ${
              viewMode === 'raw'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw
          </button>
        </div>
      </div>

      {/* Image Stage Container */}
      <div className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-xl overflow-hidden bg-black border border-white/10 select-none">
        {/* Base Image */}
        <img
          src={imageSrc}
          alt="Clinical Diagnosis Animal"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />

        {/* Heatmap Gradient Overlay (Grad-CAM thermal visualization) */}
        {(viewMode === 'both' || viewMode === 'heatmap') && (
          <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70">
            {lesions.map((lesion) => (
              <div
                key={`heat-${lesion.id}`}
                className="absolute rounded-full filter blur-xl transition-all duration-500"
                style={{
                  left: `${lesion.x - lesion.width * 0.2}%`,
                  top: `${lesion.y - lesion.height * 0.2}%`,
                  width: `${lesion.width * 1.4}%`,
                  height: `${lesion.height * 1.4}%`,
                  background:
                    lesion.severity === 'SEVERE'
                      ? 'radial-gradient(circle, rgba(239, 68, 68, 0.95) 0%, rgba(249, 115, 22, 0.75) 45%, rgba(234, 179, 8, 0.4) 75%, transparent 100%)'
                      : 'radial-gradient(circle, rgba(234, 179, 8, 0.9) 0%, rgba(59, 130, 246, 0.6) 55%, transparent 100%)',
                }}
              />
            ))}
          </div>
        )}

        {/* AI Bounding Boxes */}
        {(viewMode === 'both' || viewMode === 'boxes') &&
          lesions.map((lesion) => {
            const isSelected = lesion.id === activeLesionId;
            const isSevere = lesion.severity === 'SEVERE';
            return (
              <div
                key={`box-${lesion.id}`}
                onClick={() => {
                  setActiveLesionId(lesion.id);
                  if (onSelectLesion) onSelectLesion(lesion);
                }}
                className={`absolute cursor-pointer transition-all duration-200 group ${
                  isSelected ? 'z-20 scale-[1.02]' : 'z-10 hover:scale-[1.01]'
                }`}
                style={{
                  left: `${lesion.x}%`,
                  top: `${lesion.y}%`,
                  width: `${lesion.width}%`,
                  height: `${lesion.height}%`,
                }}
              >
                {/* Border Box with glowing corners */}
                <div
                  className={`w-full h-full rounded border-2 transition-all relative ${
                    isSelected
                      ? isSevere
                        ? 'border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                        : 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                      : isSevere
                      ? 'border-red-400/80 bg-red-950/20 hover:border-red-400'
                      : 'border-emerald-400/80 bg-emerald-950/20 hover:border-emerald-300'
                  }`}
                >
                  {/* Corner Reticles */}
                  <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white"></span>
                  <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white"></span>
                  <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white"></span>
                  <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white"></span>
                </div>

                {/* Floating Label Badge */}
                <div
                  className={`absolute -top-6 left-0 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-extrabold flex items-center space-x-1 shadow-md transition ${
                    isSelected
                      ? isSevere
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-500 text-black'
                      : 'bg-black/85 text-slate-200 border border-white/20'
                  }`}
                >
                  <Activity className="w-2.5 h-2.5" />
                  <span>
                    {currentLang === 'mr' ? lesion.labelMarathi : lesion.label}
                  </span>
                  <span className="font-mono text-[9px] opacity-90">
                    ({Math.round(lesion.confidence * 100)}%)
                  </span>
                </div>
              </div>
            );
          })}

        {/* Live HUD Watermark in Bottom Corner */}
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 flex items-center space-x-2 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Inference: MobileNetV3-SSD • 512x512 Res</span>
          <span className="text-emerald-400 font-bold">
            {lesions.length} Lesions Isolated
          </span>
        </div>
      </div>

      {/* Lesion Details Inspector Strip */}
      {activeLesion && (
        <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeLesion.severity === 'SEVERE'
                    ? 'bg-red-950 text-red-300 border border-red-500/50'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                }`}
              >
                {activeLesion.severity} RISK
              </span>
              <h5 className="text-xs font-bold text-white">
                {currentLang === 'mr' ? activeLesion.labelMarathi : activeLesion.label}
              </h5>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                {Math.round(activeLesion.confidence * 100)}% Confidence
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeLesion.clinicalNote}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/10">
              Loc: {activeLesion.x}%X, {activeLesion.y}%Y
            </span>
            <button
              onClick={() => setViewMode(viewMode === 'raw' ? 'both' : 'raw')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center space-x-1"
            >
              {viewMode === 'raw' ? (
                <>
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>Show AI</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 text-slate-400" />
                  <span>Hide AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
