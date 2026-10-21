import React, { useState, useMemo, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  RotateCcw,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Activity,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  MilStdMachineItem,
  MilStdCategory,
  MilStdStatus,
  MILSTD_STORAGE_KEY,
  INITIAL_MILSTD_ITEMS,
} from './MilStdView';

export interface HistoryShiftLog {
  id: string;
  machineId: string;
  mesin: string;
  line: string;
  ws?: string;
  cluster?: string;
  varian: string;
  category: MilStdCategory;
  case: string;
  shiftNum: number;
  tanggal: string;
  time: string;
  info: string;
  status: MilStdStatus;
  user: string;
  lineBocor?: string[];
}

export const HistoryView: React.FC = () => {
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

  // Flatten machines into shift log entries
  const allLogs = useMemo(() => {
    const logs: HistoryShiftLog[] = [];
    machines.forEach((item) => {
      [1, 2, 3].forEach((sNum) => {
        const shiftKey = `shift${sNum}` as 'shift1' | 'shift2' | 'shift3';
        const entry = item[shiftKey];
        if (entry) {
          logs.push({
            id: `${item.id}-S${sNum}-${entry.tanggal}-${entry.no}`,
            machineId: item.id,
            mesin: item.mesin,
            line: item.line,
            ws: item.ws,
            cluster: item.cluster,
            varian: item.varian,
            category: item.category,
            case: item.case,
            shiftNum: sNum,
            tanggal: entry.tanggal,
            time: entry.time,
            info: entry.info,
            status: entry.status,
            user: entry.user,
            lineBocor: entry.lineBocor,
          });
        }
      });
    });
    return logs;
  }, [machines]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filtered & Sorted
  const filteredLogs = useMemo(() => {
    let result = allLogs.filter((log) => {
      if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
      if (shiftFilter !== 'all' && log.shiftNum.toString() !== shiftFilter) return false;
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const m = log.mesin.toLowerCase().includes(q);
        const v = log.varian.toLowerCase().includes(q);
        const c = log.case.toLowerCase().includes(q);
        const u = log.user.toLowerCase().includes(q);
        const info = log.info.toLowerCase().includes(q);
        if (!m && !v && !c && !u && !info) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      const timeA = new Date(`${a.tanggal}T${a.time || '00:00'}`).getTime();
      const timeB = new Date(`${b.tanggal}T${b.time || '00:00'}`).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [allLogs, categoryFilter, shiftFilter, statusFilter, searchQuery, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage]);

  const handleReset = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setShiftFilter('all');
    setStatusFilter('all');
    setSortOrder('newest');
    setCurrentPage(1);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Mesin',
      'Line',
      'WS',
      'Kategori',
      'Kasus',
      'Varian',
      'Shift',
      'Tanggal',
      'Jam',
      'Status',
      'Operator',
      'Catatan',
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.mesin}"`,
      `"${log.line}"`,
      `"${log.ws || ''}"`,
      `"${log.category}"`,
      `"${log.case.replace(/"/g, '""')}"`,
      `"${log.varian.replace(/"/g, '""')}"`,
      `"Shift ${log.shiftNum}"`,
      `"${log.tanggal}"`,
      `"${log.time}"`,
      `"${log.status}"`,
      `"${log.user.replace(/"/g, '""')}"`,
      `"${log.info.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat_milstd_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatus = (st: MilStdStatus) => {
    switch (st) {
      case 'Setting PMA':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Setting PMA
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            In Progress
          </span>
        );
      case 'Selesai':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Selesai
          </span>
        );
      default:
        return <span>{st}</span>;
    }
  };

  return (
    <div className="space-y-6">

      {/* Filter Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari mesin, varian, operator, atau catatan..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-700 cursor-pointer focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="OVERHAUL">OVERHAUL</option>
            <option value="CHANGE OVER">CHANGE OVER</option>
            <option value="STABILITY TINGGI">STABILITY TINGGI</option>
            <option value="PERBAIKAN PART">PERBAIKAN PART</option>
          </select>

          {/* Shift Filter */}
          <select
            value={shiftFilter}
            onChange={(e) => {
              setShiftFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-700 cursor-pointer focus:outline-none"
          >
            <option value="all">Semua Shift</option>
            <option value="1">Shift 1</option>
            <option value="2">Shift 2</option>
            <option value="3">Shift 3</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-700 cursor-pointer focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="Setting PMA">Setting PMA</option>
            <option value="In Progress">In Progress</option>
            <option value="Selesai">Selesai</option>
          </select>

          {/* Sort */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <span>{sortOrder === 'newest' ? 'Terbaru' : 'Terlama'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filter</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
        {paginatedLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <History className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-neutral-800">Tidak ada riwayat shift</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Tidak ada catatan shift yang cocok dengan kriteria filter saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                  <th className="py-3 px-4">Tanggal & Jam</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Mesin & Line</th>
                  <th className="py-3 px-4">Kategori & Kasus</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Catatan Progres</th>
                  <th className="py-3 px-4">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-neutral-600">
                      <div>{log.tanggal}</div>
                      <div className="text-[10px] text-neutral-400">{log.time || '-'}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-neutral-800">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 font-mono text-neutral-700">
                        Shift {log.shiftNum}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-neutral-900">{log.mesin}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        {log.line} · {log.ws || ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="font-semibold text-neutral-900 truncate">{log.case}</div>
                      <div className="text-[10px] text-neutral-500 truncate">
                        {log.category} · {log.varian}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{renderStatus(log.status)}</td>
                    <td className="py-3 px-4 max-w-[260px]">
                      <div className="text-neutral-800 line-clamp-2 leading-relaxed">
                        {log.info}
                      </div>
                      {log.lineBocor && log.lineBocor.length > 0 && (
                        <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                          Bocor: {log.lineBocor.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-700 font-medium">
                      {log.user}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>
              Menampilkan {paginatedLogs.length} dari {filteredLogs.length} catatan
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 disabled:opacity-40 cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="px-2 font-mono font-bold text-neutral-800">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 disabled:opacity-40 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
