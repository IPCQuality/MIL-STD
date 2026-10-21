import React, { useState } from 'react';
import { Plus, Trash2, Cpu, RotateCcw, Check, Sparkles } from 'lucide-react';
import { MachineMaster, INITIAL_MACHINES } from '../types/pressTest';

interface SettingsViewProps {
  machines: MachineMaster[];
  onSaveMachines: (machines: MachineMaster[]) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  machines,
  onSaveMachines,
  onShowToast,
}) => {
  const [newMachineName, setNewMachineName] = useState('');
  const [newMachineVariants, setNewMachineVariants] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || '');
  const [newVariantInput, setNewVariantInput] = useState('');

  const currentMachine = machines.find((m) => m.id === selectedMachineId);

  // Add new machine handler
  const handleAddMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineName.trim()) return;

    const parsedVariants = newMachineVariants
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    const newId = `M-${String(machines.length + 1).padStart(2, '0')}`;
    const newMachine: MachineMaster = {
      id: newId,
      name: newMachineName.trim(),
      variants: parsedVariants.length > 0 ? parsedVariants : ['STD-01'],
      totalLines: 8,
    };

    const updated = [...machines, newMachine];
    await onSaveMachines(updated);
    setNewMachineName('');
    setNewMachineVariants('');
    setSelectedMachineId(newId);
    onShowToast(`Mesin ${newMachine.name} berhasil ditambahkan`);
  };

  // Add variant to current machine
  const handleAddVariantToMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariantInput.trim() || !currentMachine) return;

    const trimmed = newVariantInput.trim();
    if (currentMachine.variants.includes(trimmed)) {
      onShowToast('Varian sudah terdaftar pada mesin ini.');
      return;
    }

    const updated = machines.map((m) => {
      if (m.id === currentMachine.id) {
        return {
          ...m,
          variants: [...m.variants, trimmed],
        };
      }
      return m;
    });

    await onSaveMachines(updated);
    setNewVariantInput('');
    onShowToast(`Varian ${trimmed} berhasil ditambahkan ke ${currentMachine.name}`);
  };

  // Delete variant from current machine
  const handleDeleteVariant = async (variantToDelete: string) => {
    if (!currentMachine) return;
    if (currentMachine.variants.length <= 1) {
      onShowToast('Mesin harus memiliki minimal 1 varian aktif.');
      return;
    }

    const updated = machines.map((m) => {
      if (m.id === currentMachine.id) {
        return {
          ...m,
          variants: m.variants.filter((v) => v !== variantToDelete),
        };
      }
      return m;
    });

    await onSaveMachines(updated);
    onShowToast(`Varian ${variantToDelete} dihapus`);
  };

  // Reset to initial preset machines
  const handleResetDefaults = async () => {
    if (confirm('Kembalikan konfigurasi mesin ke preset pabrik awal?')) {
      await onSaveMachines(INITIAL_MACHINES);
      setSelectedMachineId(INITIAL_MACHINES[0].id);
      onShowToast('Preset mesin pabrik berhasil dipulihkan');
    }
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Machine List Sidebar */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Daftar Mesin ({machines.length})
            </h3>
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {machines.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMachineId(m.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                  selectedMachineId === m.id
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 opacity-70" />
                  <span className="font-semibold">{m.name}</span>
                </div>
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    selectedMachineId === m.id
                      ? 'bg-neutral-800 text-neutral-200'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {m.variants.length} Varian
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Machine Detail & Variant Management */}
        <div className="md:col-span-2 space-y-4">
          {currentMachine ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">{currentMachine.name}</h3>
                  <span className="text-xs text-neutral-500 font-mono">
                    ID: {currentMachine.id} · 8 Inspection Lines
                  </span>
                </div>
              </div>

              {/* Variant Badges */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-2">
                  Varian Terdaftar untuk {currentMachine.name}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentMachine.variants.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-lg text-xs font-medium"
                    >
                      <span className="font-mono">{v}</span>
                      <button
                        onClick={() => handleDeleteVariant(v)}
                        title={`Hapus varian ${v}`}
                        className="text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Add Variant Form */}
              <form onSubmit={handleAddVariantToMachine} className="pt-2 border-t border-neutral-100">
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Tambah Varian Baru ke {currentMachine.name}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVariantInput}
                    onChange={(e) => setNewVariantInput(e.target.value)}
                    placeholder="Contoh: AL-500, PRO-X"
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Varian</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
              Pilih mesin dari daftar di sebelah kiri untuk melihat dan mengelola varian.
            </div>
          )}

          {/* Add New Machine Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Tambah Mesin Baru ke Lini Produksi
            </h3>
            <form onSubmit={handleAddMachine} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nama Mesin
                  </label>
                  <input
                    type="text"
                    value={newMachineName}
                    onChange={(e) => setNewMachineName(e.target.value)}
                    placeholder="Contoh: Mesin 09"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Varian Awal (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={newMachineVariants}
                    onChange={(e) => setNewMachineVariants(e.target.value)}
                    placeholder="Contoh: ABC, XYZ, PART-01"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Daftarkan Mesin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
