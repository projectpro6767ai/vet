import React, { useState } from 'react';
import {
  X,
  Target,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Footprints,
  Layers,
  CircleAlert,
  ShieldAlert,
  Activity,
  Smile,
} from 'lucide-react';
import { SupportedLanguage, AnimalBodyHotspot } from '../types';
import { ANIMAL_BODY_HOTSPOTS } from '../data/ecosystemData';

interface VisualBodyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
  onSelectSymptomQuery: (query: string, animal?: string) => void;
}

export function VisualBodyMapModal({
  isOpen,
  onClose,
  currentLang,
  onSelectSymptomQuery,
}: VisualBodyMapModalProps) {
  const [selectedPartId, setSelectedPartId] = useState<string>('flank');
  const [activeAnimalType, setActiveAnimalType] = useState<string>('Cow');
  const [addedSymptoms, setAddedSymptoms] = useState<string[]>([]);

  if (!isOpen) return null;

  const activeHotspot =
    ANIMAL_BODY_HOTSPOTS.find((h) => h.id === selectedPartId) ||
    ANIMAL_BODY_HOTSPOTS[0];

  const handleAddSymptom = (symptomQuery: string) => {
    if (!addedSymptoms.includes(symptomQuery)) {
      setAddedSymptoms([...addedSymptoms, symptomQuery]);
    }
    onSelectSymptomQuery(symptomQuery, activeAnimalType);
  };

  const playVernacularAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = currentLang === 'mr' ? 'mr-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0F1410] border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-emerald-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center space-x-2 font-['Outfit']">
                <span>
                  {currentLang === 'hi'
                    ? 'इंटरैक्टिव पशु शरीर मानचित्र (टैप करें)'
                    : currentLang === 'mr'
                    ? 'सचित्र जनावराचा शरीर नकाशा (अवयव निवडा)'
                    : 'Interactive Animal Visual Body Map'}
                </span>
                <span className="text-[10px] font-mono uppercase bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Rural No-Text UI
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {currentLang === 'hi'
                  ? 'लिखने में परेशानी हो तो सीधे बीमार अंग (पैर, थन, पेट, मुंह) पर क्लिक करें'
                  : currentLang === 'mr'
                  ? 'लिहिता येत नसेल तर जनावराच्या दुखऱ्या भागावर (खूर, कास, पोट, तोंड) बोट टेकवा'
                  : 'Tap affected anatomical areas to auto-generate vernacular symptoms without typing'}
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

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Animal Species Selector Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {['Cow', 'Buffalo', 'Goat', 'Sheep'].map((sp) => (
              <button
                key={sp}
                onClick={() => setActiveAnimalType(sp)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                  activeAnimalType === sp
                    ? 'bg-emerald-600 text-black shadow-md'
                    : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <span>
                  {sp === 'Cow'
                    ? '🐄 गाय (Cow)'
                    : sp === 'Buffalo'
                    ? '🐃 म्हैस (Buffalo)'
                    : sp === 'Goat'
                    ? '🐐 शेळी (Goat)'
                    : '🐑 मेंढी (Sheep)'}
                </span>
              </button>
            ))}
          </div>

          {/* 2D Animal Silhouette Stage with Interactive Pins */}
          <div className="relative w-full aspect-16/9 sm:aspect-21/9 bg-radial from-[#19271d] to-[#0a0e0b] rounded-2xl border border-white/15 p-4 flex items-center justify-center overflow-hidden">
            {/* Background Anatomical Schematic SVG */}
            <svg
              viewBox="0 0 800 400"
              className="w-full h-full opacity-35 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
            >
              {/* Cow Anatomical Silhouette Contour */}
              <path
                d="M 120 180 Q 140 130 180 140 Q 210 120 250 140 L 320 120 Q 420 110 520 125 Q 600 135 640 180 Q 660 210 650 260 L 620 280 L 600 350 L 560 350 L 570 280 L 480 270 Q 460 300 420 300 L 430 350 L 390 350 L 395 270 L 300 270 L 290 350 L 250 350 L 265 240 Q 220 240 180 230 L 140 220 Q 110 200 120 180 Z"
                fill="rgba(16, 185, 129, 0.08)"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              {/* Internal Rumen / Stomach Outline */}
              <ellipse
                cx="380"
                cy="190"
                rx="85"
                ry="50"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="rgba(245, 158, 11, 0.04)"
              />
              {/* Udder outline */}
              <ellipse
                cx="460"
                cy="260"
                rx="35"
                ry="25"
                stroke="#ef4444"
                strokeWidth="1.5"
                fill="rgba(239, 68, 68, 0.05)"
              />
            </svg>

            {/* Interactive Pins placed dynamically on animal body */}
            {ANIMAL_BODY_HOTSPOTS.map((hotspot) => {
              const isSelected = hotspot.id === selectedPartId;
              return (
                <button
                  key={hotspot.id}
                  onClick={() => setSelectedPartId(hotspot.id)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer transition-all duration-300 group ${
                    isSelected
                      ? 'scale-125 z-20 bg-emerald-500 text-black shadow-[0_0_20px_#10b981]'
                      : 'bg-black/80 text-emerald-400 hover:scale-110 border border-emerald-400/50 hover:bg-emerald-950 shadow-md'
                  }`}
                  style={{
                    left: `${hotspot.coords.x}%`,
                    top: `${hotspot.coords.y}%`,
                  }}
                  title={currentLang === 'mr' ? hotspot.nameMr : hotspot.nameEn}
                >
                  <span className="relative flex h-3 w-3">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isSelected ? 'bg-black' : 'bg-emerald-400'
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-3 w-3 ${
                        isSelected ? 'bg-black' : 'bg-emerald-500'
                      }`}
                    ></span>
                  </span>

                  {/* Tooltip Tag */}
                  <span
                    className={`absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg pointer-events-none transition ${
                      isSelected
                        ? 'bg-emerald-500 text-black'
                        : 'bg-black/90 text-slate-200 border border-white/20'
                    }`}
                  >
                    {currentLang === 'mr'
                      ? hotspot.nameMr.split(' ')[0]
                      : hotspot.nameEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Hotspot Symptom Quick Drawer */}
          {activeHotspot && (
            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">
                      {currentLang === 'mr'
                        ? activeHotspot.nameMr
                        : currentLang === 'hi'
                        ? activeHotspot.nameHi
                        : activeHotspot.nameEn}
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Tap symptoms below to add to diagnosis
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    playVernacularAudio(
                      currentLang === 'mr' ? activeHotspot.nameMr : activeHotspot.nameEn
                    )
                  }
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 text-xs transition"
                  title="Speak Name"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Symptom Cards for this Body Part */}
              <div className="space-y-2 pt-1">
                {activeHotspot.symptoms.map((sym, idx) => {
                  const isAdded = addedSymptoms.includes(sym.symptomQuery);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#131a15] hover:bg-[#18231c] border border-white/10 flex items-center justify-between gap-3 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black ${
                              sym.urgencyTag === 'RED'
                                ? 'bg-red-950 text-red-400 border border-red-500/40'
                                : sym.urgencyTag === 'YELLOW'
                                ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            }`}
                          >
                            {sym.urgencyTag}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {currentLang === 'mr'
                              ? sym.labelMr
                              : currentLang === 'hi'
                              ? sym.labelHi
                              : sym.labelEn}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic">
                          "{sym.symptomQuery}"
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() =>
                            playVernacularAudio(
                              currentLang === 'mr' ? sym.labelMr : sym.labelEn
                            )
                          }
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
                          title="Listen in Marathi/Hindi"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleAddSymptom(sym.symptomQuery)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1 transition cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-500 text-black shadow-md'
                              : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Select</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 bg-black/50">
          <span className="text-[11px] text-slate-400">
            {addedSymptoms.length > 0
              ? `${addedSymptoms.length} anatomical symptoms selected`
              : 'Tap body hotspot pins to inspect'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs transition cursor-pointer shadow-md"
          >
            Apply to Triage Form
          </button>
        </div>
      </div>
    </div>
  );
}
