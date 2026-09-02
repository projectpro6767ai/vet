import { createClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { TriageRecord, VetDiagnosisResponse } from '../types';

// Default Supabase credentials provided for this project
export const SUPABASE_PROJECT_ID = 'dmmumqlcvbkrnmiozuoi';
export const SUPABASE_URL =
  (import.meta as any)?.env?.VITE_SUPABASE_URL ||
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY =
  (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_8c9QzUepLch96QBI-eLWMQ_vq2GxSOQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseUserProfile {
  id: string;
  email?: string;
  fullName?: string;
  farmName?: string;
  role?: 'farmer' | 'dairy_owner' | 'vet_officer' | 'paravet';
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  metadata?: { fullName?: string; farmName?: string; role?: string }
): Promise<{ user: User | null; session: Session | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: metadata || {},
      },
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }
    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    return { user: null, session: null, error: err.message || 'Sign up failed' };
  }
}

/**
 * Log in / Sign in with Email and Password
 */
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<{ user: User | null; session: Session | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }
    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    return { user: null, session: null, error: err.message || 'Sign in failed' };
  }
}

/**
 * Log in / Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Google sign-in failed' };
  }
}

/**
 * Sign out / Log out
 */
export async function signOutUser(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Sign out failed' };
  }
}

/**
 * Get currently authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user || null;
  } catch {
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

export interface SupabaseSyncStatus {
  connected: boolean;
  tableExists: boolean;
  lastSynced?: Date;
  error?: string;
}

/**
 * Tests connection to the Supabase project
 */
export async function testSupabaseConnection(): Promise<SupabaseSyncStatus> {
  try {
    const { data, error } = await supabase
      .from('triage_records')
      .select('id')
      .limit(1);

    if (error) {
      // If error code is 42P01 (table undefined) or similar relation missing, it means connected to Supabase but table not yet created
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          connected: true,
          tableExists: false,
          error: 'Table "triage_records" does not exist yet in your Supabase schema.',
        };
      }
      return {
        connected: false,
        tableExists: false,
        error: error.message,
      };
    }

    return {
      connected: true,
      tableExists: true,
      lastSynced: new Date(),
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      error: err.message || 'Connection test failed',
    };
  }
}

/**
 * Saves a triage record to Supabase
 */
export async function saveTriageRecordToSupabase(record: TriageRecord): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('triage_records').insert([
      {
        id: record.id,
        timestamp: new Date(record.timestamp).toISOString(),
        animal_type: record.animalType,
        symptoms_text: record.symptomsText || '',
        image_url: record.imageDataUrl ? 'data_image_attached' : null,
        suspected_condition: record.diagnosis.suspected_condition,
        urgency_badge: record.diagnosis.urgency_badge,
        is_emergency: record.diagnosis.is_emergency_dispatch_needed,
        first_aid_steps: record.diagnosis.first_aid_steps,
        what_not_to_do: record.diagnosis.what_not_to_do,
        recommended_product: record.diagnosis.recommended_local_product,
        voice_script_hi: record.diagnosis.local_voice_script_hindi,
        voice_script_mr: record.diagnosis.local_voice_script_marathi,
        raw_diagnosis: record.diagnosis,
      },
    ]);

    if (error) {
      console.warn('Supabase insert notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase sync error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches recent triage records from Supabase
 */
export async function fetchTriageRecordsFromSupabase(): Promise<{ data: TriageRecord[] | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('triage_records')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(30);

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [] };
    }

    const records: TriageRecord[] = data.map((row: any) => {
      const diag: VetDiagnosisResponse = row.raw_diagnosis || {
        app_name: 'Vet-Mitra AI',
        animal_identified: row.animal_type || 'Livestock',
        suspected_condition: row.suspected_condition || 'Unknown',
        urgency_badge: row.urgency_badge || '🟡 YELLOW',
        is_emergency_dispatch_needed: Boolean(row.is_emergency),
        first_aid_steps: Array.isArray(row.first_aid_steps) ? row.first_aid_steps : [],
        what_not_to_do: row.what_not_to_do || '',
        recommended_local_product: row.recommended_product || '',
        local_voice_script_hindi: row.voice_script_hi || '',
        local_voice_script_marathi: row.voice_script_mr || '',
      };

      return {
        id: row.id,
        timestamp: new Date(row.timestamp).getTime() || Date.now(),
        animalType: row.animal_type || 'Livestock',
        symptomsText: row.symptoms_text || '',
        diagnosis: diag,
      };
    });

    return { data: records };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}
