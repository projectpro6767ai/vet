export interface VetDiagnosisResponse {
  app_name: string;
  animal_identified: string;
  suspected_condition: string;
  urgency_badge: "🟢 GREEN" | "🟡 YELLOW" | "🔴 RED" | string;
  is_emergency_dispatch_needed: boolean;
  trigger_emergency_dispatch?: boolean;
  doctor_status?: string;
  first_aid_steps: string[];
  what_not_to_do: string;
  recommended_local_product: string;
  local_voice_script_english: string;
  local_voice_script_hindi: string;
  local_voice_script_marathi: string;
}

export type UrgencyLevel = 'green' | 'yellow' | 'red';

export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface TriageRecord {
  id: string;
  userId?: string;
  userEmail?: string;
  timestamp: number;
  animalType: string;
  symptomsText: string;
  imageDataUrl?: string;
  diagnosis: VetDiagnosisResponse;
}

export interface AppUser {
  id: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  user_metadata?: {
    fullName?: string;
    farmName?: string;
    role?: string;
  };
}

export interface PresetSymptomCase {
  id: string;
  title: {
    en: string;
    hi: string;
    mr: string;
  };
  animalType: string;
  description: {
    en: string;
    hi: string;
    mr: string;
  };
  sampleSymptoms: string;
  tag: string;
  expectedUrgency: "🟢 GREEN" | "🟡 YELLOW" | "🔴 RED";
  imagePlaceholderUrl?: string;
  iconName: string;
}

export interface EdgeInferenceDetails {
  modelName: string;
  quantization: string;
  executionEngine: 'TFLite-Edge' | 'ONNX-Runtime-Web' | 'Hybrid-Clinical-Tensor';
  latencyMs: number;
  memoryUsageMb: number;
  offlineStatus: boolean;
  confidenceScore: number;
}

export interface MvuDispatchTicket {
  ticketId: string;
  timestamp: number;
  animalType: string;
  suspectedCondition: string;
  urgency: string;
  farmerVillage: string;
  gpsCoords: { lat: number; lng: number };
  nearestDispensary: string;
  assignedMvuVehicle: string;
  vetDoctorName: string;
  driverPhone: string;
  etaMinutes: number;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'RESOLVED';
}

export interface OutbreakHotspot {
  id: string;
  diseaseName: string;
  diseaseMarathi: string;
  villageName: string;
  taluka: string;
  severity: 'RED' | 'YELLOW' | 'GREEN';
  activeCases: number;
  quarantineRadiusKm: number;
  distanceFromUserKm: number;
  lastUpdated: string;
  preventiveAction: string;
  preventiveActionMarathi: string;
  coordinates: { x: number; y: number }; // Relative map coordinates 0-100
}

export interface RemedyIngredient {
  name: string;
  nameMarathi: string;
  ratioPer100kg: number; // in grams or ml
  unit: string;
  purpose: string;
}

export interface AyurvedicRemedyRecipe {
  id: string;
  conditionName: string;
  conditionMarathi: string;
  source: string; // e.g. "NDDB / TANUVAS Peer-Reviewed Protocol"
  ingredients: RemedyIngredient[];
  preparationSteps: {
    en: string[];
    hi: string[];
    mr: string[];
  };
  cropWasteFeedSupplement: {
    title: string;
    ratioBreakdown: string;
    tips: string;
  };
}

// 1. Lesion Visual Heatmap
export interface LesionBoundingBox {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  label: string;
  labelMarathi: string;
  confidence: number; // e.g. 0.94
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  clinicalNote: string;
}

// 2. Fodder & Mold Detection
export interface FodderQualityReport {
  id: string;
  sampleType: string;
  sampleTypeMarathi: string;
  safetyScore: number; // 0 - 100 (100 = fresh & safe)
  aflatoxinRiskLevel: 'SAFE' | 'BORDERLINE' | 'CRITICAL_TOXIC';
  estimatedPpb: number; // Parts per billion
  moldDetected: boolean;
  visualSpoilageSigns: string[];
  detoxificationSteps: string[];
  livestockFeedingGuidance: string;
  timestamp: number;
}

// 4. Interactive Body Map Hotspot
export interface AnimalBodyHotspot {
  id: string;
  nameEn: string;
  nameMr: string;
  nameHi: string;
  iconName: string;
  coords: { x: number; y: number }; // percentage on 2D animal silhouette
  symptoms: Array<{
    labelEn: string;
    labelMr: string;
    labelHi: string;
    symptomQuery: string;
    urgencyTag: 'GREEN' | 'YELLOW' | 'RED';
  }>;
}

// 5. Taluka Chemist & Herbal Store
export interface TalukaChemistStore {
  id: string;
  name: string;
  storeType: 'Jan Aushadhi' | 'Sahakari Dairy Sangh' | 'Private Vet Medical';
  taluka: string;
  district: string;
  distanceKm: number;
  phone: string;
  address: string;
  isOpen24x7: boolean;
  stockStatus: {
    batisa: boolean;
    topicure: boolean;
    mastilep: boolean;
    ruchamax: boolean;
    calupGel: boolean;
    kmno4: boolean;
  };
}

// 6. E-Pashuhaat & Livestock Insurance
export interface EPashuhaatService {
  id: string;
  category: 'AI_TECHNICIAN' | 'INSURANCE' | 'BREEDING_BULL' | 'SUBSIDY';
  title: string;
  titleMarathi: string;
  provider: string;
  contactNumber: string;
  location: string;
  badge: string;
  details: string[];
  officialPortalUrl: string;
}

// 7. Vaccination & Subsidy Drive
export interface VaccinationDriveItem {
  id: string;
  diseaseName: string;
  diseaseMarathi: string;
  vaccineName: string;
  targetAnimals: string;
  upcomingDate: string;
  daysRemaining: number;
  talukaCampLocation: string;
  isGovernmentFree: boolean;
  frequency: string;
  precautions: string;
}

