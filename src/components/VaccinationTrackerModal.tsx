import React, { useState } from 'react';
import {
  X,
  Calendar,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  Coins,
  FileCheck,
} from 'lucide-react';
import { SupportedLanguage, VaccinationDriveItem } from '../types';
import { VACCINATION_DRIVES } from '../data/ecosystemData';

interface VaccinationTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
}

export function VaccinationTrackerModal({
  isOpen,
  onClose,
  currentLang,
}: VaccinationTrackerModalProps) {
  const [subscribedDrives, setSubscribedDrives] = useState<string[]>(['vac-fmd', 'vac-lumpy']);
  const [farmerPhone, setFarmerPhone] = useState<string>('98220 12345');
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'SUBSIDIES'>('CALENDAR');
  const [showSmsToast, setShowSmsToast] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleSubscription = (id: string) => {
    if (subscribedDrives.includes(id)) {
      setSubscribedDrives(subscribedDrives.filter((d) => d !== id));
    } else {
      setSubscribedDrives([...subscribedDrives, id]);
      setShowSmsToast(true);
      setTimeout(() => setShowSmsToast(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0F1410] border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-emerald-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center space-x-2 font-['Outfit']">
                <span>
                  Government Vaccination Calendar & Subsidy Tracker
                </span>
                <span className="text-[10px] font-mono uppercase bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  NADCP 100% Free
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Track mandatory state vaccination drives with automated SMS reminders
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

        {/* Tab Selector */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/40">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('CALENDAR')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'CALENDAR'
                  ? 'bg-emerald-600 text-black shadow-md'
                  : 'bg-white/5 text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Vaccination Drives</span>
            </button>

            <button
              onClick={() => setActiveTab('SUBSIDIES')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'SUBSIDIES'
                  ? 'bg-emerald-600 text-black shadow-md'
                  : 'bg-white/5 text-slate-300 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Govt Subsidies & PKCC</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300">
            <span className="font-mono text-emerald-400 text-[11px]">SMS Alert Phone:</span>
            <input
              type="text"
              value={farmerPhone}
              onChange={(e) => setFarmerPhone(e.target.value)}
              className="w-28 px-2 py-1 rounded-lg bg-black border border-white/20 text-white font-mono text-[11px] focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {showSmsToast && (
          <div className="px-5 py-2 bg-emerald-950/80 border-b border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Free SMS Reminder subscribed for +91 {farmerPhone}! You will get an alert 3 days before the camp.
              </span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'CALENDAR' ? (
            VACCINATION_DRIVES.map((drive) => {
              const isSubscribed = subscribedDrives.includes(drive.id);
              return (
                <div
                  key={drive.id}
                  className="p-4 rounded-2xl bg-[#121914] border border-white/10 hover:border-emerald-500/40 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        {drive.isGovernmentFree && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                            100% Free Govt Drive
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30">
                          {drive.daysRemaining === 2 ? 'Active Now' : `In ${drive.daysRemaining} Days`}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white mt-1">
                        {drive.diseaseName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Vaccine: <strong className="text-slate-200">{drive.vaccineName}</strong> • {drive.frequency}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleSubscription(drive.id)}
                      className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isSubscribed
                          ? 'bg-emerald-500 text-black shadow-md'
                          : 'bg-white/10 hover:bg-white/15 text-white'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{isSubscribed ? 'SMS Subscribed ✓' : 'Remind by SMS'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">
                        Target Animals:
                      </span>
                      <span>{drive.targetAnimals}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">
                        Camp Location:
                      </span>
                      <span>{drive.talukaCampLocation}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] text-amber-300/90 flex items-start space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span><strong>Precaution:</strong> {drive.precautions}</span>
                  </div>
                </div>
              );
            })
          ) : (
            /* Subsidies Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#121914] border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    Interest Subvention
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Net 4% Interest
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  Pashu Kisan Credit Card (PKCC)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Provides collateral-free working capital loan up to ₹1,60,000 (and up to ₹2,00,000 with simple hypothecation) for fodder, medicines, and breeding maintenance. Interest rate reduced from 7% to 4% upon timely repayment.
                </p>
                <div className="text-[11px] text-emerald-300 font-mono pt-1">
                  Required: Aadhaar Card, 7/12 land extract, and Veterinary Vaccination Certificate.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121914] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-500/40">
                    Capital Subsidy
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-400">
                    50% Govt Grant
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  National Livestock Mission (NLM) Fodder & Breed Hub
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  50% capital subsidy (up to ₹50 Lakh) for establishing automated silage baling plants, fodder seed production farms, and certified goat/sheep breeding centers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#121914] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-500/40">
                    Maharashtra State Scheme
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-400">
                    75% Subsidy
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  Punyashlok Ahilyabai Holkar Goat & Sheep Development Scheme
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  75% subsidy for 10+1 Osmanabadi / Sangamneri goat units for rural landless farmers, women self-help groups, and smallholders.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 bg-black/50">
          <span className="text-[11px] text-slate-400">
            Automated calendar synchronized with Commissionerate of Animal Husbandry, Pune
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
