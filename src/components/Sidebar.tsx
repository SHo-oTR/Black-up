import React from 'react';
import {
  LayoutDashboard,
  Settings,
  History,
  FileText,
  CheckCircle2,
  HardDrive,
  Cpu,
} from 'lucide-react';

export type TabType = 'overview' | 'settings' | 'versions' | 'logs';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isRunning: boolean;
  totalBackedUp: number;
  errorCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isRunning,
  totalBackedUp,
  errorCount,
}) => {
  const navItems = [
    {
      id: 'overview' as TabType,
      label: 'Genel Bakış',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'settings' as TabType,
      label: 'Yedekleme Ayarları',
      icon: Settings,
      badge: null,
    },
    {
      id: 'versions' as TabType,
      label: 'Sürüm & Geri Yükleme',
      icon: History,
      badge: totalBackedUp > 0 ? `${totalBackedUp}` : null,
    },
    {
      id: 'logs' as TabType,
      label: 'İşlem Geçmişi',
      icon: FileText,
      badge: errorCount > 0 ? `${errorCount} hata` : null,
      badgeAlert: errorCount > 0,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          Masaüstü Menüsü
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors text-left ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-mono ${
                    item.badgeAlert
                      ? 'text-rose-500 font-semibold'
                      : isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Engine Status Bottom Panel */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
        <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>Rust Motoru</span>
            </span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Çalışıyor
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Yerel SQLite</span>
            </span>
            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
              autobackup.db
            </span>
          </div>

          <div className="pt-1 text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
            Tauri 2 IPC · Windows 10/11 x64
          </div>
        </div>
      </div>
    </aside>
  );
};
