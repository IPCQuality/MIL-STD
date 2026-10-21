/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Activity,
  Plus,
} from 'lucide-react';
import {
  MachineMaster,
  INITIAL_MACHINES,
} from './types/pressTest';
import {
  auth,
  saveMachinesMaster,
  getCachedMachines,
  getCachedOperator,
  saveCachedOperator,
  CurrentOperator,
} from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Components
import { Login } from './components/Login';
import { Sidebar, ActiveNav } from './components/Sidebar';
import { ReportView } from './components/ReportView';
import { SettingsView } from './components/SettingsView';
import { HistoryView } from './components/HistoryView';
import { MilStdView } from './components/MilStdView';
import { Toast } from './components/Toast';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<CurrentOperator | null>(() => {
    return getCachedOperator();
  });
  const [authChecked, setAuthChecked] = useState(false);

  // Navigation State - Default to 'mil-std'
  const [activeNav, setActiveNav] = useState<ActiveNav>('mil-std');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Machine Master Data State
  const [machines, setMachines] = useState<MachineMaster[]>(() => getCachedMachines());

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const op: CurrentOperator = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Operator',
          email: user.email || 'user@domain.com',
          role: 'Admin',
          photoURL: user.photoURL,
        };
        setCurrentUser(op);
        saveCachedOperator(op);
      }
      setAuthChecked(true);
    });

    return () => unsubscribeAuth();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // offline logout
    }
    setCurrentUser(null);
    saveCachedOperator(null);
    showToast('Berhasil keluar dari akun.');
  };



  // Save Machines
  const handleSaveMachines = async (newMachines: MachineMaster[]) => {
    setMachines(newMachines);
    try {
      await saveMachinesMaster(newMachines);
    } catch {
      // Local fallback
    }
    showToast('Daftar mesin pabrik berhasil diperbarui');
  };

  // Login Gate
  if (!currentUser && authChecked) {
    return (
      <Login
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Selamat datang, ${user.displayName}`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Sidebar Desktop */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          activeNav={activeNav}
          onSelectNav={(nav) => setActiveNav(nav)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <Sidebar
              activeNav={activeNav}
              onSelectNav={(nav) => {
                setActiveNav(nav);
                setMobileMenuOpen(false);
              }}
              collapsed={false}
              onToggleCollapse={() => {}}
              currentUser={currentUser}
              onLogout={handleLogout}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Mobile Top Header (Tinggi proporsional ~76px, garis aksen vertikal, judul jelas) */}
        <header className="md:hidden min-h-[76px] bg-white border-b border-neutral-200/80 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka Menu"
              className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Accent Vertical Bar matching active page */}
            <div
              className={`w-1 self-stretch min-h-[36px] rounded-full shrink-0 ${
                activeNav === 'mil-std'
                  ? 'bg-emerald-500'
                  : activeNav === 'history'
                  ? 'bg-indigo-500'
                  : activeNav === 'report'
                  ? 'bg-violet-500'
                  : 'bg-amber-500'
              }`}
            />

            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-neutral-900 tracking-tight truncate uppercase font-sans">
                {activeNav === 'mil-std'
                  ? 'MIL-STD MONITORING'
                  : activeNav === 'history'
                  ? 'RIWAYAT SHIFT'
                  : activeNav === 'report'
                  ? 'LAPORAN ANALITIK'
                  : 'PENGATURAN MESIN'}
              </span>
              <span className="text-[11px] text-neutral-500 truncate">
                {activeNav === 'mil-std'
                  ? 'Pemantauan Shift Mesin'
                  : activeNav === 'history'
                  ? 'Log Serah Terima Lini'
                  : activeNav === 'report'
                  ? 'Statistik & Ringkasan'
                  : 'Master Data & Varian'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pl-2">
            <div
              className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shadow-xs relative"
              title={currentUser?.displayName || 'Operator'}
            >
              {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
          </div>
        </header>

        {/* View Router */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* VIEW: MIL-STD */}
          {activeNav === 'mil-std' && (
            <MilStdView
              machines={machines}
              currentUser={currentUser}
            />
          )}

          {/* VIEW: HISTORY */}
          {activeNav === 'history' && <HistoryView />}

          {/* VIEW: REPORT */}
          {activeNav === 'report' && <ReportView />}

          {/* VIEW: SETTINGS */}
          {activeNav === 'settings' && (
            <SettingsView
              machines={machines}
              onSaveMachines={handleSaveMachines}
              onShowToast={showToast}
            />
          )}
        </div>
      </main>

      {/* Floating Feedback Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
