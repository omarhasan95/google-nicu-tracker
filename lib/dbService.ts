import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { BabyProfile, DailyEntry, ContactSubmission, Patient } from '../types';

// Helper to recursively remove undefined fields from plain objects/arrays before writing to Firestore
const removeUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }
  if (obj !== null && typeof obj === 'object') {
    const ctr = obj.constructor;
    if (ctr === undefined || ctr === Object || ctr.name === 'Object') {
      const newObj: any = {};
      for (const key of Object.keys(obj)) {
        if (obj[key] !== undefined) {
          newObj[key] = removeUndefined(obj[key]);
        }
      }
      return newObj;
    }
  }
  return obj;
};

// Check if Firebase is running in mock mode
export const isMockMode = (): boolean => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDajtoLwBLW1iOplCcKYsyhXn2qsgbVWLU";
  return !apiKey || apiKey === 'mock-api-key' || apiKey === '';
};

// --- Baby Profile Persistence ---

export const getBabyProfile = async (userId: string): Promise<BabyProfile | null> => {
  if (isMockMode()) {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(`nicu_profile_${userId}`);
    return data ? JSON.parse(data) : null;
  }

  const profileDoc = await getDoc(doc(db, 'users', userId, 'profile', 'info'));
  return profileDoc.exists() ? (profileDoc.data() as BabyProfile) : null;
};

export const saveBabyProfile = async (userId: string, profile: BabyProfile): Promise<void> => {
  if (isMockMode()) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`nicu_profile_${userId}`, JSON.stringify(profile));
    return;
  }

  await setDoc(doc(db, 'users', userId, 'profile', 'info'), removeUndefined(profile));
};

// --- Daily Tracking Logs Persistence ---

export const getDailyEntries = async (userId: string): Promise<DailyEntry[]> => {
  if (isMockMode()) {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(`nicu_entries_${userId}`);
    if (!data) return [];
    const parsed: DailyEntry[] = JSON.parse(data);
    // Sort in reverse chronological order
    return parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const q = query(
    collection(db, 'users', userId, 'entries'),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  const fetched: DailyEntry[] = [];
  snapshot.forEach((docSnap) => {
    fetched.push({
      id: docSnap.id,
      ...docSnap.data()
    } as DailyEntry);
  });
  return fetched;
};

export const addDailyEntry = async (userId: string, entry: Omit<DailyEntry, 'id'>): Promise<string> => {
  if (isMockMode()) {
    if (typeof window === 'undefined') return 'mock-id';
    const entries = await getDailyEntries(userId);
    const newId = `entry_${Date.now()}`;
    const newEntry: DailyEntry = {
      id: newId,
      ...entry
    };
    entries.push(newEntry);
    localStorage.setItem(`nicu_entries_${userId}`, JSON.stringify(entries));
    return newId;
  }

  const docRef = await addDoc(collection(db, 'users', userId, 'entries'), removeUndefined({
    ...entry,
    createdAt: serverTimestamp()
  }));
  return docRef.id;
};

export const deleteDailyEntry = async (userId: string, entryId: string): Promise<void> => {
  if (isMockMode()) {
    if (typeof window === 'undefined') return;
    const entries = await getDailyEntries(userId);
    const filtered = entries.filter(e => e.id !== entryId);
    localStorage.setItem(`nicu_entries_${userId}`, JSON.stringify(filtered));
    return;
  }

  await deleteDoc(doc(db, 'users', userId, 'entries', entryId));
};

// --- Patient Registry Database (RIMS NICU Tracker) ---

export const getPatients = async (userId: string): Promise<Patient[]> => {
  if (isMockMode()) {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(`nicu_patients_${userId}`);
    if (!data) return [];
    const parsed: Patient[] = JSON.parse(data);
    // Sort by admission date descending
    return parsed.sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime());
  }

  const snapshot = await getDocs(collection(db, 'users', userId, 'patients'));
  const fetched: Patient[] = [];
  snapshot.forEach((docSnap) => {
    fetched.push({
      id: docSnap.id,
      ...docSnap.data()
    } as Patient);
  });
  // Sort in-memory to avoid needing index creation on Firebase
  return fetched.sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime());
};

export const addPatient = async (userId: string, patient: Omit<Patient, 'id'>): Promise<string> => {
  if (isMockMode()) {
    if (typeof window === 'undefined') return 'mock-pat-id';
    const patientsList = await getPatients(userId);
    const newId = `pat_${Date.now()}`;
    const newPatient: Patient = {
      id: newId,
      ...patient
    };
    patientsList.push(newPatient);
    localStorage.setItem(`nicu_patients_${userId}`, JSON.stringify(patientsList));
    return newId;
  }

  const docRef = await addDoc(collection(db, 'users', userId, 'patients'), removeUndefined({
    ...patient,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }));
  return docRef.id;
};

export const updatePatient = async (userId: string, patientId: string, patient: Partial<Patient>): Promise<void> => {
  if (isMockMode()) {
    if (typeof window === 'undefined') return;
    const patientsList = await getPatients(userId);
    const updated = patientsList.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          ...patient,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });
    localStorage.setItem(`nicu_patients_${userId}`, JSON.stringify(updated));
    return;
  }

  await updateDoc(doc(db, 'users', userId, 'patients', patientId), removeUndefined({
    ...patient,
    updatedAt: serverTimestamp()
  }));
};

export const deletePatient = async (userId: string, patientId: string): Promise<void> => {
  if (isMockMode()) {
    if (typeof window === 'undefined') return;
    const patientsList = await getPatients(userId);
    const filtered = patientsList.filter(p => p.id !== patientId);
    localStorage.setItem(`nicu_patients_${userId}`, JSON.stringify(filtered));
    return;
  }

  await deleteDoc(doc(db, 'users', userId, 'patients', patientId));
};

// --- Contact Form Submissions ---

export const saveContactSubmission = async (submission: Omit<ContactSubmission, 'createdAt'>): Promise<void> => {
  if (isMockMode()) {
    if (typeof window === 'undefined') return;
    const submissionsKey = 'nicu_contact_submissions';
    const data = localStorage.getItem(submissionsKey);
    const currentList = data ? JSON.parse(data) : [];
    currentList.push({
      ...submission,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(submissionsKey, JSON.stringify(currentList));
    return;
  }

  await addDoc(collection(db, 'contactSubmissions'), removeUndefined({
    ...submission,
    createdAt: serverTimestamp()
  }));
};
