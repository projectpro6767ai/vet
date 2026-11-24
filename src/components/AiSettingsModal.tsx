import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertCircle, RefreshCw, Zap, ShieldAlert, X } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
}

export function AiSettingsModal({ isOpen, onClose, currentLang }: AiSettingsModalProps) {
  const [groqConfigured, setGroqConfigured] = useState<boolean>(true);
  const [groqModel, setGroqModel] = useState<string>('openai/gpt-oss-120b');
  const [testResults, setTestResults] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        setGroqConfigured(Boolean(data.groqConfigured));
        if (data.groqModel) setGroqModel(data.groqModel);
      }
    } catch (err) {
      console.error('Failed to fetch AI status:', err);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResults(null);
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'groq' }),
      });
      const data = await res.json();
      setTestResults({
        success: data.success,
        message: data.message || (data.success ? 'Connection verified successfully!' : 'Connection test failed'),
      });
    } catch (err: any) {
      setTestResults({
        success: false,
        message: err.message || 'Network error testing connection',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  const labels = {
    en: {
      title: 'Groq AI Engine & Status',
      subtitle: 'Vet-Mitra AI High-Speed Inference Engine (Groq)',
      primaryDesc: 'All veterinary diagnoses, presets, and symptom analyses run securely via Groq AI on the backend server.',
      groqTitle: 'Groq AI (Active Engine)',
      configured: 'API Key Active on Backend',
      notConfigured: 'API Key Missing',
      testBtn: 'Test Connection',
      testing: 'Testing...',
      currentPrimary: 'Active Engine',
      fallbackInfo: 'Offline & Resilience Guarantee: If network connectivity is unavailable, Vet-Mitra AI seamlessly falls back to the On-Device Clinical Rule Engine.',
      close: 'Close',
    },
    hi: {
      title: 'Groq AI इंजन और स्थिति',
      subtitle: 'वेट-मित्र एआई हाई-स्पीड इन्फरेंस इंजन (Groq)',
      primaryDesc: 'सभी पशु चिकित्सा निदान, प्रीसेट और लक्षण विश्लेषण बैकएंड सर्वर पर Groq AI के माध्यम से सुरक्षित रूप से चलते हैं।',
      groqTitle: 'Groq AI (सक्रिय इंजन)',
      configured: 'API कुंजी बैकएंड पर सक्रिय',
      notConfigured: 'API कुंजी अनुपलब्ध',
      testBtn: 'कनेक्शन परीक्षण करें',
      testing: 'परीक्षण जारी है...',
      currentPrimary: 'सक्रिय इंजन',
      fallbackInfo: 'ऑफलाइन गारंटी: यदि नेटवर्क उपलब्ध नहीं है, तो वेट-मित्र एआई स्वचालित रूप से ऑन-डिवाइस क्लिनिकल रूल इंजन का उपयोग करता है।',
      close: 'बंद करें',
    },
    mr: {
      title: 'Groq AI इंजिन आणि स्थिती',
      subtitle: 'वेट-मित्र AI हाय-स्पीड इन्फरन्स इंजिन (Groq)',
      primaryDesc: 'सर्व पशुवैद्यकीय निदान, प्रीसेट आणि लक्षणांचे विश्लेषण बॅकएंड सर्व्हरवर Groq AI द्वारे सुरक्षितपणे चालते.',
      groqTitle: 'Groq AI (सक्रिय इंजिन)',
      configured: 'API की बॅकएंडवर सक्रिय',
      notConfigured: 'API की अनुपलब्ध',
      testBtn: 'कनेक्शन तपासा',
      testing: 'तपासत आहे...',
      currentPrimary: 'सक्रिय इंजिन',
      fallbackInfo: 'ऑफलाइन हमी: इंटरनेट उपलब्ध नसल्यास, वेट-मित्र AI आपोआप ऑन-डिव्हाइस क्लिनिकल रूल इंजिन वापरते.',
      close: 'बंद करा',
    },
  };

  const l = labels[currentLang] || labels.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#121614] border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-950/40 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">{l.title}</h2>
              <p className="text-xs text-slate-400">{l.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <p className="text-sm text-slate-300 bg-white/5 p-3.5 rounded-xl border border-white/10 leading-relaxed">
            {l.primaryDesc}
          </p>

          {/* Groq Provider Card */}
          <div className="p-4 rounded-xl border bg-emerald-950/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-emerald-400 text-sm flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>{l.groqTitle}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
                {l.currentPrimary}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-3">Model: {groqModel}</p>
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center space-x-1.5 text-xs">
                <CheckCircle2 className={`w-3.5 h-3.5 ${groqConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className={groqConfigured ? 'text-emerald-300' : 'text-amber-300'}>
                  {groqConfigured ? l.configured : l.notConfigured}
                </span>
              </div>
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isTesting ? l.testing : l.testBtn}</span>
              </button>
            </div>
          </div>

          {/* Test Results Banner */}
          {testResults && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center space-x-3 animate-fadeIn ${
              testResults.success
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/40 border-red-500/50 text-red-200'
            }`}>
              {testResults.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <div className="font-mono">
                <span className="font-bold uppercase tracking-wider">GROQ: </span>
                <span>{testResults.message}</span>
              </div>
            </div>
          )}

          {/* Fallback Architecture Info */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start space-x-3 text-xs leading-relaxed text-slate-300">
            <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p>{l.fallbackInfo}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
          >
            {l.close}
          </button>
        </div>
      </div>
    </div>
  );
}
