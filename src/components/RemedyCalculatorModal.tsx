import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  Wheat,
  Clock,
  Check,
  X,
  Printer,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { AYURVEDIC_RECIPES } from '../data/remedyData';
import { SupportedLanguage } from '../types';

interface RemedyCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
}

export function RemedyCalculatorModal({
  isOpen,
  onClose,
  currentLang,
}: RemedyCalculatorModalProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('remedy_bloat');
  const [bodyWeightKg, setBodyWeightKg] = useState<number>(380); // Standard Indian crossbred cow ~380kg

  if (!isOpen) return null;

  const recipe =
    AYURVEDIC_RECIPES.find((r) => r.id === selectedRecipeId) || AYURVEDIC_RECIPES[0];

  // Calculate proportional doses based on weight factor (weight / 100kg)
  const weightFactor = bodyWeightKg / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#0C0E0B] border border-emerald-500/40 rounded-[28px] sm:rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
                  Ayurvedic Remedy & Feed Calculator
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-black uppercase">
                  NDDB / TANUVAS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Low-Cost Home-Remedy Ratio & Crop Waste Calculator tailored to Animal Body Weight
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

        {/* Condition Selector */}
        <div>
          <label className="text-xs text-slate-400 font-bold block mb-2">
            Select Health Condition:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AYURVEDIC_RECIPES.map((r) => {
              const isSelected = r.id === selectedRecipeId;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRecipeId(r.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{r.conditionName}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weight Selector & Slider */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">
              Estimated Animal Body Weight:
            </span>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {bodyWeightKg} kg <span className="text-xs text-slate-400">({Math.round(bodyWeightKg * 2.2)} lbs)</span>
            </div>
          </div>

          <input
            type="range"
            min="40"
            max="650"
            step="10"
            value={bodyWeightKg}
            onChange={(e) => setBodyWeightKg(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 h-2 bg-black/60 rounded-lg cursor-pointer"
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setBodyWeightKg(50)}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-300 hover:text-white"
            >
              Goat / Buck (50kg)
            </button>
            <button
              onClick={() => setBodyWeightKg(120)}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-300 hover:text-white"
            >
              Small Calf (120kg)
            </button>
            <button
              onClick={() => setBodyWeightKg(250)}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-300 hover:text-white"
            >
              Heifer (250kg)
            </button>
            <button
              onClick={() => setBodyWeightKg(380)}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 font-bold"
            >
              Adult Desi / Crossbred Cow (380kg)
            </button>
            <button
              onClick={() => setBodyWeightKg(500)}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-300 hover:text-white"
            >
              Jaffrabadi / Murrah Buffalo (500kg)
            </button>
          </div>
        </div>

        {/* Calculated Dosage Table */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-black/40 to-teal-950/30 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase">
                Precise Gram Formulation
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">
                {recipe.conditionName} — for {bodyWeightKg} kg weight
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recipe.ingredients.map((ing, idx) => {
              const scaled = Math.round(ing.ratioPer100kg * weightFactor * 10) / 10;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-extrabold text-white">
                      {ing.name}
                    </div>
                    <div className="text-[10px] text-emerald-400/80 mt-0.5">{ing.purpose}</div>
                  </div>
                  <div className="text-right pl-3">
                    <div className="text-base font-black text-emerald-400 font-mono">
                      {scaled} {ing.unit}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ({ing.ratioPer100kg}{ing.unit} / 100kg)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preparation Instructions */}
          <div className="pt-2 space-y-2 border-t border-white/10">
            <div className="text-xs font-bold text-slate-300">
              Preparation & Administration Steps:
            </div>
            <div className="space-y-1 text-xs text-slate-300">
              {recipe.preparationSteps.en.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="font-mono text-emerald-400 font-bold">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Local Indian Crop Waste Feed Formulation */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
            <Wheat className="w-4 h-4 text-amber-400" />
            <span>Indian Crop-Waste Feed Balancing:</span>
          </div>
          <div className="text-sm font-bold text-white">
            {recipe.cropWasteFeedSupplement.title}
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 text-xs font-mono text-amber-200 border border-white/10">
            {recipe.cropWasteFeedSupplement.ratioBreakdown}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {recipe.cropWasteFeedSupplement.tips}
          </p>
        </div>

        {/* Peer-Reviewed Citation Footer */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>Source: {recipe.source} (NDDB Certified)</span>
        </div>
      </div>
    </div>
  );
}
