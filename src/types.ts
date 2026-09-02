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
