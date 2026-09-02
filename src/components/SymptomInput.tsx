import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import {
  Camera,
  Upload,
  Mic,
  Square,
  Sparkles,
  Trash2,
  X,
  Volume2,
  AlertCircle,
  FileImage,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { UI_STRINGS, COMMON_SYMPTOMS_LIST } from '../data/translations';

interface SymptomInputProps {
  currentLang: SupportedLanguage;
  selectedAnimal: string;
  onSelectAnimal: (animal: string) => void;
  symptomsText: string;
  setSymptomsText: (text: string) => void;
  imagePreview: string | null;
  setImagePreview: (img: string | null) => void;
  imageMimeType: string;
  setImageMimeType: (mime: string) => void;
  audioBase64: string | null;
  setAudioBase64: (audio: string | null) => void;
  audioMimeType: string;
  setAudioMimeType: (mime: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export function SymptomInput({
  currentLang,
  selectedAnimal,
  onSelectAnimal,
  symptomsText,
  setSymptomsText,
  imagePreview,
  setImagePreview,
  imageMimeType,
  setImageMimeType,
  audioBase64,
  setAudioBase64,
  audioMimeType,
  setAudioMimeType,
  onAnalyze,
  isLoading,
}: SymptomInputProps) {
  const t = UI_STRINGS[currentLang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Camera Live Modal state
  const [showLiveCam, setShowLiveCam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Speech Recognition fallback (Web Speech API) for real-time text transcription as well
  const speechRecRef = useRef<any>(null);

  const startLiveCamera = async () => {
    try {
      setShowLiveCam(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Live camera access failed, fallback to file picker:', err);
      setShowLiveCam(false);
      cameraInputRef.current?.click();
    }
  };

  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(dataUrl);
        setImageMimeType('image/jpeg');
      }
    }
    stopLiveCamera();
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowLiveCam(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const startVoiceRecording = async () => {
    setMicError(null);
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine preferred mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const detectedMime = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, {
          type: detectedMime,
        });
        setAudioMimeType(detectedMime);

        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setAudioBase64(reader.result as string);
          }
        };
        reader.readAsDataURL(audioBlob);

        // stop tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(250); // collect chunks every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Live speech recognition if browser supports it
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang =
            currentLang === 'hi'
              ? 'hi-IN'
              : currentLang === 'mr'
              ? 'mr-IN'
              : 'en-IN';
          rec.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              transcript += event.results[i][0].transcript;
            }
            if (transcript.trim()) {
              setSymptomsText(
                symptomsText
                  ? `${symptomsText} ${transcript.trim()}`
                  : transcript.trim()
              );
            }
          };
          rec.start();
          speechRecRef.current = rec;
        } catch (e) {
          console.log('Speech recognition not active');
        }
      }
    } catch (err: any) {
      console.error('Microphone error:', err);
      setMicError(
        currentLang === 'hi'
          ? 'माइक्रोफ़ोन अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक की अनुमति दें।'
          : currentLang === 'mr'
          ? 'मायक्रोफोन परवानगी मिळाली नाही. कृपया ब्राउझरमध्ये माइक सुरू करा.'
          : 'Microphone permission denied. Please allow microphone access in browser.'
      );
    }
  };

  const stopVoiceRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch (e) {}
      speechRecRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
  };

  const togglePlayAudio = () => {
    if (!audioBase64) return;
    if (isPlayingAudio && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const addTag = (text: string) => {
    if (symptomsText.includes(text)) return;
    setSymptomsText(
      symptomsText ? `${symptomsText}; ${text}` : text
    );
  };

  const handleClearInputs = () => {
    setSymptomsText('');
    setImagePreview(null);
    setImageMimeType('');
    setAudioBase64(null);
    setAudioMimeType('');
    setMicError(null);
    if (isRecording) {
      stopVoiceRecording();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  const hasInputs = Boolean(symptomsText || imagePreview || audioBase64);

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] border border-white/10 p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Top Header with Clear Inputs Shortcut */}
      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>
            {currentLang === 'hi'
              ? 'लक्षण व जांच इनपुट'
              : currentLang === 'mr'
              ? 'लक्षण व तपासणी इनपुट'
              : 'Case Symptoms & Input Diagnostics'}
          </span>
        </div>

        {hasInputs && (
          <button
            type="button"
            onClick={handleClearInputs}
            className="flex items-center space-x-1.5 px-3 py-1 text-xs font-bold bg-white/5 hover:bg-red-950/80 hover:text-red-300 hover:border-red-500/40 border border-white/10 rounded-xl text-slate-400 transition cursor-pointer active:scale-95"
            title="Clear all entered symptoms, photo, and voice notes"
          >
            <RotateCcw className="w-3 h-3" />
            <span>
              {currentLang === 'hi'
                ? 'सभी इनपुट साफ करें (Clear Log)'
                : currentLang === 'mr'
                ? 'सर्व इनपुट पुसा (Clear Log)'
                : 'Clear Inputs'}
            </span>
          </button>
        )}
      </div>

      {/* 2. Photo / Fodder Upload Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm sm:text-base font-bold text-slate-100 flex items-center space-x-2.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 text-xs flex items-center justify-center font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              2
            </span>
            <span className="tracking-tight">{t.uploadPhoto}</span>
          </label>
          <span className="text-xs font-mono text-slate-400">
            {currentLang === 'hi'
              ? 'त्वचा, खुर, थन या चारे की तस्वीर'
              : currentLang === 'mr'
              ? 'त्वचा, खूर किंवा चाऱ्याचे चित्र'
              : 'Skin, hooves, udder, or feed sample'}
          </span>
        </div>

        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Image Preview with HUD Scanner Reticle or Dropzone */}
        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-black/60 shadow-[0_0_30px_rgba(16,185,129,0.2)] group">
            {/* Viewfinder Corner HUD brackets */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400 pointer-events-none z-10"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400 pointer-events-none z-10"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400 pointer-events-none z-10"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400 pointer-events-none z-10"></div>

            <img
              src={imagePreview}
              alt="Livestock Symptom"
              className="w-full max-h-80 object-contain mx-auto bg-black/80"
            />
            <div className="absolute top-3 right-3 z-20 flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImageMimeType('');
                }}
                className="p-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-lg shadow-lg transition active:scale-95 cursor-pointer"
                title={t.removePhoto}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-emerald-400 flex items-center space-x-2 border border-emerald-500/40 font-mono">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>
                {currentLang === 'hi'
                  ? 'फोटो संलग्न है • AI विश्लेषण हेतु तैयार'
                  : currentLang === 'mr'
                  ? 'फोटो जोडला आहे • AI विश्लेषणासाठी सज्ज'
                  : 'SAMPLE ACQUIRED • READY FOR DIAGNOSTIC'}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={startLiveCamera}
              className="flex items-center justify-center space-x-3 p-4 sm:p-5 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 transition cursor-pointer group shadow-[0_0_15px_rgba(16,185,129,0.05)]"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-white">{t.cameraBtn}</div>
                <div className="text-[11px] text-emerald-400/80">
                  {currentLang === 'hi'
                    ? 'लाइव HUD स्कैनर से फोटो खींचें'
                    : currentLang === 'mr'
                    ? 'थेट कॅमेऱ्याने फोटो काढा'
                    : 'Open Live Viewfinder Scanner'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center space-x-3 p-4 sm:p-5 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 group-hover:scale-110 transition">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-white">{t.uploadBtn}</div>
                <div className="text-[11px] text-slate-400">
                  {currentLang === 'hi'
                    ? 'गैलरी से फोटो चुनें'
                    : currentLang === 'mr'
                    ? 'गॅलरीतून फोटो निवडा'
                    : 'Upload image from storage'}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Live Camera Modal (HUD Viewfinder with Corner Brackets) */}
      {showLiveCam && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#0C0E0B] rounded-3xl overflow-hidden border border-emerald-500/40 shadow-2xl">
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold">
                  HUD LIVE SCANNER
                </span>
              </div>
              <button
                onClick={stopLiveCamera}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
              {/* Corner HUD Overlay */}
              <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-emerald-400 pointer-events-none z-10"></div>
              <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-emerald-400 pointer-events-none z-10"></div>
              <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-emerald-400 pointer-events-none z-10"></div>
              <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-emerald-400 pointer-events-none z-10"></div>
              
              {/* Reticle center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 text-center">
                <div className="w-24 h-24 border border-emerald-400/40 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mt-1 block">
                  ALIGN SYMPTOM
                </span>
              </div>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-center space-x-4">
              <button
                type="button"
                onClick={captureCameraPhoto}
                className="flex items-center space-x-2 px-7 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>
                  {currentLang === 'hi'
                    ? 'फोटो खींचें (Capture)'
                    : currentLang === 'mr'
                    ? 'फोटो काढा'
                    : 'Capture Photo'}
                </span>
              </button>
              <button
                type="button"
                onClick={stopLiveCamera}
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {currentLang === 'hi' ? 'रद्द करें' : currentLang === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Symptoms Description & Voice Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-sm sm:text-base font-bold text-slate-100 flex items-center space-x-2.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 text-xs flex items-center justify-center font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              3
            </span>
            <span className="tracking-tight">{t.voiceOrText}</span>
          </label>

          {/* Voice Record Action Buttons */}
          <div className="flex items-center space-x-2">
            {isRecording ? (
              <button
                type="button"
                onClick={stopVoiceRecording}
                className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>
                  {t.stopRecord} ({recordingSeconds}s)
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startVoiceRecording}
                className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              >
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.voiceRecord}</span>
              </button>
            )}

            {audioBase64 && !isRecording && (
              <button
                type="button"
                onClick={() => {
                  setAudioBase64(null);
                  setAudioMimeType('');
                  if (audioPlayerRef.current) {
                    audioPlayerRef.current.pause();
                    setIsPlayingAudio(false);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-950/30 transition cursor-pointer"
                title="Remove audio note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Microphone Error Banner if Denied */}
        {micError && (
          <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-2xl text-red-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{micError}</span>
            </div>
            <button
              type="button"
              onClick={() => setMicError(null)}
              className="text-red-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Live Audio Recording Waveform Status */}
        {isRecording && (
          <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-2xl text-red-200 text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping"></div>
              <div className="font-semibold">{t.recording}</div>
            </div>
            <div className="flex items-center space-x-1 font-mono text-red-400 text-xs font-bold">
              <span>00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
            </div>
          </div>
        )}

        {/* Audio Player Card if recorded */}
        {audioBase64 && !isRecording && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <audio
              ref={audioPlayerRef}
              src={audioBase64}
              onEnded={() => setIsPlayingAudio(false)}
              className="hidden"
            />
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={togglePlayAudio}
                className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
                title={isPlayingAudio ? 'Pause Voice Note' : 'Play Voice Note'}
              >
                {isPlayingAudio ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
              <div>
                <span className="font-bold text-white block">
                  {currentLang === 'hi'
                    ? 'आवाज संदेश रिकॉर्ड हो गया (Voice Note Ready)'
                    : currentLang === 'mr'
                    ? 'व्हॉईस नोट जोडली आहे (Voice Note Ready)'
                    : 'Voice Recording Attached'}
                </span>
                <span className="text-[11px] text-emerald-300/80">
                  {isPlayingAudio
                    ? 'Playing recorded voice note...'
                    : 'Tap play to listen or click analyze to process with AI'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={startVoiceRecording}
                className="px-2.5 py-1 text-[11px] font-bold bg-white/10 hover:bg-white/15 rounded-lg text-slate-200 transition cursor-pointer"
              >
                {currentLang === 'hi' ? 'फिर से रिकॉर्ड करें' : currentLang === 'mr' ? 'पुन्हा रेकॉर्ड करा' : 'Re-record'}
              </button>
            </div>
          </div>
        )}

        {/* Text Area */}
        <textarea
          rows={3}
          value={symptomsText}
          onChange={(e) => setSymptomsText(e.target.value)}
          placeholder={t.symptomPlaceholder}
          className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 text-sm text-slate-100 placeholder-slate-500 transition resize-y"
        />

        {/* Common Symptoms Quick Tags */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-slate-400">
            {t.quickTagsLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS_LIST[currentLang].map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => addTag(tag.text)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white/5 hover:bg-emerald-950/40 hover:text-emerald-300 hover:border-emerald-500/40 border border-white/10 text-slate-300 transition cursor-pointer text-left active:scale-95"
              >
                + {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Analyze CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || (!symptomsText && !imagePreview && !audioBase64)}
          className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-2xl font-extrabold text-base transition active:scale-[0.99] cursor-pointer ${
            isLoading || (!symptomsText && !imagePreview && !audioBase64)
              ? 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] border border-emerald-400/30'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{t.analyzing}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <span>{t.analyzeBtn}</span>
            </>
          )}
        </button>
        {isLoading && (
          <p className="text-center text-xs text-slate-400 mt-2.5 font-mono animate-pulse">
            {t.analyzingSub}
          </p>
        )}
      </div>
    </div>
  );
}
