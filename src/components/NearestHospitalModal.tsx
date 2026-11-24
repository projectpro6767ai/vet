import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
} from '@vis.gl/react-google-maps';
import {
  X,
  MapPin,
  Navigation,
  Clock,
  Phone,
  Loader2,
  Hospital,
  ExternalLink,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { UI_STRINGS } from '../data/translations';

interface NearestHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
}

// Emergency Government & Regional Veterinary Polyclinics with verified emergency desks
const EMERGENCY_CLINICS = [
  {
    id: 'mvu-1962',
    name: 'National Mobile Veterinary Unit (MVU)',
    nameHi: 'राष्ट्रीय मोबाइल पशु चिकित्सा इकाई (1962)',
    nameMr: 'राष्ट्रीय फिरते पशुवैद्यकीय पथक (१९६२)',
    type: '24x7 Emergency Ambulance',
    typeHi: '24x7 आपातकालीन एम्बुलेंस',
    typeMr: '२४x७ आणीबाणी रुग्णवाहिका',
    address: 'On-Field Dispatch across all Districts & Talukas',
    addressHi: 'सभी जिलों व तहसीलों में ऑन-फील्ड डिस्पैच',
    addressMr: 'सर्व जिल्हे व तालुक्यांत ऑन-फील्ड सेवा',
    phone: '1962',
    phoneDisplay: '1962 (Toll-Free)',
    isEmergencyHelpline: true,
  },
  {
    id: 'pune-poly',
    name: 'District Veterinary Polyclinic, Pune',
    nameHi: 'जिला पशु चिकित्सा पॉलीक्लिनिक, पुणे',
    nameMr: 'जिल्हा पशुवैद्यकीय सर्वचिकित्सालय, पुणे',
    type: 'Govt. District Polyclinic',
    typeHi: 'शासकीय जिला पॉलीक्लिनिक',
    typeMr: 'शासकीय जिल्हा सर्वचिकित्सालय',
    address: 'Shivajinagar, Model Colony, Pune, Maharashtra',
    addressHi: 'शिवाजीनगर, मॉडल कॉलोनी, पुणे, महाराष्ट्र',
    addressMr: 'शिवाजीनगर, मॉडेल कॉलनी, पुणे, महाराष्ट्र',
    phone: '+912025537330',
    phoneDisplay: '020-25537330',
  },
  {
    id: 'bvc-mumbai',
    name: 'Bombay Veterinary College Hospital',
    nameHi: 'बॉम्बे वेटरनरी कॉलेज अस्पताल, परेल',
    nameMr: 'मुंबई पशुवैद्यकीय महाविद्यालय रुग्णालय, परळ',
    type: 'State Apex Veterinary Hospital',
    typeHi: 'राज्य शीर्ष पशु चिकित्सालय',
    typeMr: 'राज्यस्तरीय मुख्य पशु रुग्णालय',
    address: 'Parel, Mumbai, Maharashtra 400012',
    addressHi: 'परेल, मुंबई, महाराष्ट्र 400012',
    addressMr: 'परळ, मुंबई, महाराष्ट्र ४०००१२',
    phone: '+912224131180',
    phoneDisplay: '022-24131180',
  },
  {
    id: 'baramati-vet',
    name: 'Taluka Veterinary Polyclinic, Baramati',
    nameHi: 'तालुका पशु चिकित्सालय, बारामती',
    nameMr: 'तालुका पशुवैद्यकीय दवाखाना, बारामती',
    type: 'Regional Veterinary Center',
    typeHi: 'क्षेत्रीय पशु चिकित्सा केंद्र',
    typeMr: 'प्रादेशिक पशुवैद्यकीय केंद्र',
    address: 'MIDC Road, Baramati, Dist. Pune 413133',
    addressHi: 'एमआईडीसी रोड, बारामती, जिला पुणे 413133',
    addressMr: 'एमआयडीसी रोड, बारामती, जि. पुणे ४१३१३३',
    phone: '+912112222416',
    phoneDisplay: '02112-222416',
  },
  {
    id: 'kolhapur-poly',
    name: 'District Veterinary Polyclinic, Kolhapur',
    nameHi: 'जिला पशु चिकित्सा पॉलीक्लिनिक, कोल्हापुर',
    nameMr: 'जिल्हा पशुवैद्यकीय सर्वचिकित्सालय, कोल्हापूर',
    type: 'Govt. District Polyclinic',
    typeHi: 'शासकीय जिला पॉलीक्लिनिक',
    typeMr: 'शासकीय जिल्हा सर्वचिकित्सालय',
    address: 'Bhausinghji Road, Kolhapur, Maharashtra 416002',
    addressHi: 'भाउसिंगजी रोड, कोल्हापुर, महाराष्ट्र 416002',
    addressMr: 'भाउसिंगजी रोड, कोल्हापूर, महाराष्ट्र ४१६००२',
    phone: '+912312651432',
    phoneDisplay: '0231-2651432',
  },
];

// Helper to determine if an API key has a valid Google Maps format
function isValidGoogleMapsKey(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.startsWith('AIzaSy') && trimmed.length >= 35;
}

export function NearestHospitalModal({ isOpen, onClose, currentLang }: NearestHospitalModalProps) {
  if (!isOpen) return null;
  const t = UI_STRINGS[currentLang];

  const rawApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  const hasValidApiKey = isValidGoogleMapsKey(rawApiKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] flex flex-col bg-[#0C0E0B] border border-red-500/30 rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-red-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                {t.hospitalTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.hospitalSub}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {hasValidApiKey ? (
            <APIProvider apiKey={rawApiKey} libraries={['places', 'marker', 'geometry']}>
              <HospitalTracker currentLang={currentLang} />
            </APIProvider>
          ) : (
            <EmergencyDirectoryFallback
              currentLang={currentLang}
              isKeyMissingOrInvalid={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function HospitalTracker({ currentLang }: { currentLang: SupportedLanguage }) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const geometryLib = useMapsLibrary('geometry');
  const t = UI_STRINGS[currentLang];

  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [nearestHospital, setNearestHospital] = useState<any | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFailed, setSearchFailed] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: 18.5204, lng: 73.8567 }); // Fallback to Pune
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn('Location permission denied or unavailable, using state center:', err);
        setUserLocation({ lat: 18.5204, lng: 73.8567 });
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, []);

  useEffect(() => {
    if (!map || !placesLib || !userLocation) return;

    let isMounted = true;
    const findNearest = async () => {
      setLoading(true);
      try {
        const { Place, SearchNearbyRankPreference } = placesLib;
        const request = {
          fields: [
            'id',
            'location',
            'displayName',
            'formattedAddress',
            'shortFormattedAddress',
            'internationalPhoneNumber',
          ],
          locationRestriction: {
            center: userLocation,
            radius: 50000, // 50km
          },
          includedPrimaryTypes: ['veterinary_care'],
          maxResultCount: 5,
          rankPreference: SearchNearbyRankPreference?.DISTANCE,
        };

        // @ts-ignore
        const { places } = await Place.searchNearby(request);

        if (!isMounted) return;

        if (places && places.length > 0) {
          const firstPlace = places[0];
          setNearestHospital(firstPlace);

          if (firstPlace.location) {
            map.panTo(firstPlace.location);

            if (geometryLib) {
              const from = new google.maps.LatLng(userLocation.lat, userLocation.lng);
              const to = firstPlace.location;
              const meters = google.maps.geometry.spherical.computeDistanceBetween(from, to);
              const km = (meters / 1000).toFixed(1);
              const estMinutes = Math.max(5, Math.round((meters / 1000) * 1.8));
              setRouteInfo({
                distance: `${km} km`,
                duration: `~${estMinutes} mins`,
              });
            } else {
              setRouteInfo({ distance: 'Nearby', duration: 'Est. 15-30 mins' });
            }
          }
        } else {
          setSearchFailed(true);
        }
      } catch (err) {
        console.error('Nearby search encountered an issue, displaying verified emergency clinics:', err);
        if (isMounted) {
          setSearchFailed(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    findNearest();

    return () => {
      isMounted = false;
    };
  }, [map, placesLib, geometryLib, userLocation]);

  if (searchFailed) {
    return <EmergencyDirectoryFallback currentLang={currentLang} isKeyMissingOrInvalid={false} />;
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={{ lat: 18.5204, lng: 73.8567 }}
        defaultZoom={12}
        gestureHandling="greedy"
        disableDefaultUI={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-full"
      >
        {userLocation && (
          <AdvancedMarker position={userLocation} title="Your Location">
            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-lg animate-pulse">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </AdvancedMarker>
        )}

        {nearestHospital?.location && (
          <AdvancedMarker
            position={nearestHospital.location}
            title={nearestHospital.displayName || 'Veterinary Hospital'}
          >
            <div className="w-10 h-10 rounded-xl bg-red-600 border-2 border-white flex items-center justify-center shadow-xl">
              <Hospital className="w-6 h-6 text-white" />
            </div>
          </AdvancedMarker>
        )}
      </Map>

      {/* Info Overlay at Bottom */}
      <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
        {loading && (
          <div className="bg-black/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex items-center space-x-3 text-white pointer-events-auto shadow-xl">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span className="text-xs sm:text-sm font-semibold">
              {t.locatingHospital}
            </span>
          </div>
        )}

        {nearestHospital && (
          <div className="w-full sm:max-w-md bg-black/90 backdrop-blur-lg p-4 rounded-[20px] border border-red-500/30 shadow-2xl space-y-2.5 pointer-events-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-white font-bold text-sm sm:text-base leading-tight">
                  {nearestHospital.displayName || t.vetEmergencyClinic}
                </h4>
                <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">
                  {nearestHospital.shortFormattedAddress || nearestHospital.formattedAddress}
                </p>
              </div>
              <div className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0">
                {t.nearestBadge}
              </div>
            </div>

            {routeInfo && (
              <div className="flex items-center gap-3 pt-2 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold">{routeInfo.distance}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-600" />
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">{routeInfo.duration}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              {nearestHospital.internationalPhoneNumber ? (
                <a
                  href={`tel:${nearestHospital.internationalPhoneNumber}`}
                  className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition active:scale-95 shadow-lg"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t.callHospital}</span>
                </a>
              ) : (
                <a
                  href="tel:1962"
                  className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition active:scale-95 shadow-lg"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t.callNow1962}</span>
                </a>
              )}

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  nearestHospital.displayName || 'Veterinary Hospital'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition active:scale-95 border border-white/10"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t.openMaps}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmergencyDirectoryFallback({
  currentLang,
  isKeyMissingOrInvalid,
}: {
  currentLang: SupportedLanguage;
  isKeyMissingOrInvalid: boolean;
}) {
  const t = UI_STRINGS[currentLang];
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* 24x7 Emergency Callout Banner */}
      <div className="bg-gradient-to-r from-red-950/70 via-red-900/50 to-amber-950/50 border border-red-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-red-500/30 text-red-300 font-mono text-[11px] font-extrabold uppercase tracking-wider border border-red-500/40">
                {t.govtHelplineBadge}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-white mt-1 font-['Outfit']">
              {t.emergencyResponseTitle}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-xl leading-relaxed">
              {t.emergencyResponseDesc}
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0">
          <a
            href="tel:1962"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-sm tracking-wide shadow-lg shadow-red-600/40 transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Phone className="w-4 h-4" />
            <span>{t.dial1962Now}</span>
          </a>
          <a
            href="https://www.google.com/maps/search/?api=1&query=veterinary+hospital+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl font-bold text-xs border border-white/10 transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t.searchOnGoogleMaps}</span>
          </a>
        </div>
      </div>

      {/* Info notice about Google Maps API Key configuration if invalid or missing */}
      {isKeyMissingOrInvalid && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 flex items-start space-x-3 text-amber-200">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <p className="font-bold text-amber-300">
              {t.gpsMapNoticeTitle}
            </p>
            <p className="text-slate-300">
              {t.gpsMapNoticeDesc}
            </p>
          </div>
        </div>
      )}

      {/* Verified Veterinary Hospitals Directory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            {t.verifiedHospitalsTitle}
          </h4>
          <span className="text-xs text-slate-400 font-medium">
            {t.directCallNav}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {EMERGENCY_CLINICS.map((clinic) => {
            const displayName =
              currentLang === 'hi'
                ? clinic.nameHi
                : currentLang === 'mr'
                ? clinic.nameMr
                : clinic.name;

            const displayType =
              currentLang === 'hi'
                ? clinic.typeHi
                : currentLang === 'mr'
                ? clinic.typeMr
                : clinic.type;

            const displayAddress =
              currentLang === 'hi'
                ? clinic.addressHi
                : currentLang === 'mr'
                ? clinic.addressMr
                : clinic.address;

            const mapsQuery = encodeURIComponent(`${clinic.name}, ${clinic.address}`);

            return (
              <div
                key={clinic.id}
                className={`p-4 rounded-2xl border transition hover:border-red-500/50 flex flex-col justify-between space-y-3 ${
                  clinic.isEmergencyHelpline
                    ? 'bg-red-950/30 border-red-500/40 shadow-lg shadow-red-950/20'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        clinic.isEmergencyHelpline
                          ? 'bg-red-600/30 text-red-300 border border-red-500/30'
                          : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {displayType}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>24x7</span>
                    </span>
                  </div>

                  <h5 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
                    {displayName}
                  </h5>

                  <p className="text-xs text-slate-400 flex items-start space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{displayAddress}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <a
                    href={`tel:${clinic.phone}`}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition active:scale-95 shadow-md cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{clinic.phoneDisplay}</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition active:scale-95 border border-white/10 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {t.directions}
                    </span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
