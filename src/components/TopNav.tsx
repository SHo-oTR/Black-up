import React from 'react';
import {
  Shield,
  LayoutDashboard,
  Settings,
  History,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { TabType } from './Sidebar';

interface TopNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isRunning: boolean;
  isScanning: boolean;
  totalBackedUp: number;
  errorCount: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onMinimizeToTray?: () => void;
  onOpenTrayPreview?: () => void;
  onOpenBuildExe?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  isRunning,
  isScanning,
  totalBackedUp,
  errorCount,
}) => {
  const tabs = [
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
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 select-none shrink-0 z-30 px-3 py-2 flex items-center justify-between gap-3 shadow-xs">
      {/* Brand & Status */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Shield className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-slate-100 hidden sm:inline">
            Rust AutoBackup
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">v1.0.0</span>
        </div>

        {/* Protection state badge */}
        <div className="flex items-center gap-1.5 pl-2 ml-1 border-l border-slate-200 dark:border-slate-800 text-[11px]">
          <span
            className={`w-2 h-2 rounded-full ${
              isScanning
                ? 'bg-amber-400 animate-ping'
                : isRunning
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-slate-400'
            }`}
          />
          <span
            className={`font-semibold hidden lg:inline ${
              isScanning
                ? 'text-amber-500'
                : isRunning
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            {isScanning
              ? 'Taranıyor...'
              : isRunning
              ? 'Koruma Aktif'
              : 'Durduruldu'}
          </span>
        </div>
      </div>

      {/* Center Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.badgeAlert
                      ? 'bg-rose-500/10 text-rose-500 font-bold'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

    </nav>
  );
};
