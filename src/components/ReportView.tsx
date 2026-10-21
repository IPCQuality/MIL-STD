import React, { useState, useMemo, useEffect } from 'react';
import {
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Calendar,
  Layers,
  Activity,
  Clock,
} from 'lucide-react';
import {
  MilStdMachineItem,
  MilStdCategory,
  MilStdStatus,
  MILSTD_STORAGE_KEY,
  INITIAL_MILSTD_ITEMS,
} from './MilStdView';

export const ReportView: React.FC = () => {
  const [machines, setMachines] = useState<MilStdMachineItem[]>(() => {
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

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setMachines(e.detail);
      } else {
        const saved = localStorage.getItem(MILSTD_STORAGE_KEY);
        if (saved) {
          try {
            setMachines(JSON.parse(saved));
          } catch {
            // ignore
          }
        }
      }
    };
    window.addEventListener('plant_milstd_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('plant_milstd_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const total = machines.length;
  const selesaiCount = machines.filter((m) => m.overallStatus === 'Selesai').length;
  const inProgressCount = machines.filter((m) => m.overallStatus === 'In Progress').length;
  const settingPmaCount = machines.filter((m) => m.overallStatus === 'Setting PMA').length;
  const selesaiRate = total > 0 ? ((selesaiCount / total) * 100).toFixed(1) : '0';

  // Category breakdown
  const categoryStats = useMemo(() => {
    const cats: MilStdCategory[] = [
      'OVERHAUL',
      'CHANGE OVER',
      'STABILITY TINGGI',
      'PERBAIKAN PART',
    ];
    return cats.map((cat) => {
      const inCat = machines.filter((m) => m.category === cat);
      const done = inCat.filter((m) => m.overallStatus === 'Selesai').length;
      return {
        category: cat,
        count: inCat.length,
        done,
        rate: inCat.length > 0 ? Math.round((done / inCat.length) * 100) : 0,
      };
    });
  }, [machines]);

  // Line breakdown
  const lineStats = useMemo(() => {
    const lines = ['LINE A', 'LINE B', 'LINE C', 'WW', 'OT'];
    return lines.map((line) => {
      const inLine = machines.filter((m) => m.line === line);
      return {
        line,
        count: inLine.length,
      };
    });
  }, [machines]);

  // Export CSV
  const handleExportCSV = () => {
    if (machines.length === 0) return;

    const headers = [
      'ID',
      'Mesin',
      'Line',
      'WS',
      'Kategori',
      'Kasus',
      'Varian',
      'Status Mesin',
      'Tanggal Input',
      'Shift 1 Status',
      'Shift 2 Status',
      'Shift 3 Status',
    ];

    const rows = machines.map((m) => [
      `"${m.id}"`,
      `"${m.mesin}"`,
      `"${m.line}"`,
      `"${m.ws || ''}"`,
      `"${m.category}"`,
      `"${m.case.replace(/"/g, '""')}"`,
      `"${m.varian.replace(/"/g, '""')}"`,
      `"${m.overallStatus}"`,
      `"${m.tanggal}"`,
      `"${m.shift1?.status || '-'}"`,
      `"${m.shift2?.status || '-'}"`,
      `"${m.shift3?.status || '-'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_milstd_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-500" />
            <span>Distribusi per Kategori Kasus</span>
          </h2>

          <div className="space-y-3">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-800">{cat.category}</span>
                  <span className="font-mono text-neutral-500">
                    {cat.done} / {cat.count} Selesai ({cat.rate}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-neutral-900 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${cat.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Line Breakdown */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-neutral-500" />
            <span>Distribusi Mesin per Lini Produksi</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {lineStats.map((item) => (
              <div
                key={item.line}
                className="p-3 bg-neutral-50/70 border border-neutral-200 rounded-xl space-y-1"
              >
                <span className="text-[11px] font-mono font-bold text-neutral-500 block">
                  {item.line}
                </span>
                <span className="text-xl font-bold font-mono text-neutral-900">{item.count}</span>
                <span className="text-[10px] text-neutral-400 block">mesin aktif</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
