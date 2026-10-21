export type PressTestCase =
  | 'Overhaul'
  | 'Change Over'
  | 'Commissioning / Trial'
  | 'Stability Tinggi'
  | 'Perbaikan Part'
  | 'Bocor Harian';

export type CaseDetail = 'Commissioning' | 'Trial' | null;

export type PressCycle = 5 | 10;

export type LineScope = 'all' | 'specific';

export type LeakType =
  | 'Tidak ada bocor'
  | 'PH'
  | 'PV'
  | 'EMBOSS'
  | 'SEAL ATAS'
  | 'LUKA KEMASAN'
  | 'GRIPPER'
  | 'Jenis bocor lainnya';

export type PressTestResult = 'OK' | 'BOCOR';

export interface PressTestRecord {
  id: string; // e.g. "PT-001"
  case: PressTestCase;
  caseDetail?: CaseDetail;
  machine: string; // e.g. "Mesin 01"
  variant: string; // e.g. "ABC"
  pressCycle: PressCycle;
  pcs: number;
  lineScope: LineScope;
  leakLines: string[]; // e.g. ["Line 2", "Line 5"] or []
  leakType: string | null;
  result: PressTestResult; // Auto-calculated
  notes?: string;
  createdAt: string; // ISO 8601 string
  createdBy: string;
  createdById: string;
}

export type MachineCategoryType = 'AST_12L' | 'AST_16L' | 'POUCH' | 'BOTTLE' | 'OTHER';

export interface MachineMaster {
  id: string;
  name: string;
  variants: string[];
  totalLines: number;
  machineType?: MachineCategoryType;
  line?: string;
  ws?: string;
  cluster?: string;
  pressConfig?: {
    type: 'turunan' | 'pcs';
    allowedCycles?: (5 | 10)[];
    defaultPcs?: number;
  };
}

export function detectMachineConfiguration(machineName: string, cluster?: string): {
  type: MachineCategoryType;
  totalLines: number;
  pressConfig: { type: 'turunan' | 'pcs'; allowedCycles?: (5 | 10)[]; defaultPcs?: number };
} {
  const norm = (machineName || '').toUpperCase().trim();
  const normCluster = (cluster || '').toLowerCase();

  if (norm.includes('12L') || normCluster.includes('12l') || normCluster.includes('12ljumbo')) {
    return {
      type: 'AST_12L',
      totalLines: 12,
      pressConfig: { type: 'turunan', allowedCycles: [5, 10], defaultPcs: 100 },
    };
  }
  if (norm.includes('16L') || norm.startsWith('AST') || normCluster.includes('sct') || normCluster.includes('sosoft')) {
    return {
      type: 'AST_16L',
      totalLines: 16,
      pressConfig: { type: 'turunan', allowedCycles: [5, 10], defaultPcs: 100 },
    };
  }
  if (norm.startsWith('APK') || normCluster === 'pouch') {
    return {
      type: 'POUCH',
      totalLines: 2,
      pressConfig: { type: 'pcs', defaultPcs: 50 },
    };
  }
  if (norm.startsWith('K') || norm.startsWith('X') || normCluster === 'botol') {
    return {
      type: 'BOTTLE',
      totalLines: 1,
      pressConfig: { type: 'pcs', defaultPcs: 30 },
    };
  }
  return {
    type: 'OTHER',
    totalLines: 1,
    pressConfig: { type: 'pcs', defaultPcs: 25 },
  };
}

export interface FilterState {
  caseFilter: string;
  machineFilter: string;
  resultFilter: 'all' | 'OK' | 'BOCOR';
  dateFilter: 'all' | 'today' | 'this_week' | 'this_month';
}

/**
 * Calculates result deterministically:
 * If Line Bocor is present OR Jenis Bocor is chosen and not 'Tidak ada bocor' -> BOCOR
 * Otherwise -> OK
 */
export function calculatePressTestResult(
  leakLines: string[],
  leakType: string | null | undefined
): PressTestResult {
  const hasLeakLines = Array.isArray(leakLines) && leakLines.length > 0;
  const hasLeakType =
    leakType &&
    leakType.trim() !== '' &&
    leakType !== 'Tidak ada bocor' &&
    leakType !== 'none';

  if (hasLeakLines || hasLeakType) {
    return 'BOCOR';
  }
  return 'OK';
}

import { PLANT_MACHINES_MASTER } from '../data/plantMachines';

export const INITIAL_MACHINES: MachineMaster[] = PLANT_MACHINES_MASTER;

export const INITIAL_TEST_RECORDS: PressTestRecord[] = [
  {
    id: 'PT-001',
    case: 'Overhaul',
    machine: 'Mesin 01',
    variant: 'ABC',
    pressCycle: 5,
    pcs: 100,
    lineScope: 'all',
    leakLines: [],
    leakType: 'Tidak ada bocor',
    result: 'OK',
    notes: 'Pemeriksaan rutin pasca overhaul 500 jam kerja. Kondisi normal.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdBy: 'Suryadi (QA Admin)',
    createdById: 'usr-admin-01',
  },
  {
    id: 'PT-002',
    case: 'Change Over',
    caseDetail: 'Commissioning',
    machine: 'Mesin 02',
    variant: 'XYZ',
    pressCycle: 10,
    pcs: 200,
    lineScope: 'specific',
    leakLines: ['Line 2', 'Line 5'],
    leakType: 'Bocor ringan',
    result: 'BOCOR',
    notes: 'Terdeteksi rembesan mikro pada fitting seal Line 2 dan Line 5.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdBy: 'Budi Santoso',
    createdById: 'usr-op-02',
  },
  {
    id: 'PT-003',
    case: 'Bocor Harian',
    machine: 'Mesin 03',
    variant: 'MK-1',
    pressCycle: 5,
    pcs: 150,
    lineScope: 'all',
    leakLines: [],
    leakType: 'Tidak ada bocor',
    result: 'OK',
    notes: 'Shift 1 daily inspection cycle lulus seluruh line.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    createdBy: 'Hendra Gunawan',
    createdById: 'usr-op-03',
  },
  {
    id: 'PT-004',
    case: 'Perbaikan Part',
    machine: 'Mesin 01',
    variant: 'AL-100',
    pressCycle: 10,
    pcs: 120,
    lineScope: 'specific',
    leakLines: ['Line 4'],
    leakType: 'Seal rusak',
    result: 'BOCOR',
    notes: 'O-ring seal line 4 aus setelah penggantian valve block.',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    createdBy: 'Suryadi (QA Admin)',
    createdById: 'usr-admin-01',
  },
  {
    id: 'PT-005',
    case: 'Stability Tinggi',
    machine: 'Mesin 05',
    variant: 'HY-80',
    pressCycle: 5,
    pcs: 250,
    lineScope: 'all',
    leakLines: [],
    leakType: 'Tidak ada bocor',
    result: 'OK',
    notes: 'Uji ketahanan 250 PCS stabil, tekanan 6.2 bar.',
    createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    createdBy: 'Budi Santoso',
    createdById: 'usr-op-02',
  },
];
