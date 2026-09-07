import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Volume2,
  MessageSquare,
  Radio,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { SupportedLanguage, VetDiagnosisResponse } from '../types';

interface IvrRelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosis: VetDiagnosisResponse | null;
  currentLang: SupportedLanguage;
}

export function IvrRelayModal({
  isOpen,
  onClose,
  diagnosis,
  currentLang,
}: IvrRelayModalProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>('98220 12345');
  const [selectedDialect, setSelectedDialect] = useState<string>('mr-varhadi');
  const [callState, setCallState] = useState<
    'IDLE' | 'DIALING' | 'RINGING' | 'CONNECTED' | 'COMPLETED'
  >('IDLE');
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  if (!isOpen) return null;

  const defaultVoiceScriptMarathi =
    diagnosis?.local_voice_script_marathi ||
    'रामराम शेतकरी बंधूंनो, वेट-मित्र एआय कडून संदेश. आपल्या जनावराच्या पोटातील गॅस कमी करण्यासाठी ओवा, हिंग आणि सैंधव मिठाचा काढा कोमट पाण्यात द्या. जर पोट ढोलासारखे फुगले असेल तर तातडीने १९६२ वर कॉल करून सरकारी डॉक्टरांना बोलवा.';

  const handleStartIvrCall = () => {
    setCallState('DIALING');
    setCallSeconds(0);

    setTimeout(() => {
      setCallState('RINGING');
    }, 1200);
  };

  const handleAcceptCall = () => {
    setCallState('CONNECTED');
    setCallSeconds(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);

    // Speak audio
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(defaultVoiceScriptMarathi);
      utterance.lang = 'mr-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsAudioSpeaking(true);
      utterance.onend = () => {
        setIsAudioSpeaking(false);
        setTimeout(() => {
          handleEndCall();
        }, 1500);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        handleEndCall();
      }, 8000);
    }
  };

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCallState('COMPLETED');
    setIsAudioSpeaking(false);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCallState('IDLE');
    setCallSeconds(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0F1310] border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-emerald-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <PhoneIncoming className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center space-x-2 font-['Outfit']">
                <span>
                  {currentLang === 'hi'
                    ? 'मिस्ड-कॉल ऑडियो रिले (कीपैड फोन के लिए)'
                    : currentLang === 'mr'
                    ? 'मिस-कॉल ऑडिओ रिले (साध्या कीपॅड फोनसाठी)'
                    : 'Offline Missed-Call & IVR Voice Relay'}
                </span>
                <span className="text-[10px] font-mono uppercase bg-emerald-900/90 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Feature Phone 2G
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {currentLang === 'hi'
                  ? 'बिना स्मार्टफोन या इंटरनेट के किसान के फोन पर ऑटोमेटेड ऑडियो कॉल व एसएमएस'
                  : currentLang === 'mr'
                  ? 'स्मार्टफोन नसलेल्या शेतकऱ्यांच्या साध्या मोबाईलवर स्वयंचलित व्हॉइस कॉल व सल्ला'
                  : 'Automated dial-back delivering vernacular Marathi/Hindi diagnostic voice call'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleEndCall();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Toll-Free Missed Call Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 block">
                  Toll-Free Farmer IVR Gateway
                </span>
                <span className="text-lg font-black text-white font-mono tracking-wider">
                  1800-266-1962 <span className="text-xs font-normal text-slate-400">(Toll Free)</span>
                </span>
              </div>
            </div>

            <span className="text-xs text-emerald-400 bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-bold">
              Give 1 Ring $\rightarrow$ Instant Auto Callback
            </span>
          </div>

          {/* Interactive Feature Phone Simulator & Trigger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* Left: Input Form */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  {currentLang === 'hi' ? 'किसान का मोबाइल नंबर दर्ज करें:' : currentLang === 'mr' ? 'शेतकऱ्याचा मोबाईल नंबर टाका:' : "Farmer's Mobile Phone Number:"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">+91</span>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter 10 digit number"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  {currentLang === 'hi' ? 'ऑडियो कॉल की बोली भाषा:' : currentLang === 'mr' ? 'कॉलची बोलीभाषा निवडा:' : 'Select Spoken Dialect:'}
                </label>
                <select
                  value={selectedDialect}
                  onChange={(e) => setSelectedDialect(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="mr-varhadi">वऱ्हाडी मराठी (विदर्भ - Varhadi)</option>
                  <option value="mr-puneri">प्रमाण मराठी (पश्चिम महाराष्ट्र)</option>
                  <option value="mr-khandeshi">अहिराणी / खानदेशी (उत्तर महाराष्ट्र)</option>
                  <option value="mr-marathwadi">मराठवाडी बोली (मराठवाडा)</option>
                  <option value="hi-dehati">देहाती सरल हिन्दी</option>
                </select>
              </div>

              {/* Call Trigger Button */}
              {callState === 'IDLE' && (
                <button
                  onClick={handleStartIvrCall}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-sm flex items-center justify-center space-x-2 transition cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>
                    {currentLang === 'hi' ? 'ऑटोमेटेड कॉल भेजें' : currentLang === 'mr' ? 'कॉल पाठवा (कॉल बॅक करा)' : 'Trigger Automated Callback'}
                  </span>
                </button>
              )}

              {callState === 'COMPLETED' && (
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
                >
                  Test Another Call / Reset
                </button>
              )}

              {/* Script Preview Box */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300">
                <span className="text-[10px] text-emerald-400 font-mono uppercase block mb-1">
                  Audio Script to be Relayed:
                </span>
                <p className="line-clamp-3 italic text-slate-300 leading-relaxed">
                  "{defaultVoiceScriptMarathi}"
                </p>
              </div>
            </div>

            {/* Right: Virtual Feature Phone Interactive Screen */}
            <div className="flex justify-center">
              <div className="w-64 bg-[#1b221d] rounded-4xl p-3 border-4 border-slate-700 shadow-2xl relative">
                {/* Speaker Grill */}
                <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto mb-2"></div>

                {/* Feature Phone Screen */}
                <div className="w-full aspect-4/5 bg-[#08120b] border-2 border-emerald-950 rounded-2xl p-3 flex flex-col justify-between overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400 border-b border-emerald-900/40 pb-1">
                    <span>Jio 2G • 4 Bars</span>
                    <span>12:45 PM</span>
                  </div>

                  {/* Call State Views */}
                  {callState === 'IDLE' && (
                    <div className="text-center my-auto space-y-2">
                      <Smartphone className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-[11px] text-slate-400">
                        Feature Phone Idle (Ready to receive voice triage)
                      </p>
                    </div>
                  )}

                  {callState === 'DIALING' && (
                    <div className="text-center my-auto space-y-2">
                      <div className="w-3 h-3 rounded-full bg-amber-400 mx-auto animate-ping"></div>
                      <p className="text-xs text-amber-300 font-bold">Connecting IVR Trunk...</p>
                      <span className="text-[10px] text-slate-400">1800-266-1962</span>
                    </div>
                  )}

                  {callState === 'RINGING' && (
                    <div className="text-center my-auto space-y-2 animate-bounce">
                      <div className="p-3 bg-red-500 text-white rounded-full w-12 h-12 mx-auto flex items-center justify-center shadow-lg">
                        <PhoneIncoming className="w-6 h-6 animate-pulse" />
                      </div>
                      <p className="text-xs font-black text-white">INCOMING CALL</p>
                      <p className="text-[11px] text-emerald-400 font-mono">वेट-मित्र एआय (1962)</p>
                      <p className="text-[9px] text-slate-400">Maharashtra Govt Tele-Vet</p>
                    </div>
                  )}

                  {callState === 'CONNECTED' && (
                    <div className="text-center my-auto space-y-2">
                      <div className="flex items-center justify-center space-x-1.5 text-emerald-400">
                        <Volume2 className="w-5 h-5 animate-pulse" />
                        <span className="text-xs font-mono font-bold">
                          {Math.floor(callSeconds / 60)}:{(callSeconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white">
                        {isAudioSpeaking ? 'ऐकत आहे... (Speaking)' : 'कॉल सुरू आहे'}
                      </p>
                      <div className="w-full bg-emerald-950/60 rounded-lg p-1.5 text-[10px] text-emerald-300 border border-emerald-500/30">
                        मराठी ऑडिओ सल्ला चालू आहे
                      </div>
                    </div>
                  )}

                  {callState === 'COMPLETED' && (
                    <div className="text-center my-auto space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs font-bold text-white">कॉल समाप्त</p>
                      <div className="p-1.5 rounded bg-emerald-950 border border-emerald-500/40 text-[9px] text-emerald-200">
                        <MessageSquare className="w-3 h-3 inline mr-1 text-emerald-400" />
                        SMS Delivered to +91 {phoneNumber}
                      </div>
                    </div>
                  )}

                  {/* Softkey Action Buttons */}
                  <div className="border-t border-emerald-900/40 pt-1.5 flex items-center justify-between text-[10px] font-bold">
                    {callState === 'RINGING' ? (
                      <>
                        <button
                          onClick={handleAcceptCall}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded font-extrabold hover:bg-emerald-500"
                        >
                          Answer (उचला)
                        </button>
                        <button
                          onClick={handleEndCall}
                          className="px-2.5 py-1 bg-red-600 text-white rounded font-extrabold hover:bg-red-500"
                        >
                          Reject
                        </button>
                      </>
                    ) : callState === 'CONNECTED' ? (
                      <button
                        onClick={handleEndCall}
                        className="w-full py-1 bg-red-600 text-white rounded font-extrabold flex items-center justify-center space-x-1"
                      >
                        <PhoneOff className="w-3 h-3" />
                        <span>Cut Call (बंद करा)</span>
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[9px] mx-auto">Menu • Contacts</span>
                    )}
                  </div>
                </div>

                {/* Keypad simulation */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 px-1 text-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((k) => (
                    <div
                      key={k}
                      className="bg-slate-800 text-slate-300 py-1 rounded text-[10px] font-mono font-bold"
                    >
                      {k}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 bg-black/50">
          <span className="text-[11px] text-slate-400">
            Backed by National Rural Telephony & CDAC Indian Language TTS Engine
          </span>
          <button
            onClick={() => {
              handleEndCall();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
