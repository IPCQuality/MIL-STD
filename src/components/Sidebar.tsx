import React from 'react';
import {
  Activity,
  CheckSquare,
  History,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Shield,
  X,
} from 'lucide-react';
import { CurrentOperator } from '../services/firebase';

export type ActiveNav = 'mil-std' | 'history' | 'report' | 'settings';

interface SidebarProps {
  activeNav: ActiveNav;
  onSelectNav: (nav: ActiveNav) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: CurrentOperator | null;
  onLogout: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  collapsed,
  onToggleCollapse,
  currentUser,
  onLogout,
  onCloseMobile,
}) => {
  // Navigation menus: MIL-STD, HISTORY, REPORT, SETTINGS
  const menuItems: { id: ActiveNav; label: string; icon: React.ElementType }[] = [
    { id: 'mil-std', label: 'MIL-STD', icon: Activity },
    { id: 'history', label: 'HISTORY', icon: History },
    { id: 'report', label: 'REPORT', icon: FileBarChart },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-white flex flex-col justify-between transition-all duration-200 z-30 select-none overflow-hidden ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-100/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-xs shrink-0 tracking-wider">
              QC
            </div>
            {!collapsed && (
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-800 font-mono">
                Plant QA
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Perluas sidebar' : 'Kecilkan sidebar'}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer hidden md:flex items-center justify-center"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              title="Tutup Menu"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer md:hidden flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items - matching WEB desktop.png circular style and clean labels */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectNav(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer group ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-950 font-bold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                {/* Circle Icon Indicator matching WEB desktop.png */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                {!collapsed && <span className="tracking-wide">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Account Footer matching Section 2 & WEB desktop.png */}
      <div className="p-3 border-t border-neutral-100">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-neutral-900 truncate">
                    {currentUser?.displayName || 'Operator'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block" />
                    <span className="font-medium font-mono">{currentUser?.role || 'Operator'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                title="Keluar / Logout"
                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs"
              title={`${currentUser?.displayName} (${currentUser?.role})`}
            >
              {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Logout"
              className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
