import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { TriageRecord } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App instance safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(
  app,
  firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
    ? firebaseConfigJson.firestoreDatabaseId
    : undefined
);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Get or generate persistent Device ID for guest / anonymous farmer database synchronization
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'device_server';
  const KEY = 'vet_mitra_device_id_v1';
  let deviceId = localStorage.getItem(KEY);
  if (!deviceId) {
    deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    try {
      localStorage.setItem(KEY, deviceId);
    } catch {
      // ignore
    }
  }
  return deviceId;
}

/**
 * Sign in with Google Popup (with fallback to redirect if popup blocked)
 */
export async function signInWithGooglePopup(): Promise<{ user: FirebaseUser | null; error: string | null }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (err: any) {
    console.warn('Popup signin error, attempting redirect fallback if necessary:', err);
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { user: null, error: null };
      } catch (redirectErr: any) {
        return { user: null, error: redirectErr.message || 'Google sign-in redirect failed' };
      }
    }
    return { user: null, error: err.message || 'Failed to sign in with Google' };
  }
}

/**
 * Email/Password Sign Up
 */
export async function signUpWithEmailPass(
  email: string,
  pass: string,
  displayName?: string
): Promise<{ user: FirebaseUser | null; error: string | null }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return { user: userCredential.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Registration failed' };
  }
}

/**
 * Email/Password Sign In
 */
export async function signInWithEmailPass(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser | null; error: string | null }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return { user: userCredential.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Sign in failed' };
  }
}

/**
 * Sign out
 */
export async function signOutFirebase(): Promise<{ error: string | null }> {
  try {
    await signOut(auth);
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Sign out failed' };
  }
}

/**
 * Helper to recursively remove undefined fields so Firestore setDoc does not error
 */
function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

/**
 * Save Triage Record to Cloud Firestore
 * Stores record private to the specific Google / Firebase user UID and email
 */
export async function saveDiagnosisToFirestore(
  userId: string,
  record: TriageRecord,
  userEmail?: string | null
): Promise<{ id: string | null; error: string | null }> {
  try {
    const docId = record.id || `record_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docRef = doc(db, 'triage_records', docId);

    const dataToSave = sanitizeForFirestore({
      id: docId,
      userId: userId,
      userEmail: userEmail || record.userEmail || auth.currentUser?.email || null,
      animalType: record.animalType,
      symptomsText: record.symptomsText || '',
      imageDataUrl: record.imageDataUrl || null,
      timestamp: record.timestamp || Date.now(),
      diagnosis: record.diagnosis,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(docRef, dataToSave, { merge: true });
    return { id: docId, error: null };
  } catch (err: any) {
    console.error('Failed to save to Firestore:', err);
    return { id: null, error: err.message || 'Failed to save to Firestore' };
  }
}

/**
 * Fetch User's Private Triage Records from Firestore
 */
export async function fetchUserDiagnosesFromFirestore(
  userId: string,
  userEmail?: string | null
): Promise<TriageRecord[]> {
  try {
    if (!userId) return [];

    const coll = collection(db, 'triage_records');
    const q = query(coll, where('userId', '==', userId));

    const snapshot = await getDocs(q);
    const records: TriageRecord[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      records.push({
        id: data?.id || docSnap.id,
        userId: data?.userId,
        userEmail: data?.userEmail,
        timestamp: data?.timestamp || Date.now(),
        animalType: data?.animalType || 'Livestock',
        symptomsText: data?.symptomsText || '',
        imageDataUrl: data?.imageDataUrl || undefined,
        diagnosis: data?.diagnosis,
      });
    });

    // Sort in memory by timestamp descending
    records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return records;
  } catch (err: any) {
    console.warn('Error querying Firestore private records:', err);
    return [];
  }
}

/**
 * Delete a specific Triage Record from Cloud Firestore
 */
export async function deleteDiagnosisFromFirestore(recordId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const docRef = doc(db, 'triage_records', recordId);
    await deleteDoc(docRef);
    return { success: true, error: null };
  } catch (err: any) {
    console.warn('Error deleting record from Firestore:', err);
    return { success: false, error: err.message || 'Failed to delete from Firestore' };
  }
}

/**
 * Clear all private records belonging to user from Cloud Firestore
 */
export async function clearUserDiagnosesFromFirestore(
  userId: string
): Promise<{ success: boolean; count: number; error: string | null }> {
  try {
    if (!userId) return { success: true, count: 0, error: null };

    const coll = collection(db, 'triage_records');
    const q = query(coll, where('userId', '==', userId));

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: true, count: 0, error: null };
    }

    const batch = writeBatch(db);
    snapshot.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();

    return { success: true, count: snapshot.size, error: null };
  } catch (err: any) {
    console.warn('Error clearing Firestore records:', err);
    return { success: false, count: 0, error: err.message || 'Failed to clear Firestore' };
  }
}

/**
 * Real-time subscription to User's Private Triage Records
 */
export function subscribeToUserDiagnoses(
  userId: string,
  userEmail: string | null | undefined,
  onUpdate: (records: TriageRecord[]) => void
): () => void {
  if (!userId) return () => {};

  try {
    const coll = collection(db, 'triage_records');
    const q = query(coll, where('userId', '==', userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records: TriageRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          records.push({
            id: data?.id || docSnap.id,
            userId: data?.userId,
            userEmail: data?.userEmail,
            timestamp: data?.timestamp || Date.now(),
            animalType: data?.animalType || 'Livestock',
            symptomsText: data?.symptomsText || '',
            imageDataUrl: data?.imageDataUrl || undefined,
            diagnosis: data?.diagnosis,
          });
        });
        records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        onUpdate(records);
      },
      (err) => {
        console.warn('Firestore private real-time subscription error:', err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not setup Firestore snapshot listener:', err);
    return () => {};
  }
}

/**
 * Check Firestore connection health
 */
export function getFirestoreDbInfo(): { databaseId: string; projectId: string } {
  return {
    databaseId: firebaseConfigJson.firestoreDatabaseId || '(default)',
    projectId: firebaseConfigJson.projectId || '',
  };
}

export { onAuthStateChanged, getRedirectResult };
export type { FirebaseUser };

