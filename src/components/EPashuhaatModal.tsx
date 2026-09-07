import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  FileText,
  CreditCard,
  Layers,
} from 'lucide-react';
import { SupportedLanguage, EPashuhaatService } from '../types';
import { E_PASHUHAAT_SERVICES } from '../data/ecosystemData';

interface EPashuhaatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
}

export function EPashuhaatModal({
  isOpen,
  onClose,
  currentLang,
}: EPashuhaatModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = [
    { key: 'ALL', label: 'All Services' },
    { key: 'AI_TECHNICIAN', label: 'AI Technicians' },
    { key: 'INSURANCE', label: 'Livestock Insurance' },
    { key: 'BREEDING_BULL', label: 'Breeding Bulls' },
    { key: 'SUBSIDY', label: 'Subsidies & Loans' },
  ];

  const filteredServices = E_PASHUHAAT_SERVICES.filter(
    (s) => activeCategory === 'ALL' || s.category === activeCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0F1410] border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-emerald-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center space-x-2 font-['Outfit']">
                <span>
                  E-Pashuhaat & Livestock Insurance Integration
                </span>
                <span className="text-[10px] font-mono uppercase bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  DAHD / NDDB
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Connect to verified doorstep AI technicians, 70% subsidized insurance & pedigree bulls
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

        {/* Category Tabs */}
        <div className="px-5 pt-3 pb-2 flex items-center space-x-2 overflow-x-auto border-b border-white/10 text-xs">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeCategory === c.key
                  ? 'bg-emerald-600 text-black shadow-md'
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Services List */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="p-4 rounded-2xl bg-[#121914] border border-white/10 hover:border-emerald-500/40 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      {service.badge}
                    </span>
                    <span className="text-xs text-slate-400">
                      {service.location}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white mt-1">
                    {service.title}
                  </h4>
                  <p className="text-xs text-emerald-400 font-medium">
                    {service.provider}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:${service.contactNumber.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs transition cursor-pointer shadow-md"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Helpline</span>
                  </a>

                  <a
                    href={service.officialPortalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition"
                    title="Open Official Portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Service Highlights List */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                {service.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 bg-black/50">
          <span className="text-[11px] text-slate-400">
            Official integration with Department of Animal Husbandry & Dairying (DAHD)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
