import React, { useState } from 'react';
import {
  Map,
  ShieldAlert,
  AlertTriangle,
  Radio,
  CheckCircle2,
  X,
  Plus,
  Navigation,
  Activity,
  LocateFixed,
  Eye,
  Info,
} from 'lucide-react';
import { INITIAL_OUTBREAK_HOTSPOTS } from '../data/outbreakData';
import { IndiaTaluka, OutbreakHotspot, SupportedLanguage } from '../types';
import { UI_STRINGS } from '../data/translations';

interface OutbreakMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
  activeTaluka?: IndiaTaluka | null;
}

export function OutbreakMapModal({
  isOpen,
  onClose,
  currentLang,
  activeTaluka,
}: OutbreakMapModalProps) {
  const [hotspots, setHotspots] = useState<OutbreakHotspot[]>(INITIAL_OUTBREAK_HOTSPOTS);
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState<string>('ALL');
  const [activeHotspot, setActiveHotspot] = useState<OutbreakHotspot | null>(
    INITIAL_OUTBREAK_HOTSPOTS[0]
  );
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportVillage, setReportVillage] = useState('');
  const [reportDisease, setReportDisease] = useState('Lumpy Skin Disease (LSD)');
  const [reportCount, setReportCount] = useState('2');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const t = UI_STRINGS[currentLang];

  if (!isOpen) return null;

  const handleRequestGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported.');
      return;
    }

    setGpsStatus(t.analyzingGps);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });
        setGpsStatus(t.gpsAcquired);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setGpsStatus(t.gpsDenied);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const filteredHotspots =
    selectedDiseaseFilter === 'ALL'
      ? hotspots
      : hotspots.filter((h) => h.diseaseName.includes(selectedDiseaseFilter));

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportVillage.trim()) return;

    const newHotspot: OutbreakHotspot = {
      id: `outbreak_custom_${Date.now()}`,
      diseaseName: reportDisease,
      diseaseMarathi: reportDisease,
      villageName: `${reportVillage} (${currentLang === 'mr' ? 'तुमचे गाव' : currentLang === 'hi' ? 'आपका गांव' : 'Your Village'})`,
      taluka: activeTaluka ? `${activeTaluka.taluka}, ${activeTaluka.stateCode}` : 'Baramati',
      severity: 'RED',
      activeCases: parseInt(reportCount, 10) || 1,
      quarantineRadiusKm: 5.0,
      distanceFromUserKm: 0.8,
      lastUpdated: 'Just now',
      preventiveAction: 'Alert issued to Taluka LDO and neighboring dairy farmers. Quarantine initiated.',
      preventiveActionMarathi: 'तालुका पशुवैद्यकीय अधिकारी व शेजारील गावांना सतर्कतेचा इशारा पाठवला.',
      coordinates: { x: 50, y: 50 },
    };

    setHotspots([newHotspot, ...hotspots]);
    setActiveHotspot(newHotspot);
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportForm(false);
      setReportVillage('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0C0E0B] border border-amber-500/40 rounded-[28px] sm:rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
                  {t.outbreakWarning}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-black uppercase">
                  Taluka Radar
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.outbreakWarningSub}
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

        {/* Automated Geofence Warning Alert */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-amber-950/40 to-black/60 border border-red-500/50 space-y-3 shadow-lg">
          <div className="flex items-start space-x-3.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="flex-1 text-xs sm:text-sm space-y-1">
              <div className="font-extrabold text-red-200">
                {t.geofenceAlert}
              </div>
              <p className="text-slate-300 leading-relaxed">
                {t.geofenceDesc}
              </p>
              {gpsStatus && (
                <p className="text-emerald-400 font-mono text-xs font-bold pt-1">
                  {gpsStatus} {userCoords ? `(Lat: ${userCoords.lat.toFixed(4)}, Lng: ${userCoords.lng.toFixed(4)})` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
            <button
              onClick={handleRequestGpsLocation}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition cursor-pointer shadow"
            >
              {t.requestGpsLocation}
            </button>
            <button
              onClick={() => setShowReportForm(!showReportForm)}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-black font-extrabold text-xs transition shrink-0 cursor-pointer shadow-md"
            >
              {showReportForm ? t.closeForm : t.reportOutbreak}
            </button>
          </div>
        </div>

        {/* Report New Outbreak Form Drawer */}
        {showReportForm && (
          <form
            onSubmit={handleAddReport}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in"
          >
            <div className="text-sm font-bold text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{t.reportSuspected}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t.villageName}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Wagholi, Shirur..."
                  value={reportVillage}
                  onChange={(e) => setReportVillage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">{t.suspectedDisease}</label>
                <select
                  value={reportDisease}
                  onChange={(e) => setReportDisease(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Lumpy Skin Disease (LSD)">{t.lumpySkinFilter}</option>
                  <option value="Foot & Mouth Disease (FMD)">{t.footMouthFilter}</option>
                  <option value="Black Quarter (BQ)">Black Quarter (BQ)</option>
                  <option value="Acute Enteritis">Severe Enteritis</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">{t.affectedAnimals}</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={reportCount}
                  onChange={(e) => setReportCount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                {t.telemetryActive}
              </span>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs transition cursor-pointer"
              >
                {reportSuccess ? t.reportSuccess : t.submitOutbreak}
              </button>
            </div>
          </form>
        )}

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedDiseaseFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedDiseaseFilter === 'ALL'
                ? 'bg-amber-600 text-black shadow-md'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {t.allHotspots}
          </button>
          <button
            onClick={() => setSelectedDiseaseFilter('Lumpy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedDiseaseFilter === 'Lumpy'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            🔴 {t.lumpySkinFilter}
          </button>
          <button
            onClick={() => setSelectedDiseaseFilter('Foot')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedDiseaseFilter === 'Foot'
                ? 'bg-amber-600 text-black shadow-md'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            🟡 {t.footMouthFilter}
          </button>
          <button
            onClick={() => setSelectedDiseaseFilter('Mastitis')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedDiseaseFilter === 'Mastitis'
                ? 'bg-emerald-600 text-black shadow-md'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {t.mastitisFilter}
          </button>
        </div>

        {/* Interactive Taluka Outbreak Map Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Map Canvas */}
          <div className="lg:col-span-2 relative h-72 sm:h-80 bg-[#040806] rounded-2xl border border-emerald-950 p-3 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Ambient Map Grid */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#f59e0b 1px, #040806 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {/* Taluka Boundary Outline in SVG */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Taluka Zone Polygon */}
              <polygon
                points="15,20 45,10 85,15 95,50 80,85 45,95 10,80 5,45"
                fill="#052e16"
                fillOpacity="0.25"
                stroke="#10b981"
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />

              {/* User Farm Pin at Center (50, 50) */}
              <g transform="translate(50, 50)">
                <circle r="6" fill="#3b82f6" opacity="0.3" className="animate-ping" />
                <circle r="3" fill="#3b82f6" stroke="#ffffff" strokeWidth="0.8" />
                <text x="0" y="-5" textAnchor="middle" fill="#93c5fd" fontSize="3.5" fontWeight="bold">
                  {t.yourFarm}
                </text>
              </g>

              {/* 5km Radius Geofence Circle around User Farm */}
              <circle
                cx="50"
                cy="50"
                r="22"
                fill="none"
                stroke="#ef4444"
                strokeWidth="0.8"
                strokeDasharray="1.5 1.5"
                opacity="0.6"
              />
              <text x="50" y="74" textAnchor="middle" fill="#ef4444" fontSize="2.8" fontStyle="italic">
                {t.dangerGeofence}
              </text>

              {/* Hotspot Markers */}
              {filteredHotspots.map((h) => {
                const isSelected = activeHotspot?.id === h.id;
                const fillColor = h.severity === 'RED' ? '#ef4444' : h.severity === 'YELLOW' ? '#f59e0b' : '#10b981';
                return (
                  <g
                    key={h.id}
                    transform={`translate(${h.coordinates.x}, ${h.coordinates.y})`}
                    className="cursor-pointer"
                    onClick={() => setActiveHotspot(h)}
                  >
                    <circle r="7" fill={fillColor} opacity="0.25" className="animate-ping" />
                    <circle
                      r={isSelected ? '4' : '3'}
                      fill={fillColor}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? '1' : '0.5'}
                    />
                    <text
                      x="0"
                      y="6.5"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="2.8"
                      fontWeight="bold"
                    >
                      {h.villageName.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-1 rounded border border-white/10">
              {activeTaluka
                ? `Synced Sector: ${activeTaluka.taluka}, ${activeTaluka.district} (${activeTaluka.state})`
                : 'Sector: Baramati Rural Livestock Belt (22 Panchayats)'}
            </div>
          </div>

          {/* Selected Hotspot Intelligence Panel */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4">
            {activeHotspot ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      activeHotspot.severity === 'RED'
                        ? 'bg-red-950 border border-red-500/50 text-red-300'
                        : 'bg-amber-950 border border-amber-500/50 text-amber-300'
                    }`}
                  >
                    {activeHotspot.severity === 'RED' ? t.highRisk : t.alertWarning}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {activeHotspot.distanceFromUserKm} km {currentLang === 'hi' ? 'दूर' : currentLang === 'mr' ? 'लांब' : 'away'}
                  </span>
                </div>

                <div>
                  <div className="text-base font-extrabold text-white">
                    {currentLang === 'mr' ? activeHotspot.diseaseMarathi : activeHotspot.diseaseName}
                  </div>
                  <div className="text-xs font-bold text-emerald-400">
                    {activeHotspot.villageName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <div className="text-[10px] text-slate-400">{t.activeCasesLabel}</div>
                    <div className="font-extrabold text-white font-mono text-sm">
                      {activeHotspot.activeCases} {currentLang === 'hi' ? 'पशु' : currentLang === 'mr' ? 'प्राणी' : 'animals'}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <div className="text-[10px] text-slate-400">{t.quarantineRing}</div>
                    <div className="font-extrabold text-amber-400 font-mono text-sm">
                      {activeHotspot.quarantineRadiusKm} km
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-slate-200">
                  <div className="font-bold text-amber-300 mb-1">{t.preventativeActionLabel}</div>
                  <p className="leading-relaxed text-slate-300">
                    {currentLang === 'mr' ? activeHotspot.preventiveActionMarathi : activeHotspot.preventiveAction}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-10">
                {t.clickHotspot}
              </div>
            )}

            <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{t.telemetryActive}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
