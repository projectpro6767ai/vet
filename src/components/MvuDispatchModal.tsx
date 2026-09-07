import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  MapPin,
  Clock,
  ShieldAlert,
  Send,
  MessageSquare,
  Navigation,
  CheckCircle2,
  X,
  Share2,
  Truck,
  UserCheck,
} from 'lucide-react';
import { VetDiagnosisResponse, SupportedLanguage } from '../types';

interface MvuDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosis?: VetDiagnosisResponse | null;
  currentLang: SupportedLanguage;
}

export function MvuDispatchModal({
  isOpen,
  onClose,
  diagnosis,
  currentLang,
}: MvuDispatchModalProps) {
  const [etaMinutes, setEtaMinutes] = useState(18);
  const [dispatchStatus, setDispatchStatus] = useState<'DISPATCHED' | 'EN_ROUTE' | 'NEAR_FARM'>('EN_ROUTE');
  const [ticketId] = useState(`MVU-BRM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [mvuProgress, setMvuProgress] = useState(35); // percentage along the road

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setMvuProgress((prev) => {
        if (prev >= 85) return 85;
        return prev + 2;
      });
      setEtaMinutes((prev) => (prev > 5 ? prev - 1 : 5));
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const animal = diagnosis?.animal_identified || 'Dairy Cow (गाय)';
  const condition = diagnosis?.suspected_condition || 'Suspected Acute Livestock Emergency';
  const urgency = diagnosis?.urgency_badge || '🔴 RED';

  // Construct clinical WhatsApp & SMS dispatch payload
  const dispatchPayloadText = encodeURIComponent(
    `🚨 *1962 TALUKA VETERINARY EMERGENCY DISPATCH* 🚨\n` +
      `Ticket ID: ${ticketId}\n` +
      `Patient: ${animal}\n` +
      `Suspected Condition: ${condition}\n` +
      `Triage Urgency: ${urgency}\n` +
      `Location: Pimpalgaon Village (4.8km from Taluka VD-1)\n` +
      `First Aid Given: ${diagnosis?.first_aid_steps?.[0] || 'Cleaned and isolated'}\n` +
      `Recommended Store Product: ${diagnosis?.recommended_local_product || 'Basic Antiseptic'}\n` +
      `Reporting Time: ${new Date().toLocaleTimeString('en-IN')}\n\n` +
      `Please track via Vet-Mitra AI 1962 Telemetry.`
  );

  const handleOpenWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${dispatchPayloadText}`, '_blank');
  };

  const handleOpenSms = () => {
    window.open(`sms:1962?body=${dispatchPayloadText}`, '_blank');
  };

  const handleCall1962 = () => {
    window.open('tel:1962', '_self');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#0C0E0B] border border-red-500/40 rounded-[28px] sm:rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <Truck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
                  1962 MVU Live Dispatch Tracker
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500/50 text-red-300 text-[10px] font-mono font-black uppercase">
                  Active Mission
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Taluka Mobile Veterinary Unit (MVU) & Government Dispensary Direct Integration
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

        {/* Dispatch Mission Summary Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-red-900/40 to-black/60 border border-red-500/40 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono text-red-300 uppercase tracking-wider">
              Emergency Case Docket • {ticketId}
            </div>
            <div className="text-base font-extrabold text-white mt-0.5">
              {animal} — {condition}
            </div>
            <div className="text-xs text-slate-300 mt-0.5 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>Farmer Shed: Pimpalgaon Village • Taluka Baramati (4.8 km)</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-black/60 px-4 py-2.5 rounded-xl border border-white/10">
            <Clock className="w-5 h-5 text-amber-400 animate-spin" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Estimated Arrival</div>
              <div className="text-lg font-black text-white font-mono">{etaMinutes} Mins</div>
            </div>
          </div>
        </div>

        {/* Mock Live Dispatch Tracking Map (High Contrast Veterinary SVG) */}
        <div className="relative rounded-2xl bg-[#08100C] border border-white/10 p-4 sm:p-5 overflow-hidden shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
            <span className="font-mono text-emerald-400 flex items-center space-x-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>Taluka GPS Telemetry Map: Sector Baramati-Rural</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Speed: 42 km/h</span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative h-56 sm:h-64 w-full bg-[#040806] rounded-xl overflow-hidden border border-emerald-950 flex items-center justify-center">
            {/* Grid Lines */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#10b981 1px, #040806 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <svg className="w-full h-full" viewBox="0 0 600 240">
              {/* Road Network Path */}
              <path
                d="M 60 180 Q 180 80, 300 130 T 520 70"
                fill="none"
                stroke="#1e3a2f"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 60 180 Q 180 80, 300 130 T 520 70"
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                strokeDasharray="6 6"
              />

              {/* Start Point: Taluka Veterinary Dispensary */}
              <g transform="translate(60, 180)">
                <circle r="14" fill="#065f46" stroke="#34d399" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                  VD
                </text>
                <text x="0" y="26" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">
                  Dispensary HQ
                </text>
              </g>

              {/* Destination Point: Farmer's Barn */}
              <g transform="translate(520, 70)">
                <circle r="16" fill="#991b1b" stroke="#ef4444" strokeWidth="3" className="animate-ping" opacity="0.3" />
                <circle r="14" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                  SOS
                </text>
                <text x="0" y="26" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">
                  Farmer Shed (Pimpalgaon)
                </text>
              </g>

              {/* Moving 1962 MVU Vehicle */}
              {/* Interpolated position based on progress */}
              <g
                transform={`translate(${
                  60 + (520 - 60) * (mvuProgress / 100)
                }, ${
                  180 +
                  (70 - 180) * (mvuProgress / 100) +
                  Math.sin((mvuProgress / 100) * Math.PI) * -35
                })`}
              >
                <circle r="18" fill="#ef4444" opacity="0.2" className="animate-ping" />
                <rect x="-16" y="-12" width="32" height="24" rx="6" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                  1962
                </text>
                <text x="0" y="-16" textAnchor="middle" fill="#fef08a" fontSize="8" fontWeight="bold">
                  MVU En Route
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Assigned MVU Team Personnel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-xs text-slate-400">Veterinary Officer (LDO)</div>
            <div className="text-sm font-bold text-white flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Dr. Ramesh Patil</span>
            </div>
            <div className="text-[11px] text-emerald-400">B.V.Sc & A.H. (Baramati Zone)</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-xs text-slate-400">Assigned MVU Unit</div>
            <div className="text-sm font-bold text-white font-mono">MH-12-VT-1962</div>
            <div className="text-[11px] text-slate-400">Equipped with Emergency Meds</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-xs text-slate-400">Driver & Paravet Lead</div>
            <div className="text-sm font-bold text-white">M. R. Shinde</div>
            <div className="text-[11px] text-slate-400">Direct Comms: +91 98221 01962</div>
          </div>
        </div>

        {/* Direct Dispatch Communication Actions */}
        <div className="space-y-2.5 pt-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            One-Click Multi-Channel Escalation (SMS & WhatsApp API)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send via WhatsApp API</span>
            </button>

            <button
              onClick={handleOpenSms}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-lg cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Send SOS SMS to 1962</span>
            </button>

            <button
              onClick={handleCall1962}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-lg cursor-pointer active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 1962 Helpline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
