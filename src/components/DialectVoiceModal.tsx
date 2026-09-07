import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Radio,
  CornerDownLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { DIALECT_PROFILES } from '../data/dialectData';
import { SpeechVoiceManager } from '../utils/audio';

interface DialectVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchVoiceCommand?: (command: string, animal?: string) => void;
  onOpenMvu?: () => void;
  onOpenCalculator?: () => void;
  onOpenOutbreak?: () => void;
}

export function DialectVoiceModal({
  isOpen,
  onClose,
  onDispatchVoiceCommand,
  onOpenMvu,
  onOpenCalculator,
  onOpenOutbreak,
}: DialectVoiceModalProps) {
  const [selectedDialectKey, setSelectedDialectKey] = useState<string>('varhadi');
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [aiSpokenResponse, setAiSpokenResponse] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const dialect = DIALECT_PROFILES[selectedDialectKey] || DIALECT_PROFILES.puneri;

  useEffect(() => {
    if (isOpen) {
      setAiSpokenResponse(dialect.greetingText);
    } else {
      SpeechVoiceManager.stop();
      setIsPlayingAudio(false);
      setIsListening(false);
    }
  }, [isOpen, selectedDialectKey]);

  if (!isOpen) return null;

  // Speak AI response in authentic local dialect
  const handleSpeak = (text: string) => {
    if (isPlayingAudio) {
      SpeechVoiceManager.stop();
      setIsPlayingAudio(false);
      return;
    }

    const langCode = selectedDialectKey === 'hindi' ? 'hi' : 'mr';
    setIsPlayingAudio(true);
    SpeechVoiceManager.speakText(
      text,
      langCode,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  // Process voice input and trigger actions
  const processVoiceInput = (rawText: string) => {
    setSpeechTranscript(rawText);
    const lower = rawText.toLowerCase();

    let reply = '';
    if (lower.includes('ताप') || lower.includes('fever') || lower.includes('कण्हत')) {
      reply = dialect.sampleResponses.fever;
      if (onDispatchVoiceCommand) onDispatchVoiceCommand(rawText, 'Cow (गाय)');
    } else if (lower.includes('पोट') || lower.includes('फुग') || lower.includes('bloat') || lower.includes('गॅस') || lower.includes('अफरा')) {
      reply = dialect.sampleResponses.bloat;
      if (onDispatchVoiceCommand) onDispatchVoiceCommand(rawText, 'Cow (गाय)');
    } else if (lower.includes('लंपी') || lower.includes('गाठ') || lower.includes('nodule') || lower.includes('फोडे')) {
      reply = dialect.sampleResponses.lsd;
      if (onDispatchVoiceCommand) onDispatchVoiceCommand(rawText, 'Cow (गाय)');
    } else if (lower.includes('1962') || lower.includes('गाडी') || lower.includes('दवाखाना') || lower.includes('डॉक्टर')) {
      reply = dialect.sampleResponses.call1962;
      if (onOpenMvu) onOpenMvu();
    } else if (lower.includes('उपाय') || lower.includes('औषध') || lower.includes('प्रमाण')) {
      reply = dialect.sampleResponses.remedy;
      if (onOpenCalculator) onOpenCalculator();
    } else if (lower.includes('आजार') || lower.includes('गाव') || lower.includes('नकाशा')) {
      reply = 'तालुक्यातील आजारांचा हॉटस्पॉट नकाशा उघडत आहे. चिंचोली गावात लंपीचा प्रादुर्भाव आहे.';
      if (onOpenOutbreak) onOpenOutbreak();
    } else {
      reply = `समजले: "${rawText}". मी आपल्या जनावरासाठी प्राथमिक तपासणी नोंदवली आहे.`;
      if (onDispatchVoiceCommand) onDispatchVoiceCommand(rawText);
    }

    setAiSpokenResponse(reply);
    handleSpeak(reply);
  };

  // Toggle Live Microphone listening
  const handleToggleMic = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = selectedDialectKey === 'hindi' ? 'hi-IN' : 'mr-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          processVoiceInput(transcript);
          setIsListening(false);
        };
        recognition.onerror = () => {
          setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);

        recognition.start();
      } catch {
        setIsListening(false);
      }
    } else {
      // Simulated mic trigger for browsers without SpeechRecognition
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const sample = dialect.samplePhrases[0];
        processVoiceInput(sample);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#0C0E0B] border border-emerald-500/40 rounded-[28px] sm:rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
                  Regional Voice Assistant
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-black uppercase">
                  Dialect AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full Interactive Voice Navigation in Local Marathi Dialects
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

        {/* Dialect Selector Tabs */}
        <div>
          <label className="text-xs text-slate-400 font-bold block mb-2">
            Select Language Profile:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(DIALECT_PROFILES).map((p) => {
              const isSelected = p.id === selectedDialectKey;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedDialectKey(p.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs font-bold">{p.nativeName}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.region}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Spoken Conversation Bubble */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>{dialect.name} Engine Active</span>
            </div>
            <button
              onClick={() => handleSpeak(aiSpokenResponse)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs hover:bg-emerald-900 transition"
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/20 text-slate-100 text-sm leading-relaxed font-['Tiro_Devanagari_Marathi']">
            "{aiSpokenResponse}"
          </div>

          {speechTranscript && (
            <div className="text-xs text-slate-400 pl-2 border-l-2 border-emerald-500 flex items-center space-x-2">
              <span className="font-mono text-emerald-400 font-bold">You said:</span>
              <span>"{speechTranscript}"</span>
            </div>
          )}
        </div>

        {/* Main Microphone Button */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <button
            onClick={handleToggleMic}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 cursor-pointer ${
              isListening
                ? 'bg-red-600 border-4 border-red-400 animate-pulse text-white shadow-[0_0_35px_#ef4444]'
                : 'bg-emerald-600 hover:bg-emerald-500 border-4 border-emerald-400/50 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)]'
            }`}
          >
            {isListening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
          </button>
          <div className="text-xs text-slate-300 font-bold">
            {isListening ? 'Listening... speak now' : 'Tap Mic & Speak'}
          </div>
        </div>

        {/* Quick Dialect Phrases to Tap */}
        <div className="space-y-2">
          <div className="text-xs text-slate-400 font-bold flex items-center space-x-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sample Voice Commands:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dialect.samplePhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => processVoiceInput(phrase)}
                className="p-2.5 rounded-xl bg-black/40 hover:bg-white/10 border border-white/10 text-left text-xs text-slate-200 transition flex items-center justify-between group cursor-pointer"
              >
                <span className="truncate pr-2 font-['Tiro_Devanagari_Marathi']">{phrase}</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 opacity-60 group-hover:opacity-100 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
