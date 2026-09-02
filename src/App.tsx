/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  AlertTriangle,
  Stethoscope,
  Info,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  VetDiagnosisResponse,
  SupportedLanguage,
  TriageRecord,
  PresetSymptomCase,
  AppUser,
} from './types';
import { UI_STRINGS } from './data/translations';
import { Header } from './components/Header';
import { HelplineBanner } from './components/HelplineBanner';
import { AnimalSelector } from './components/AnimalSelector';
import { SymptomInput } from './components/SymptomInput';
import { DiagnosisResult } from './components/DiagnosisResult';
import { PresetCasesGrid } from './components/PresetCasesGrid';
import { TriageHistoryModal } from './components/TriageHistoryModal';
import { HelplineModal } from './components/HelplineModal';
import { AuthModal } from './components/AuthModal';
import { SafetyDisclaimer } from './components/SafetyDisclaimer';
import {
  saveTriageRecordToSupabase,
  fetchTriageRecordsFromSupabase,
  testSupabaseConnection,
  getCurrentUser,
  onAuthStateChange,
  signOutUser,
} from './lib/supabase';
import {
  auth,
  onAuthStateChanged,
  saveDiagnosisToFirestore,
  fetchUserDiagnosesFromFirestore,
  deleteDiagnosisFromFirestore,
  clearUserDiagnosesFromFirestore,
  subscribeToUserDiagnoses,
  getOrCreateDeviceId,
  signOutFirebase,
} from './lib/firebase';

const STORAGE_KEY = 'vet_mitra_triage_history_v1';

export default function App() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('hi');
  const [selectedAnimal, setSelectedAnimal] = useState<string>('Cow (गाय)');
  const [symptomsText, setSymptomsText] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<VetDiagnosisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals & Cloud state
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isHelplineOpen, setIsHelplineOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [history, setHistory] = useState<TriageRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(true);

  const t = UI_STRINGS[currentLang];

  // Auth Listener for Firebase & Supabase
  useEffect(() => {
    // 1. Firebase Auth listener
    const unsubscribeFirebase = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setCurrentUser({
          id: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          user_metadata: {
            fullName: fbUser.displayName || fbUser.email?.split('@')[0],
            role: 'farmer',
          },
        });
      } else {
        // Fallback check if logged out
        if (!currentUser?.id?.startsWith('supa_')) {
          setCurrentUser(null);
        }
      }
    });

    // 2. Supabase Auth listener fallback
    getCurrentUser().then((user) => {
      if (user && !auth.currentUser) {
        setCurrentUser({
          id: user.id,
          email: user.email,
          displayName: user.user_metadata?.fullName,
          user_metadata: user.user_metadata,
        });
      }
    });

    const { data: authListener } = onAuthStateChange((_event, session) => {
      if (session?.user && !auth.currentUser) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.fullName,
          user_metadata: session.user.user_metadata,
        });
      } else if (!session?.user && !auth.currentUser) {
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribeFirebase();
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Scoped private storage key per authenticated Gmail account or guest session
  const userStorageKey = currentUser?.id
    ? `vet_mitra_history_${currentUser.id}`
    : `vet_mitra_history_guest`;

  // Explicit User Sign Out handler: completely resets private state and history
  const handleUserSignOut = async () => {
    try {
      await signOutFirebase();
      await signOutUser();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setCurrentUser(null);
    setHistory([]);
  };

  // Real-time Firestore Database sync & local storage loading per private user account
  useEffect(() => {
    // Reset in-memory history when switching user context
    setHistory([]);

    let localHistory: TriageRecord[] = [];
    try {
      const stored = localStorage.getItem(userStorageKey);
      if (stored) {
        localHistory = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load triage history from localStorage', e);
    }

    const deviceId = getOrCreateDeviceId();
    const targetUserId = currentUser?.id || deviceId;
    const targetEmail = currentUser?.email || null;

    // Filter local records to strictly match current authentication scope
    const scopedLocalHistory = localHistory.filter((r) => {
      if (currentUser?.id) {
        return r.userId === currentUser.id || (r.userEmail && r.userEmail === currentUser.email);
      }
      // If guest/logged out, strictly exclude any authenticated user records
      return !r.userEmail && r.userId === deviceId;
    });
    setHistory(scopedLocalHistory);

    // Migrate any guest records to user's private Google account if newly logged in
    if (currentUser?.id) {
      try {
        const guestStored = localStorage.getItem('vet_mitra_history_guest');
        if (guestStored) {
          const guestRecords: TriageRecord[] = JSON.parse(guestStored);
          if (guestRecords && guestRecords.length > 0) {
            guestRecords.forEach((r) => {
              saveDiagnosisToFirestore(currentUser.id, r, currentUser.email).catch(() => {});
            });
            localStorage.removeItem('vet_mitra_history_guest');
          }
        }
      } catch (err) {
        console.warn('Guest history migration notice:', err);
      }
    }

    // 1. Setup real-time Firestore database subscription for private user history
    const unsubscribeFirestore = subscribeToUserDiagnoses(
      targetUserId,
      targetEmail,
      (cloudRecords) => {
        if (cloudRecords) {
          setHistory((prev) => {
            const map = new Map<string, TriageRecord>();
            // Strict filtering by active user scope
            cloudRecords
              .filter((r) => {
                if (currentUser?.id) {
                  return r.userId === currentUser.id || (r.userEmail && r.userEmail === currentUser.email);
                }
                return !r.userEmail && r.userId === deviceId;
              })
              .forEach((r) => map.set(r.id, r));

            prev
              .filter((r) => {
                if (currentUser?.id) {
                  return r.userId === currentUser.id || (r.userEmail && r.userEmail === currentUser.email);
                }
                return !r.userEmail && r.userId === deviceId;
              })
              .forEach((r) => {
                if (!map.has(r.id)) map.set(r.id, r);
              });

            const merged = Array.from(map.values()).sort(
              (a, b) => b.timestamp - a.timestamp
            );
            try {
              localStorage.setItem(userStorageKey, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      }
    );

    // 2. Initial on-demand load from Firestore for this user
    fetchUserDiagnosesFromFirestore(targetUserId, targetEmail)
      .then((cloudRecords) => {
        if (cloudRecords && cloudRecords.length > 0) {
          setHistory((prev) => {
            const map = new Map<string, TriageRecord>();
            cloudRecords
              .filter((r) => {
                if (currentUser?.id) {
                  return r.userId === currentUser.id || (r.userEmail && r.userEmail === currentUser.email);
                }
                return !r.userEmail && r.userId === deviceId;
              })
              .forEach((r) => map.set(r.id, r));

            prev
              .filter((r) => {
                if (currentUser?.id) {
                  return r.userId === currentUser.id || (r.userEmail && r.userEmail === currentUser.email);
                }
                return !r.userEmail && r.userId === deviceId;
              })
              .forEach((r) => {
                if (!map.has(r.id)) map.set(r.id, r);
              });

            const merged = Array.from(map.values()).sort(
              (a, b) => b.timestamp - a.timestamp
            );
            try {
              localStorage.setItem(userStorageKey, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch((err) => console.warn('Firestore private initial fetch:', err));

    return () => {
      unsubscribeFirestore();
    };
  }, [currentUser?.id, currentUser?.email, userStorageKey]);

  // On-demand manual database sync
  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    const deviceId = getOrCreateDeviceId();
    const targetUserId = currentUser?.id || deviceId;
    const targetEmail = currentUser?.email || null;

    try {
      // 1. Fetch private records from Firestore
      const firestoreRecords = await fetchUserDiagnosesFromFirestore(
        targetUserId,
        targetEmail
      );

      const combinedMap = new Map<string, TriageRecord>();
      (firestoreRecords || []).forEach((r) => combinedMap.set(r.id, r));
      history.forEach((r) => combinedMap.set(r.id, r));

      const merged = Array.from(combinedMap.values()).sort(
        (a, b) => b.timestamp - a.timestamp
      );
      setHistory(merged);
      try {
        localStorage.setItem(userStorageKey, JSON.stringify(merged));
      } catch {}
    } catch (err) {
      console.warn('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Save history to Cloud Firestore Database & Local Cache (private to Google user)
  const saveToHistory = async (res: VetDiagnosisResponse) => {
    const deviceId = getOrCreateDeviceId();
    const targetUserId = currentUser?.id || deviceId;
    const targetEmail = currentUser?.email || null;

    const record: TriageRecord = {
      id: `record_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: targetUserId,
      userEmail: targetEmail || undefined,
      timestamp: Date.now(),
      animalType: selectedAnimal,
      symptomsText,
      ...(imagePreview ? { imageDataUrl: imagePreview } : {}),
      diagnosis: res,
    };

    // Update local state immediately for instant feedback
    const updated = [record, ...history.filter((r) => r.id !== record.id)].slice(0, 50);
    setHistory(updated);
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist history locally', e);
    }

    // Persist directly to Cloud Firestore Database under private user account
    try {
      await saveDiagnosisToFirestore(targetUserId, record, targetEmail);
    } catch (e) {
      console.warn('Firestore database write notice:', e);
    }

    // Secondary fallback sync to Supabase if configured
    saveTriageRecordToSupabase(record).catch(() => {});
  };

  // Clear all history from database and device for active private user
  const handleClearHistory = async () => {
    setHistory([]);
    try {
      localStorage.removeItem(userStorageKey);
    } catch (e) {
      console.warn('Failed to remove history from localStorage:', e);
    }

    const deviceId = getOrCreateDeviceId();
    const targetUserId = currentUser?.id || deviceId;

    // Delete in Cloud Firestore Database for this private account
    try {
      await clearUserDiagnosesFromFirestore(targetUserId);
    } catch (err) {
      console.warn('Failed to clear database records:', err);
    }
  };

  // Delete a single record from database and device
  const handleDeleteRecord = async (id: string) => {
    const updated = history.filter((r) => r.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update localStorage:', e);
    }

    // Delete from Cloud Firestore Database
    try {
      await deleteDiagnosisFromFirestore(id);
    } catch (err) {
      console.warn('Failed to delete from Firestore database:', err);
    }
  };

  // Perform AI Diagnosis
  const handleAnalyze = async () => {
    if (!symptomsText && !imagePreview && !audioBase64) {
      setErrorMsg(
        currentLang === 'hi'
          ? 'कृपया पशु के लक्षण बताएं या फोटो/आवाज संलग्न करें।'
          : currentLang === 'mr'
          ? 'कृपया जनावराची लक्षणे सांगा किंवा फोटो/आवाज जोडा.'
          : 'Please enter symptoms, upload a photo, or record a voice note.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animalType: selectedAnimal,
          symptomsText,
          imageBase64: imagePreview,
          imageMimeType,
          audioBase64,
          audioMimeType,
          language: currentLang,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data: VetDiagnosisResponse = await response.json();
      setDiagnosis(data);
      saveToHistory(data);

      // Scroll to diagnosis result
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Diagnosis failed:', err);
      let displayMsg = '';
      const rawMsg = String(err?.message || '');

      if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
        displayMsg =
          currentLang === 'hi'
            ? 'सर्वर पर अधिक लोड है, लेकिन हमारा स्थानीय प्राथमिक उपचार मोड सक्रिय है। कृपया पुनः बटन दबाएं।'
            : currentLang === 'mr'
            ? 'सर्व्हरवर लोड आहे, तरी कृपया पुन्हा प्रयत्न करा.'
            : 'AI Service is experiencing temporary high demand. Please try once more.';
      } else if (rawMsg.startsWith('{') || rawMsg.includes('"error"')) {
        displayMsg =
          currentLang === 'hi'
            ? 'जांच प्रक्रिया में अस्थायी समस्या आई। कृपया पुनः प्रयास करें।'
            : currentLang === 'mr'
            ? 'तपासणी प्रक्रियेत तात्पुरती त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
            : 'Temporary service error occurred. Please try again.';
      } else {
        displayMsg =
          err.message ||
          (currentLang === 'hi'
            ? 'जांच प्रक्रिया में त्रुटि हुई। कृपया पुनः प्रयास करें।'
            : 'Failed to complete triage. Please try again.');
      }

      setErrorMsg(displayMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Select Preset Case
  const handleSelectPreset = (preset: PresetSymptomCase) => {
    setSelectedAnimal(preset.animalType);
    setSymptomsText(preset.sampleSymptoms);
    setImagePreview(null);
    setAudioBase64(null);
    setDiagnosis(null);
    setErrorMsg(null);

    // Smooth scroll to input
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Reset form for fresh case
  const handleResetForm = () => {
    setDiagnosis(null);
    setSymptomsText('');
    setImagePreview(null);
    setAudioBase64(null);
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0C0E0B] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      {/* Immersive Ambient Glow Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 z-0"
        style={{
          background:
            'radial-gradient(circle at 80% 15%, #166534 0%, transparent 45%), radial-gradient(circle at 15% 85%, #991b1b 0%, transparent 45%), radial-gradient(circle at 50% 50%, #064e3b 0%, transparent 60%)',
          filter: 'blur(90px)',
        }}
      />

      {/* 1. Header Navigation */}
      <Header
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelpline={() => setIsHelplineOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleUserSignOut}
      />

      {/* 2. Emergency 1962 Helpline Banner */}
      <HelplineBanner
        currentLang={currentLang}
        onOpenHelpline={() => setIsHelplineOpen(true)}
      />

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-start space-x-3 text-sm shadow-xl backdrop-blur-md animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-red-300">Notice: </span>
              {errorMsg}
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400 font-bold hover:text-red-200 text-xs px-2 py-1 bg-red-900/50 rounded-lg"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Display: Diagnosis Results or Input Form */}
        <AnimatePresence mode="wait">
          {diagnosis ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <DiagnosisResult
                diagnosis={diagnosis}
                currentLang={currentLang}
                onReset={handleResetForm}
              />
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* 1. Animal Selection */}
              <div className="bg-white/5 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] border border-white/10 p-5 sm:p-7 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm sm:text-base font-bold text-slate-100 flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 text-xs flex items-center justify-center font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      1
                    </span>
                    <span className="tracking-tight">{t.selectAnimal}</span>
                  </label>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full shadow-inner">
                    {selectedAnimal}
                  </span>
                </div>

                <AnimalSelector
                  selectedAnimal={selectedAnimal}
                  onSelect={setSelectedAnimal}
                  currentLang={currentLang}
                />
              </div>

              {/* 2 & 3. Multimodal Input (Photo, Voice, Text Symptoms) */}
              <SymptomInput
                currentLang={currentLang}
                selectedAnimal={selectedAnimal}
                onSelectAnimal={setSelectedAnimal}
                symptomsText={symptomsText}
                setSymptomsText={setSymptomsText}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                imageMimeType={imageMimeType}
                setImageMimeType={setImageMimeType}
                audioBase64={audioBase64}
                setAudioBase64={setAudioBase64}
                audioMimeType={audioMimeType}
                setAudioMimeType={setAudioMimeType}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
              />

              {/* 4. Quick Field Test Cases */}
              <PresetCasesGrid
                currentLang={currentLang}
                onSelectCase={handleSelectPreset}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Medical Protocol & Safety Disclaimer */}
        <SafetyDisclaimer currentLang={currentLang} />
      </main>

      {/* History Drawer Modal */}
      <TriageHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectRecord={(rec) => {
          setDiagnosis(rec.diagnosis);
          setSelectedAnimal(rec.animalType);
          setSymptomsText(rec.symptomsText);
          if (rec.imageDataUrl) setImagePreview(rec.imageDataUrl);
        }}
        onClearHistory={handleClearHistory}
        onDeleteRecord={handleDeleteRecord}
        onRefresh={handleSyncDatabase}
        isSyncing={isSyncing}
        isDatabaseConnected={true}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentLang={currentLang}
      />

      {/* 24x7 1962 Helpline Modal */}
      <HelplineModal
        isOpen={isHelplineOpen}
        onClose={() => setIsHelplineOpen(false)}
        currentLang={currentLang}
      />

      {/* Supabase & Firebase Authentication & Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        currentLang={currentLang}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
        onSignOut={handleUserSignOut}
      />
    </div>
  );
}
