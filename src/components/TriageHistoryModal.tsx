import { useState } from 'react';
import {
  X,
  Clock,
  Trash2,
  ChevronRight,
  Download,
  FileText,
  AlertTriangle,
  Lock,
  LogIn,
} from 'lucide-react';
import { TriageRecord, SupportedLanguage, AppUser } from '../types';
import { UI_STRINGS } from '../data/translations';

interface TriageHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TriageRecord[];
  onSelectRecord: (record: TriageRecord) => void;
  onClearHistory: () => void;
  onDeleteRecord?: (id: string) => void;
  onRefresh?: () => void;
  isSyncing?: boolean;
  isDatabaseConnected?: boolean;
  currentUser?: AppUser | null;
  onOpenAuth?: () => void;
  currentLang: SupportedLanguage;
}

export function TriageHistoryModal({
  isOpen,
  onClose,
  history,
  onSelectRecord,
  onClearHistory,
  onDeleteRecord,
  onRefresh,
  isSyncing = false,
  isDatabaseConnected = true,
  currentUser,
  onOpenAuth,
  currentLang,
}: TriageHistoryModalProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  if (!isOpen) return null;
  const t = UI_STRINGS[currentLang];

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `vet_mitra_history_${currentUser?.email || 'user'}_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExecuteClear = () => {
    onClearHistory();
    setConfirmClear(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0C0E0B] rounded-3xl w-full max-w-2xl max-h-[88vh] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="font-extrabold text-base text-white font-['Outfit']">
                  {t.historyTitle} ({history.length})
                </h3>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {history.length > 0 && !confirmClear && (
              <>
                <button
                  onClick={handleExportJson}
                  className="px-3 py-1.5 text-xs font-mono font-bold bg-white/10 hover:bg-white/15 rounded-xl text-slate-200 border border-white/10 flex items-center space-x-1.5 transition cursor-pointer"
                  title="Download JSON history"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 rounded-xl flex items-center space-x-1.5 transition cursor-pointer active:scale-95 shadow-sm"
                  title="Clear all logs from database & device"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.clearHistory}</span>
                </button>
              </>
            )}
            <button
              onClick={() => {
                setConfirmClear(false);
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Private Account Status Bar */}
        <div className="bg-white/[0.03] border-b border-white/5 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          {currentUser?.email ? (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Private to:</span>
                <span className="font-semibold text-white">{currentUser.email}</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-amber-300/90 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Local Session Only</span>
              </span>
              {onOpenAuth && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign in with Google to enable Private Cloud Sync</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Inline Confirmation Bar if Clear clicked */}
        {confirmClear && (
          <div className="bg-red-950/90 border-b border-red-500/40 p-3 sm:px-5 flex items-center justify-between gap-3 text-xs text-red-200 animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-semibold">
                {currentLang === 'hi'
                  ? 'क्या आप सभी जांच रिकॉर्ड डेटाबेस से हटाना चाहते हैं?'
                  : currentLang === 'mr'
                  ? 'तुम्ही डेटाबेसमधून सर्व नोंदी नष्ट करू इच्छिता?'
                  : 'Permanently clear all triage logs from your private Cloud Database?'}
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleExecuteClear}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-lg transition active:scale-95 cursor-pointer shadow-md"
              >
                {currentLang === 'hi' ? 'हाँ, हटाएं' : currentLang === 'mr' ? 'होय, पुसा' : 'Yes, Clear All'}
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg transition cursor-pointer"
              >
                {currentLang === 'hi' ? 'रद्द करें' : currentLang === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <p className="font-medium text-sm text-slate-400">{t.noHistory}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {currentUser?.email
                  ? `Any diagnostic triage you perform will be saved privately under your Gmail account (${currentUser.email}).`
                  : 'Diagnoses will automatically be saved. Sign in with Google to sync privately across all your devices.'}
              </p>
            </div>
          ) : (
            history.map((item) => {
              const d = new Date(item.timestamp);
              const dateStr =
                d.toLocaleDateString() +
                ' ' +
                d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isRed =
                item.diagnosis.urgency_badge.includes('RED') ||
                item.diagnosis.urgency_badge.includes('🔴');
              const isYellow =
                item.diagnosis.urgency_badge.includes('YELLOW') ||
                item.diagnosis.urgency_badge.includes('🟡');

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-white/10 hover:border-emerald-500/50 bg-white/5 hover:bg-white/10 transition flex items-center justify-between gap-3 group"
                >
                  <div
                    onClick={() => {
                      onSelectRecord(item);
                      onClose();
                    }}
                    className="space-y-1.5 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                          isRed
                            ? 'bg-red-950/80 text-red-300 border border-red-500/50'
                            : isYellow
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                        }`}
                      >
                        {item.diagnosis.urgency_badge}
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {item.diagnosis.animal_identified}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {dateStr}
                      </span>
                    </div>

                    <div className="font-extrabold text-sm text-white group-hover:text-emerald-300 transition">
                      {item.diagnosis.suspected_condition}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {item.symptomsText || 'Image/Voice based triage'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {onDeleteRecord && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRecord(item.id);
                        }}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/50 rounded-xl transition cursor-pointer"
                        title="Delete this record from database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onSelectRecord(item);
                        onClose();
                      }}
                      className="p-1.5 text-slate-400 group-hover:text-emerald-400 transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

