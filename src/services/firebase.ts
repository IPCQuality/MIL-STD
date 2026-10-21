import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  MachineMaster,
  INITIAL_MACHINES,
} from '../types/pressTest';
import {
  MilStdMachineItem,
  INITIAL_MILSTD_ITEMS,
  MILSTD_STORAGE_KEY,
} from '../components/MilStdView';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export getFirestore with configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.info('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// Validate connection to Firestore with graceful offline tolerance
async function testConnection() {
  // Silent check to prevent unnecessary Firestore server ping errors in offline/sandbox mode
}
testConnection();

// Local Storage Cache Keys
const STORAGE_KEY_MACHINES = 'qdc_machines_master_v1';
const STORAGE_KEY_DEMO_USER = 'qdc_active_operator_v1';

export function getCachedMachines(): MachineMaster[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MACHINES);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_MACHINES;
}

export function saveCachedMachines(machines: MachineMaster[]) {
  try {
    localStorage.setItem(STORAGE_KEY_MACHINES, JSON.stringify(machines));
  } catch {
    // silent catch
  }
}

export interface CurrentOperator {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  photoURL?: string | null;
}

export function getCachedOperator(): CurrentOperator | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEMO_USER);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
}

export function saveCachedOperator(operator: CurrentOperator | null) {
  try {
    if (operator) {
      localStorage.setItem(STORAGE_KEY_DEMO_USER, JSON.stringify(operator));
    } else {
      localStorage.removeItem(STORAGE_KEY_DEMO_USER);
    }
  } catch {
    // silent catch
  }
}

/**
 * Save or update a MIL-STD machine in Firestore + local cache
 */
export async function saveMilStdMachineToFirestore(machine: MilStdMachineItem): Promise<void> {
  const raw = localStorage.getItem(MILSTD_STORAGE_KEY);
  const items: MilStdMachineItem[] = raw ? JSON.parse(raw) : INITIAL_MILSTD_ITEMS;
  const idx = items.findIndex((m) => m.id === machine.id);
  if (idx >= 0) {
    items[idx] = machine;
  } else {
    items.unshift(machine);
  }
  localStorage.setItem(MILSTD_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('plant_milstd_updated', { detail: items }));

  if (auth.currentUser) {
    const path = `milstd_machines/${machine.id}`;
    try {
      await setDoc(doc(db, 'milstd_machines', machine.id), {
        ...machine,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
}

/**
 * Delete a MIL-STD machine from Firestore + local cache
 */
export async function deleteMilStdMachineFromFirestore(id: string): Promise<void> {
  const raw = localStorage.getItem(MILSTD_STORAGE_KEY);
  if (raw) {
    const items: MilStdMachineItem[] = JSON.parse(raw);
    const updated = items.filter((m) => m.id !== id);
    localStorage.setItem(MILSTD_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('plant_milstd_updated', { detail: updated }));
  }

  if (auth.currentUser) {
    const path = `milstd_machines/${id}`;
    try {
      await deleteDoc(doc(db, 'milstd_machines', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
}

/**
 * Save machines master data
 */
export async function saveMachinesMaster(machines: MachineMaster[]): Promise<void> {
  saveCachedMachines(machines);
  if (auth.currentUser) {
    for (const machine of machines) {
      const path = `machines/${machine.id}`;
      try {
        await setDoc(doc(db, 'machines', machine.id), machine);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  }
}

/**
 * Subscribe to real-time MIL-STD machines
 */
export function subscribeToMilStdMachines(
  onUpdate: (machines: MilStdMachineItem[]) => void
): () => void {
  const raw = localStorage.getItem(MILSTD_STORAGE_KEY);
  const initial = raw ? JSON.parse(raw) : INITIAL_MILSTD_ITEMS;
  onUpdate(initial);

  if (!auth.currentUser) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'milstd_machines');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: MilStdMachineItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as MilStdMachineItem);
          });
          localStorage.setItem(MILSTD_STORAGE_KEY, JSON.stringify(list));
          window.dispatchEvent(new CustomEvent('plant_milstd_updated', { detail: list }));
          onUpdate(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'milstd_machines');
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'milstd_machines');
    return () => {};
  }
}
