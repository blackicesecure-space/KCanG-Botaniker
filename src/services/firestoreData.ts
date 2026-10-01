import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RootHealthLog, HistoryDataPoint } from '../types/rootLog';
import { VivosunAccountCredentials } from '../types/vivosun';
import { TrichomeLog } from '../types/trichome';

/**
 * Recursively cleans an object by removing any fields with `undefined` values.
 * Firestore setDoc/updateDoc strictly rejects undefined values.
 */
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' ? cleanFirestoreData(item) : item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    // Leave Firestore Sentinels (serverTimestamp, etc.) and Dates untouched
    if (obj instanceof Date || (obj as any)._methodName || typeof (obj as any).toMillis === 'function') {
      return obj;
    }
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = typeof value === 'object' && value !== null ? cleanFirestoreData(value) : value;
      }
    }
    return cleaned as T;
  }
  return obj;
}

// --- ROOT LOGS FIRESTORE REPOSITORY ---

export async function saveRootLogToFirestore(userId: string, log: RootHealthLog): Promise<void> {
  const logRef = doc(db, 'users', userId, 'rootLogs', log.id);
  const cleanedLog = cleanFirestoreData(log);
  await setDoc(logRef, {
    ...cleanedLog,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRootLogFromFirestore(userId: string, logId: string): Promise<void> {
  const logRef = doc(db, 'users', userId, 'rootLogs', logId);
  await deleteDoc(logRef);
}

export async function fetchRootLogsFromFirestore(userId: string): Promise<RootHealthLog[]> {
  const logsRef = collection(db, 'users', userId, 'rootLogs');
  const q = query(logsRef, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  const results: RootHealthLog[] = [];
  snap.forEach((d) => {
    results.push(d.data() as RootHealthLog);
  });
  return results;
}

export function subscribeToRootLogs(
  userId: string,
  callback: (logs: RootHealthLog[]) => void,
  onError?: (err: Error) => void
) {
  const logsRef = collection(db, 'users', userId, 'rootLogs');
  return onSnapshot(
    logsRef,
    (snap) => {
      const results: RootHealthLog[] = [];
      snap.forEach((d) => {
        results.push(d.data() as RootHealthLog);
      });
      results.sort((a, b) => b.timestamp - a.timestamp);
      callback(results);
    },
    (err) => {
      console.warn('Firestore root logs subscription notice:', err);
      if (onError) onError(err);
    }
  );
}

// --- TRICHOME LOGS FIRESTORE REPOSITORY ---

export async function saveTrichomeLogToFirestore(userId: string, log: TrichomeLog): Promise<void> {
  const logRef = doc(db, 'users', userId, 'trichomeLogs', log.id);
  const cleanedLog = cleanFirestoreData(log);
  await setDoc(logRef, {
    ...cleanedLog,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTrichomeLogFromFirestore(userId: string, logId: string): Promise<void> {
  const logRef = doc(db, 'users', userId, 'trichomeLogs', logId);
  await deleteDoc(logRef);
}

export function subscribeToTrichomeLogs(
  userId: string,
  callback: (logs: TrichomeLog[]) => void,
  onError?: (err: Error) => void
) {
  const logsRef = collection(db, 'users', userId, 'trichomeLogs');
  return onSnapshot(
    logsRef,
    (snap) => {
      const results: TrichomeLog[] = [];
      snap.forEach((d) => {
        results.push(d.data() as TrichomeLog);
      });
      results.sort((a, b) => b.timestamp - a.timestamp);
      callback(results);
    },
    (err) => {
      console.warn('Firestore trichome logs subscription notice:', err);
      if (onError) onError(err);
    }
  );
}

// --- TELEMETRY SNAPSHOTS & HISTORY REPOSITORY ---

export async function saveTelemetrySnapshot(
  userId: string,
  point: HistoryDataPoint
): Promise<void> {
  const snapId = `telemetry-${point.timestamp}`;
  const snapRef = doc(db, 'users', userId, 'telemetryLogs', snapId);
  const cleanedPoint = cleanFirestoreData(point);
  await setDoc(snapRef, {
    ...cleanedPoint,
    savedAt: serverTimestamp(),
  });
}

export async function fetchHistoricalTelemetry(
  userId: string,
  maxPoints: number = 48
): Promise<HistoryDataPoint[]> {
  const colRef = collection(db, 'users', userId, 'telemetryLogs');
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(maxPoints));
  const snap = await getDocs(q);
  const list: HistoryDataPoint[] = [];
  snap.forEach((doc) => {
    list.push(doc.data() as HistoryDataPoint);
  });
  return list.sort((a, b) => a.timestamp - b.timestamp);
}

// --- BOTANICAL DIAGNOSIS REPORTS REPOSITORY ---

export interface SavedReport {
  id: string;
  timestamp: number;
  dateStr: string;
  strain: string;
  phase: string;
  reportText: string;
  ph: number;
  ec: number;
  waterTemp: number;
}

export async function saveDiagnosisReportToFirestore(
  userId: string,
  report: SavedReport
): Promise<void> {
  const reportRef = doc(db, 'users', userId, 'diagnosisReports', report.id);
  const cleanedReport = cleanFirestoreData(report);
  await setDoc(reportRef, {
    ...cleanedReport,
    savedAt: serverTimestamp(),
  });
}

export async function fetchSavedReportsFromFirestore(userId: string): Promise<SavedReport[]> {
  const reportsRef = collection(db, 'users', userId, 'diagnosisReports');
  const q = query(reportsRef, orderBy('timestamp', 'desc'), limit(20));
  const snap = await getDocs(q);
  const results: SavedReport[] = [];
  snap.forEach((d) => {
    results.push(d.data() as SavedReport);
  });
  return results;
}

// --- VIVOSUN ACCOUNT INTEGRATION REPOSITORY ---

export async function saveVivosunAccountToFirestore(
  userId: string,
  account: VivosunAccountCredentials
): Promise<void> {
  const accountRef = doc(db, 'users', userId, 'integrations', 'vivosun');
  const cleanedAccount = cleanFirestoreData(account);
  await setDoc(
    accountRef,
    {
      ...cleanedAccount,
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function fetchVivosunAccountFromFirestore(
  userId: string
): Promise<VivosunAccountCredentials | null> {
  const accountRef = doc(db, 'users', userId, 'integrations', 'vivosun');
  const snap = await getDoc(accountRef);
  if (snap.exists()) {
    return snap.data() as VivosunAccountCredentials;
  }
  return null;
}
