import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Plus,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  Clock,
  Wrench,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  ChevronDown,
  Check,
  Shield,
  ArrowUpDown,
  X,
  AlertTriangle,
  User,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { MachineMaster } from '../types/pressTest';
import {
  CurrentOperator,
  saveMilStdMachineToFirestore,
  deleteMilStdMachineFromFirestore,
  subscribeToMilStdMachines,
} from '../services/firebase';

export type MilStdCategory = 'OVERHAUL' | 'CHANGE OVER' | 'STABILITY TINGGI' | 'PERBAIKAN PART';
export type MilStdStatus = 'Setting PMA' | 'In Progress' | 'Selesai';

export interface MilStdShiftEntry {
  no: number;
  tanggal: string; // e.g. "2026-10-13"
  time: string; // e.g. "08:30"
  info: string;
  status: MilStdStatus;
  user: string;
  turunan?: number;
  lineBocor?: string[];
}

export interface MilStdMachineItem {
  id: string;
  mesin: string;
  varian: string;
  category: MilStdCategory;
  case: string;
  line: string;
  ws?: string;
  cluster?: string;
  tanggal: string;
  infoTambahan?: string;
  overallStatus: MilStdStatus;
  shift1?: MilStdShiftEntry;
  shift2?: MilStdShiftEntry;
  shift3?: MilStdShiftEntry;
}

export const MILSTD_STORAGE_KEY = 'plant_milstd_machines_v2';

export const INITIAL_MILSTD_ITEMS: MilStdMachineItem[] = [];

interface MilStdViewProps {
  machines: MachineMaster[];
  currentUser: CurrentOperator | null;
}

export const MilStdView: React.FC<MilStdViewProps> = ({
  machines,
  currentUser,
}) => {
  const isAdmin = currentUser?.role === 'Admin';

  // State: List of monitored machines
  const [items, setItems] = useState<MilStdMachineItem[]>(() => {
    const saved = localStorage.getItem(MILSTD_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MILSTD_ITEMS;
      }
    }
    return INITIAL_MILSTD_ITEMS;
  });

  const saveItems = (newItems: MilStdMachineItem[]) => {
    setItems(newItems);
    localStorage.setItem(MILSTD_STORAGE_KEY, JSON.stringify(newItems));
    window.dispatchEvent(new CustomEvent('plant_milstd_updated', { detail: newItems }));
  };

  useEffect(() => {
    const unsub = subscribeToMilStdMachines((updated) => {
      setItems(updated);
    });

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setItems(e.detail);
      } else {
        const saved = localStorage.getItem(MILSTD_STORAGE_KEY);
        if (saved) {
          try {
            setItems(JSON.parse(saved));
          } catch {
            // ignore
          }
        }
      }
    };

    window.addEventListener('plant_milstd_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      unsub();
      window.removeEventListener('plant_milstd_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [currentUser]);

  // Category Tab state
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');

  // Modal: Add Machine
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [newMesin, setNewMesin] = useState(machines[0]?.name || 'AST 14-12L');
  const [newVarian, setNewVarian] = useState('');
  const [newCategory, setNewCategory] = useState<MilStdCategory>('PERBAIKAN PART');
  const [newCase, setNewCase] = useState('');
  const [newStatus, setNewStatus] = useState<MilStdStatus>('In Progress');
  const [newInfo, setNewInfo] = useState('');

  // Modal: Edit/Add Shift Note
  const [activeShiftTarget, setActiveShiftTarget] = useState<{
    itemId: string;
    machineName: string;
    shiftNum: 1 | 2 | 3;
    entry?: MilStdShiftEntry;
  } | null>(null);

  const [shiftStatusInput, setShiftStatusInput] = useState<MilStdStatus>('In Progress');
  const [shiftInfoInput, setShiftInfoInput] = useState('');
  const [shiftOperatorInput, setShiftOperatorInput] = useState('');
  const [shiftDateInput, setShiftDateInput] = useState('');
  const [shiftTimeInput, setShiftTimeInput] = useState('');

  // Modal: Delete confirmation
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Open modal for shift recording
  const handleOpenShiftModal = (
    item: MilStdMachineItem,
    shiftNum: 1 | 2 | 3,
    entry?: MilStdShiftEntry
  ) => {
    setActiveShiftTarget({
      itemId: item.id,
      machineName: item.mesin,
      shiftNum,
      entry,
    });
    setShiftStatusInput(entry?.status || item.overallStatus || 'In Progress');
    setShiftInfoInput(entry?.info || '');
    setShiftOperatorInput(entry?.user || currentUser?.displayName || 'Operator');
    setShiftDateInput(entry?.tanggal || new Date().toISOString().split('T')[0]);
    setShiftTimeInput(
      entry?.time ||
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    );
  };

  // Save Shift entry
  const handleSaveShiftEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShiftTarget) return;

    const { itemId, shiftNum, entry } = activeShiftTarget;
    const targetShiftKey = `shift${shiftNum}` as 'shift1' | 'shift2' | 'shift3';

    const updated = items.map((item) => {
      if (item.id === itemId) {
        const newEntry: MilStdShiftEntry = {
          no: entry?.no || shiftNum,
          tanggal: shiftDateInput || new Date().toISOString().split('T')[0],
          time:
            shiftTimeInput ||
            new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          info: shiftInfoInput.trim() || 'Pemeriksaan shift selesai.',
          status: shiftStatusInput,
          user: shiftOperatorInput.trim() || currentUser?.displayName || 'Operator',
        };

        // Determine updated overall machine status
        let updatedOverall = shiftStatusInput;
        if (shiftStatusInput === 'Selesai' && shiftNum === 3) {
          updatedOverall = 'Selesai';
        } else if (shiftStatusInput === 'Setting PMA') {
          updatedOverall = 'Setting PMA';
        }

        return {
          ...item,
          [targetShiftKey]: newEntry,
          overallStatus: updatedOverall,
        };
      }
      return item;
    });

    saveItems(updated);
    const itemToUpdate = updated.find((i) => i.id === itemId);
    if (itemToUpdate) {
      saveMilStdMachineToFirestore(itemToUpdate);
    }
    setActiveShiftTarget(null);
  };

  // Add new machine to monitoring
  const handleAddNewMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMesin.trim() || !newCase.trim()) return;

    const matchedMachine = machines.find((m) => m.name === newMesin);
    const today = new Date().toISOString().split('T')[0];

    const newItem: MilStdMachineItem = {
      id: `MIL-${Date.now().toString().slice(-4)}`,
      mesin: newMesin,
      varian: newVarian || matchedMachine?.variants?.[0] || 'Varian Reguler',
      category: newCategory,
      case: newCase,
      line: matchedMachine?.line || 'LINE A',
      ws: matchedMachine?.ws || '1A',
      cluster: matchedMachine?.cluster || 'Produksi',
      tanggal: today,
      infoTambahan: newInfo.trim() || undefined,
      overallStatus: newStatus,
      shift1: {
        no: 1,
        tanggal: today,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        info: `Monitoring kasus: ${newCase}. Memulai tahap ${newStatus}.`,
        status: newStatus,
        user: currentUser?.displayName || 'Operator',
      },
    };

    saveItems([newItem, ...items]);
    saveMilStdMachineToFirestore(newItem);
    setIsAddMachineOpen(false);
    setNewCase('');
    setNewInfo('');
    setNewVarian('');
  };

  // Toggle Selesai / Buka Kembali
  const handleToggleSelesai = (id: string) => {
    const updated = items.map((i) => {
      if (i.id === id) {
        const nextStatus: MilStdStatus = i.overallStatus === 'Selesai' ? 'In Progress' : 'Selesai';
        return {
          ...i,
          overallStatus: nextStatus,
        };
      }
      return i;
    });
    saveItems(updated);
    const itemToUpdate = updated.find((i) => i.id === id);
    if (itemToUpdate) {
      saveMilStdMachineToFirestore(itemToUpdate);
    }
  };

  // Delete machine
  const confirmDeleteMachine = () => {
    if (!deleteTargetId) return;
    deleteMilStdMachineFromFirestore(deleteTargetId);
    const updated = items.filter((i) => i.id !== deleteTargetId);
    saveItems(updated);
    setDeleteTargetId(null);
  };

  // Filtered items by category tab
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategoryTab !== 'ALL') {
        const catNorm = item.category.toUpperCase().replace(/\s+/g, '_');
        const tabNorm = selectedCategoryTab.toUpperCase().replace(/\s+/g, '_');
        if (catNorm !== tabNorm && !catNorm.includes(tabNorm)) return false;
      }
      return true;
    });
  }, [items, selectedCategoryTab]);

  // Group by category
  const groupedByCategory = useMemo(() => {
    const categories: MilStdCategory[] = [
      'OVERHAUL',
      'CHANGE OVER',
      'STABILITY TINGGI',
      'PERBAIKAN PART',
    ];

    return categories.map((cat) => ({
      category: cat,
      items: filteredItems.filter((item) => item.category === cat),
    }));
  }, [filteredItems]);

  // Active shift calculation (Shift 1: 06:00-14:00, Shift 2: 14:00-22:00, Shift 3: 22:00-06:00)
  const currentActiveShift = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 1;
    if (hour >= 14 && hour < 22) return 2;
    return 3;
  }, []);

  // Status Badge Component
  const renderStatusBadge = (st: MilStdStatus) => {
    switch (st) {
      case 'Setting PMA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Setting PMA
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            In Progress
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Selesai
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700">
            {st}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 3. Category Tabs & Quick Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-neutral-100 rounded-xl flex-1">
          {[
            { id: 'ALL', label: 'Semua Kategori' },
            { id: 'OVERHAUL', label: 'OVERHAUL' },
            { id: 'CHANGE OVER', label: 'CHANGE OVER' },
            { id: 'STABILITY TINGGI', label: 'STABILITY TINGGI' },
            { id: 'PERBAIKAN PART', label: 'PERBAIKAN PART' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategoryTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategoryTab === tab.id
                  ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

          <button
            type="button"
            onClick={() => setIsAddMachineOpen(true)}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mesin</span>
          </button>
        </div>

      {/* 5. Main Content: Interactive Machine Cards Grouped by Category */}
      {filteredItems.length === 0 ? (
        <div className="p-12 bg-white border border-neutral-200 rounded-2xl text-center space-y-3 shadow-2xs">
          <Activity className="w-10 h-10 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-800">
            Tidak ada data mesin ditemukan
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Belum ada data pada kategori ini. Silakan tambahkan monitoring mesin baru.
          </p>
          <button
            type="button"
            onClick={() => setIsAddMachineOpen(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mesin Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByCategory.map((group) => {
            if (group.items.length === 0) return null;

            return (
              <section key={group.category} className="space-y-4">
                {/* Category Header with Counter */}
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 inline-block" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-mono">
                      {group.category}
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 rounded-full">
                      {group.items.length} Mesin
                    </span>
                  </div>
                </div>

                {/* Machine Cards Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {group.items.map((item) => (
                    <article
                      key={item.id}
                      className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs hover:border-neutral-300 transition-all space-y-4"
                    >
                      {/* Top Machine Info Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-neutral-100 pb-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-neutral-950 font-sans tracking-tight">
                              {item.mesin}
                            </h3>
                            <span className="text-xs font-mono font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                              {item.line} · {item.ws || ''}
                            </span>
                            {item.cluster && (
                              <span className="text-xs text-neutral-400 font-medium">
                                ({item.cluster})
                              </span>
                            )}
                            {renderStatusBadge(item.overallStatus)}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
                            <span>
                              Varian: <strong className="text-neutral-800">{item.varian}</strong>
                            </span>
                            <span className="text-neutral-300">·</span>
                            <span>
                              Kasus: <strong className="text-neutral-800">{item.case}</strong>
                            </span>
                            {item.infoTambahan && (
                              <>
                                <span className="text-neutral-300">·</span>
                                <span className="text-neutral-500 italic">{item.infoTambahan}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Top Direct Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Toggle Selesai Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleSelesai(item.id)}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer active:scale-98 ${
                              item.overallStatus === 'Selesai'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/60'
                                : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                item.overallStatus === 'Selesai'
                                  ? 'text-emerald-600'
                                  : 'text-neutral-400'
                              }`}
                            />
                            <span>
                              {item.overallStatus === 'Selesai' ? 'Selesai ✓' : 'Tandai Selesai'}
                            </span>
                          </button>

                          {/* Quick Add Shift Note Button */}
                          <button
                            type="button"
                            onClick={() => {
                              // Auto pick next shift without log
                              const nextShift = !item.shift1
                                ? 1
                                : !item.shift2
                                ? 2
                                : !item.shift3
                                ? 3
                                : 3;
                              const existing = item[`shift${nextShift}` as 'shift1' | 'shift2' | 'shift3'];
                              handleOpenShiftModal(item, nextShift, existing);
                            }}
                            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Catat Shift</span>
                          </button>

                          {/* Delete Machine Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(item.id)}
                            title="Hapus monitoring mesin ini"
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 3 Shift Columns Display (Shift 1, Shift 2, Shift 3) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        {[1, 2, 3].map((sNum) => {
                          const shiftKey = `shift${sNum}` as 'shift1' | 'shift2' | 'shift3';
                          const entry = item[shiftKey];
                          const isShiftActive = sNum === currentActiveShift;
                          const shiftSchedule =
                            sNum === 1
                              ? '06:00 - 14:00'
                              : sNum === 2
                              ? '14:00 - 22:00'
                              : '22:00 - 06:00';

                          return (
                            <div
                              key={sNum}
                              className={`rounded-xl p-3 border transition-all flex flex-col justify-between space-y-2.5 ${
                                isShiftActive
                                  ? 'ring-1 ring-emerald-500/70 bg-emerald-50/20 border-emerald-300 shadow-2xs'
                                  : entry
                                  ? 'bg-neutral-50/70 border-neutral-200/90'
                                  : 'bg-neutral-50/30 border-dashed border-neutral-200 hover:border-neutral-300'
                              }`}
                            >
                              {/* Shift Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-neutral-900 font-sans">
                                    Shift {sNum}
                                  </span>
                                  {isShiftActive && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white leading-none">
                                      Aktif
                                    </span>
                                  )}
                                  <span className="text-[10px] font-mono text-neutral-400">
                                    ({shiftSchedule})
                                  </span>
                                </div>
                                {entry?.status && renderStatusBadge(entry.status)}
                              </div>

                              {/* Shift Content or Empty State */}
                              {entry ? (
                                <div className="space-y-1.5 flex-1">
                                  <p className="text-xs text-neutral-800 leading-relaxed font-medium">
                                    {entry.info}
                                  </p>
                                  {entry.lineBocor && entry.lineBocor.length > 0 && (
                                    <div className="text-[11px] text-rose-600 font-semibold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                                      Bocor: {entry.lineBocor.join(', ')}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-200/60 font-mono tabular-nums">
                                    <span>
                                      {entry.tanggal} {entry.time ? `· ${entry.time}` : ''}
                                    </span>
                                    <span className="font-sans font-medium text-neutral-700 truncate max-w-[110px]">
                                      {entry.user}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="py-2 text-center text-xs text-neutral-400 italic">
                                  Belum ada catatan shift {sNum}
                                </div>
                              )}

                              {/* Action per Shift */}
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenShiftModal(item, sNum as 1 | 2 | 3, entry)}
                                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                                    entry
                                      ? 'bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 shadow-2xs'
                                      : 'bg-white hover:bg-neutral-900 hover:text-white text-neutral-700 border border-neutral-200 shadow-2xs'
                                  }`}
                                >
                                  {entry ? (
                                    <>
                                      <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                                      <span>Ubah Catatan</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Catat Shift {sNum}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Tambah Mesin Monitoring Baru */}
      {isAddMachineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white border border-neutral-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Tambah Monitoring Mesin (MIL-STD)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMachineOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewMachine} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Pilih Mesin Pabrik <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newMesin}
                  onChange={(e) => {
                    setNewMesin(e.target.value);
                    const found = machines.find((m) => m.name === e.target.value);
                    if (found?.variants?.[0]) setNewVarian(found.variants[0]);
                  }}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  required
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.line} · {m.cluster || 'WS'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Kategori Monitoring <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MilStdCategory)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="OVERHAUL">OVERHAUL</option>
                    <option value="CHANGE OVER">CHANGE OVER</option>
                    <option value="STABILITY TINGGI">STABILITY TINGGI</option>
                    <option value="PERBAIKAN PART">PERBAIKAN PART</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Status Awal
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as MilStdStatus)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="Setting PMA">Setting PMA</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Varian Produk
                </label>
                <input
                  type="text"
                  value={newVarian}
                  onChange={(e) => setNewVarian(e.target.value)}
                  placeholder="Contoh: Sosoft Hijau (TCK08P)"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Deskripsi Kasus / Pekerjaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCase}
                  onChange={(e) => setNewCase(e.target.value)}
                  placeholder="Contoh: Ganti Rotary Joint / Commissioning Varian Tylose"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Informasi Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={newInfo}
                  onChange={(e) => setNewInfo(e.target.value)}
                  placeholder="Catatan tambahan spesifikasi part atau instruksi teknisi..."
                  className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddMachineOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan Mesin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Catat / Ubah Shift Note */}
      {activeShiftTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white border border-neutral-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  Catat Shift {activeShiftTarget.shiftNum} · {activeShiftTarget.machineName}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {activeShiftTarget.shiftNum === 1
                    ? 'Shift 1 (06:00 - 14:00)'
                    : activeShiftTarget.shiftNum === 2
                    ? 'Shift 2 (14:00 - 22:00)'
                    : 'Shift 3 (22:00 - 06:00)'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveShiftTarget(null)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShiftEntry} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Status Shift
                </label>
                <select
                  value={shiftStatusInput}
                  onChange={(e) => setShiftStatusInput(e.target.value as MilStdStatus)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                >
                  <option value="Setting PMA">Setting PMA</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Catatan Progres Pengerjaan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={shiftInfoInput}
                  onChange={(e) => setShiftInfoInput(e.target.value)}
                  placeholder="Contoh: Penggantian part selesai, uji running 1000 pack aman tanpa bocor."
                  className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={shiftDateInput}
                    onChange={(e) => setShiftDateInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Jam Catat
                  </label>
                  <input
                    type="text"
                    value={shiftTimeInput}
                    onChange={(e) => setShiftTimeInput(e.target.value)}
                    placeholder="08:30"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nama Operator / Teknisi Bertugas
                </label>
                <input
                  type="text"
                  value={shiftOperatorInput}
                  onChange={(e) => setShiftOperatorInput(e.target.value)}
                  placeholder="Nama pengisi catatan"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setActiveShiftTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Catatan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Konfirmasi Hapus Mesin */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white border border-neutral-200 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-neutral-900">Hapus Monitoring Mesin?</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Tindakan ini akan menghapus data mesin dan riwayat shift terkait dari daftar aktif.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteMachine}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
