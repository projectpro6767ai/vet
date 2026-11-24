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
import { UI_STRINGS } from '../data/translations';

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
  const t = UI_STRINGS[currentLang];

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
                  {t.vaccinationTrackerTitle}
                </span>
                <span className="text-[10px] font-mono uppercase bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  {t.vaccinationFreeBadge}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t.vaccinationTrackerSub}
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
              <span>{t.upcomingDrives}</span>
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
              <span>{t.subsidiesLoans}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300">
            <span className="font-mono text-emerald-400 text-[11px]">{t.smsAlertPhone}</span>
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
                {t.smsSubscribed}{farmerPhone}{t.willGetAlert}
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
                            {t.freeGovtDose}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30">
                          {drive.daysRemaining === 2 ? t.activeNow : `${t.inDays}${drive.daysRemaining}${t.days}`}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white mt-1">
                        {currentLang === 'mr' ? drive.diseaseMarathi : currentLang === 'hi' ? drive.diseaseHi : drive.diseaseName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {t.vaccineNameLabel}: <strong className="text-slate-200">{currentLang === 'mr' ? drive.vaccineNameMarathi : currentLang === 'hi' ? drive.vaccineNameHi : drive.vaccineName}</strong> • {currentLang === 'mr' ? drive.frequencyMarathi : currentLang === 'hi' ? drive.frequencyHi : drive.frequency}
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
                      <span>{isSubscribed ? t.smsSubscribedBadge : t.remindBySms}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">
                        {t.targetAnimalsLabel}:
                      </span>
                      <span>{currentLang === 'mr' ? drive.targetAnimalsMarathi : currentLang === 'hi' ? drive.targetAnimalsHi : drive.targetAnimals}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">
                        {t.campLocationLabel}:
                      </span>
                      <span>{currentLang === 'mr' ? drive.talukaCampLocationMarathi : currentLang === 'hi' ? drive.talukaCampLocationHi : drive.talukaCampLocation}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] text-amber-300/90 flex items-start space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span><strong>{t.precautionsLabel}:</strong> {currentLang === 'mr' ? drive.precautionsMarathi : currentLang === 'hi' ? drive.precautionsHi : drive.precautions}</span>
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
                    {t.interestSubvention}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {t.net4Interest}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  {t.pkccTitle}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.pkccDesc}
                </p>
                <div className="text-[11px] text-emerald-300 font-mono pt-1">
                  {t.pkccRequired}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121914] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-500/40">
                    {t.capitalSubsidy}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {t.govtGrant50}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  {t.nlmTitle}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.nlmDesc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#121914] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-500/40">
                    {t.stateScheme}
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {t.subsidy75}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  {t.goatSchemeTitle}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.goatSchemeDesc}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 bg-black/50">
          <span className="text-[11px] text-slate-400">
            {t.officialIntegration}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
