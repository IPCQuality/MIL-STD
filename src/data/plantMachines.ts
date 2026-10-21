import { MachineMaster } from '../types/pressTest';

export interface PlantMachineItem {
  id: string;
  name: string;
  line: 'LINE A' | 'LINE B' | 'LINE C' | 'WW' | 'OT';
  status: 'OFF' | 'RUNNING' | 'MAINTENANCE';
  cluster: string;
  ws: string;
  variants?: string[];
}

export const PLANT_RAW_MACHINES: PlantMachineItem[] = [
  // --- LINE A (40 machines) ---
  { id: 'M-0A-1', name: 'AST 14-12L', line: 'LINE A', status: 'OFF', cluster: '12Ljumbo', ws: '0A' },
  { id: 'M-1A-2', name: 'AST 36-16L', line: 'LINE A', status: 'OFF', cluster: 'Sosoft', ws: '1A' },
  { id: 'M-1A-3', name: 'AST 44-16L', line: 'LINE A', status: 'OFF', cluster: 'Sosoft', ws: '1A' },
  { id: 'M-1A-4', name: 'AST 61-16L', line: 'LINE A', status: 'OFF', cluster: 'Sosoft', ws: '1A' },
  { id: 'M-2A-1', name: 'AST 70-16L', line: 'LINE A', status: 'OFF', cluster: 'Sosoft', ws: '2A' },
  { id: 'M-2A-2', name: 'AST 69-16L', line: 'LINE A', status: 'OFF', cluster: 'Sosoft', ws: '2A' },
  { id: 'M-2A-3', name: 'AST 67-16L', line: 'LINE A', status: 'OFF', cluster: 'Sosoft', ws: '2A' },
  { id: 'M-2A-4', name: 'AST 68-16L', line: 'LINE A', status: 'OFF', cluster: 'Sosoft', ws: '2A' },
  { id: 'M-3A-1', name: 'AST 54-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '3A' },
  { id: 'M-3A-2', name: 'AST 55-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '3A' },
  { id: 'M-3A-3', name: 'AST 22-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '3A' },
  { id: 'M-4A-1', name: 'AST 26-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '4A' },
  { id: 'M-4A-2', name: 'AST 27-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '4A' },
  { id: 'M-4A-3', name: 'AST 28-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '4A' },
  { id: 'M-4A-4', name: 'AST 65-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '4A' },
  { id: 'M-5A-1', name: 'AST 29-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '5A' },
  { id: 'M-5A-2', name: 'AST 8-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '5A' },
  { id: 'M-5A-3', name: 'AST 10-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '5A' },
  { id: 'M-5A-4', name: 'AST 12-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '5A' },
  { id: 'M-6A-1', name: 'AST 30-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '6A' },
  { id: 'M-6A-2', name: 'AST 7-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '6A' },
  { id: 'M-6A-3', name: 'AST 9-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '6A' },
  { id: 'M-6A-4', name: 'AST 11-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '6A' },
  { id: 'M-7A-1', name: 'AST 71-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '7A' },
  { id: 'M-7A-2', name: 'AST 3-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '7A' },
  { id: 'M-7A-3', name: 'AST 5-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '7A' },
  { id: 'M-7A-4', name: 'AST 4-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '7A' },
  { id: 'M-8A-1', name: 'AST 72-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '8A' },
  { id: 'M-8A-2', name: 'AST 18-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '8A' },
  { id: 'M-8A-3', name: 'AST 6-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '8A' },
  { id: 'M-8A-4', name: 'AST 2-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '8A' },
  { id: 'M-9A-1', name: 'AST 63-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '9A' },
  { id: 'M-9A-2', name: 'AST 15-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '9A' },
  { id: 'M-9A-3', name: 'AST 16-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '9A' },
  { id: 'M-9A-4', name: 'AST 17-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '9A' },
  { id: 'M-10A-1', name: 'AST 19-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '10A' },
  { id: 'M-10A-2', name: 'AST 20-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '10A' },
  { id: 'M-10A-3', name: 'AST 21-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '10A' },
  { id: 'M-10A-4', name: 'AST 33-16L', line: 'LINE A', status: 'OFF', cluster: 'SKLsct', ws: '10A' },

  // --- LINE B (35 machines) ---
  { id: 'M-0B-1', name: 'K1', line: 'LINE B', status: 'OFF', cluster: 'Botol', ws: '0B' },
  { id: 'M-0B-2', name: 'K2', line: 'LINE B', status: 'OFF', cluster: 'Botol', ws: '0B' },
  { id: 'M-1B-1', name: 'AST 41-16L', line: 'LINE B', status: 'OFF', cluster: 'Sosoft', ws: '1B' },
  { id: 'M-1B-2', name: 'AST 47-16L', line: 'LINE B', status: 'OFF', cluster: 'Sosoft', ws: '1B' },
  { id: 'M-1B-3', name: 'AST 51-16L', line: 'LINE B', status: 'OFF', cluster: 'Sosoft', ws: '1B' },
  { id: 'M-1B-4', name: 'AST 50-16L', line: 'LINE B', status: 'OFF', cluster: 'Sosoft', ws: '1B' },
  { id: 'M-2B-1', name: 'AST 46-16L', line: 'LINE B', status: 'OFF', cluster: 'Sosoft', ws: '2B' },
  { id: 'M-2B-2', name: 'AST 45-16L', line: 'LINE B', status: 'OFF', cluster: 'Sosoft', ws: '2B' },
  { id: 'M-2B-3', name: 'AST 42-16L', line: 'LINE B', status: 'OFF', cluster: 'Sosoft', ws: '2B' },
  { id: 'M-2B-4', name: 'AST 43-16L', line: 'LINE B', status: 'OFF', cluster: 'Sosoft', ws: '2B' },
  { id: 'M-3B-1', name: 'AST 53-16L', line: 'LINE B', status: 'OFF', cluster: 'Sosoft', ws: '3B' },
  { id: 'M-3B-2', name: 'AST 52-16L', line: 'LINE B', status: 'OFF', cluster: 'Sosoft', ws: '3B' },
  { id: 'M-3B-3', name: 'AST 48-16L', line: 'LINE B', status: 'OFF', cluster: 'Sosoft', ws: '3B' },
  { id: 'M-3B-4', name: 'AST 49-16L', line: 'LINE B', status: 'OFF', cluster: 'Sosoft', ws: '3B' },
  { id: 'M-4B-1', name: 'APK 45', line: 'LINE B', status: 'OFF', cluster: 'Pouch', ws: '4B' },
  { id: 'M-4B-2', name: 'APK 46', line: 'LINE B', status: 'OFF', cluster: 'Pouch', ws: '4B' },
  { id: 'M-5B-1', name: 'AST 24-12L', line: 'LINE B', status: 'OFF', cluster: '12Ljumbo', ws: '5B' },
  { id: 'M-5B-2', name: 'AST 31-12L', line: 'LINE B', status: 'OFF', cluster: '12Ljumbo', ws: '5B' },
  { id: 'M-5B-3', name: 'AST 23-12L', line: 'LINE B', status: 'OFF', cluster: '12Ljumbo', ws: '5B' },
  { id: 'M-5B-4', name: 'AST 62-12L', line: 'LINE B', status: 'OFF', cluster: '12Ljumbo', ws: '5B' },
  { id: 'M-6B-1', name: 'K8', line: 'LINE B', status: 'OFF', cluster: 'Botol', ws: '6B' },
  { id: 'M-6B-2', name: 'K7', line: 'LINE B', status: 'OFF', cluster: 'Botol', ws: '6B' },
  { id: 'M-7B-1', name: 'AST 39-12L', line: 'LINE B', status: 'OFF', cluster: '12Ljumbo', ws: '7B' },
  { id: 'M-7B-2', name: 'AST 38-12L', line: 'LINE B', status: 'OFF', cluster: '12Ljumbo', ws: '7B' },
  { id: 'M-7B-3', name: 'AST 37-12L', line: 'LINE B', status: 'OFF', cluster: '12Ljumbo', ws: '7B' },
  { id: 'M-7B-4', name: 'AST 40-12L', line: 'LINE B', status: 'OFF', cluster: '12Ljumbo', ws: '7B' },
  { id: 'M-8B-1', name: 'APK 15', line: 'LINE B', status: 'OFF', cluster: 'Pouch', ws: '8B' },
  { id: 'M-8B-2', name: 'APK 12', line: 'LINE B', status: 'OFF', cluster: 'Pouch', ws: '8B' },
  { id: 'M-9B-1', name: 'AST 66-16L', line: 'LINE B', status: 'OFF', cluster: 'SKLsct', ws: '9B' },
  { id: 'M-9B-2', name: 'AST 35-16L', line: 'LINE B', status: 'OFF', cluster: 'SKLsct', ws: '9B' },
  { id: 'M-9B-3', name: 'AST 34-16L', line: 'LINE B', status: 'OFF', cluster: 'SKLsct', ws: '9B' },
  { id: 'M-9B-4', name: 'AST 73-12L', line: 'LINE B', status: 'OFF', cluster: '12Ljumbo', ws: '9B' },
  { id: 'M-10B-1', name: 'AST 25-12L', line: 'LINE B', status: 'OFF', cluster: '12Ljumbo', ws: '10B' },
  { id: 'M-10B-2', name: 'AST 13-12L', line: 'LINE B', status: 'OFF', cluster: '12Ljumbo', ws: '10B' },
  { id: 'M-10B-3', name: 'AST 32-12L', line: 'LINE B', status: 'OFF', cluster: '12Ljumbo', ws: '10B' },
  { id: 'M-11B-1', name: 'X3', line: 'LINE B', status: 'OFF', cluster: 'Botol', ws: '11B' },

  // --- LINE C (22 machines) ---
  { id: 'M-1C-1', name: 'APK 40', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '1C' },
  { id: 'M-1C-2', name: 'APK 43', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '1C' },
  { id: 'M-1C-3', name: 'APK 44', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '1C' },
  { id: 'M-2C-1', name: 'APK 19', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '2C' },
  { id: 'M-2C-2', name: 'APK 26', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '2C' },
  { id: 'M-3C-1', name: 'APK 13', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '3C' },
  { id: 'M-3C-2', name: 'APK 61', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '3C' },
  { id: 'M-3C-3', name: 'APK 9', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '3C' },
  { id: 'M-4C-1', name: 'APK 42', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '4C' },
  { id: 'M-4C-2', name: 'APK 38', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '4C' },
  { id: 'M-4C-3', name: 'APK 55', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '4C' },
  { id: 'M-5C-1', name: 'APK 32', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '5C' },
  { id: 'M-5C-2', name: 'APK 54', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '5C' },
  { id: 'M-6C-1', name: 'K5', line: 'LINE C', status: 'OFF', cluster: 'Botol', ws: '6C' },
  { id: 'M-6C-2', name: 'K6', line: 'LINE C', status: 'OFF', cluster: 'Botol', ws: '6C' },
  { id: 'M-7C-1', name: 'X2', line: 'LINE C', status: 'OFF', cluster: 'Botol', ws: '7C' },
  { id: 'M-7C-2', name: 'K9', line: 'LINE C', status: 'OFF', cluster: 'Botol', ws: '7C' },
  { id: 'M-8C-1', name: 'APK 58', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '8C' },
  { id: 'M-8C-2', name: 'APK 59', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '8C' },
  { id: 'M-9C-1', name: 'APK 63', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '9C' },
  { id: 'M-10C-1', name: 'APK 31', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '10C' },
  { id: 'M-10C-2', name: 'APK 56', line: 'LINE C', status: 'OFF', cluster: 'Pouch', ws: '10C' },

  // --- WW (2 machines) ---
  { id: 'M-WW-1', name: 'C1', line: 'WW', status: 'OFF', cluster: 'Wipes', ws: 'WW' },
  { id: 'M-WW-2', name: 'C2', line: 'WW', status: 'OFF', cluster: 'Wipes', ws: 'WW' },

  // --- OT (2 machines) ---
  { id: 'M-OT-1', name: 'M2', line: 'OT', status: 'OFF', cluster: 'Other', ws: 'OT' },
  { id: 'M-OT-2', name: 'M3', line: 'OT', status: 'OFF', cluster: 'Other', ws: 'OT' },
];

/**
 * Get contextual variants based on cluster/machine
 */
export function getVariantsForCluster(cluster: string, machineName: string): string[] {
  if (cluster === 'Sosoft') {
    return ['Sosoft Hijau (TCK08P)', 'Sosoft Floral Pink', 'Sosoft Fresh Blue', 'Sosoft Nature 700ml', 'Standard Sosoft'];
  }
  if (cluster === 'SKLsct') {
    return ['Soklin Lilac (TCK08P)', 'Soklin Bio 16L', 'Soklin Floral 16L', 'Soklin White 16L', 'Soklin Pro 16L'];
  }
  if (cluster === '12Ljumbo') {
    return ['Jumbo 12L Regular', 'Jumbo 12L Extra', 'Jumbo 12L Bulk', 'Jumbo 12L Eco'];
  }
  if (cluster === 'Pouch') {
    return ['Pouch 450ml Refill', 'Pouch 800ml Refill', 'Pouch 1800ml Jumbo', 'Pouch Eco-Pack'];
  }
  if (cluster === 'Botol') {
    return ['Botol 500ml Ergonomic', 'Botol 1000ml Handle', 'Botol 250ml Mini', 'Botol 4L Jerrycan'];
  }
  if (cluster === 'Wipes') {
    return ['Wipes 50s Soft', 'Wipes 80s Antibacterial', 'Wipes Refill'];
  }
  return ['Standard Batch', 'Variant A', 'Variant B', 'Trial Batch'];
}

/**
 * Detect if machine is a Sachet machine (AST series / Sosoft / SKLsct / 12Ljumbo)
 * or Pouch / Bottle machine (APK / K / X / C / M)
 */
export function isSachetMachine(machineName: string, cluster?: string): boolean {
  const normName = machineName.toUpperCase().trim();
  const normCluster = (cluster || '').toLowerCase();
  if (normCluster === 'pouch' || normCluster === 'botol' || normCluster === 'wipes' || normCluster === 'other') {
    return false;
  }
  if (
    normName.startsWith('APK') ||
    normName.startsWith('K1') ||
    normName.startsWith('K2') ||
    normName.startsWith('K5') ||
    normName.startsWith('K6') ||
    normName.startsWith('K7') ||
    normName.startsWith('K8') ||
    normName.startsWith('K9') ||
    normName.startsWith('X2') ||
    normName.startsWith('X3') ||
    normName.startsWith('C1') ||
    normName.startsWith('C2') ||
    normName.startsWith('M2') ||
    normName.startsWith('M3')
  ) {
    return false;
  }
  if (normName.startsWith('AST') || normCluster.includes('sct') || normCluster.includes('sosoft') || normCluster.includes('12l')) {
    return true;
  }
  return true;
}

import { detectMachineConfiguration } from '../types/pressTest';

/**
 * Convert PLANT_RAW_MACHINES to MachineMaster format for the app
 */
export const PLANT_MACHINES_MASTER: MachineMaster[] = PLANT_RAW_MACHINES.map((m) => {
  const config = detectMachineConfiguration(m.name, m.cluster);
  return {
    id: m.id,
    name: m.name,
    line: m.line,
    ws: m.ws,
    cluster: m.cluster,
    variants: [],
    totalLines: config.totalLines,
    machineType: config.type,
    pressConfig: config.pressConfig,
  };
});
