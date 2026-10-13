import React from 'react';
import { Shield, Moon, Sun, Minus, Square, X, HardDrive } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isRunning: boolean;
  isScanning: boolean;
  onMinimizeToTray: () => void;
  onOpenTrayPreview: () => void;
  onOpenBuildExe: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  isRunning,
  isScanning,
  onMinimizeToTray,
  onOpenTrayPreview,
  onOpenBuildExe,
}) => {
  return (
    <header className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur flex items-center justify-between px-4 select-none shrink-0 z-30">
      {/* App brand & icon */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Shield className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100">
            Rust AutoBackup
          </span>
          <span className="text-[11px] text-slate-400 font-mono">v1.0.0 (x64)</span>
        </div>

        {/* Status indicator unboxed text */}
        <div className="hidden sm:flex items-center gap-2 ml-4 text-xs font-medium">
          <span className="inline-block w-2 h-2 rounded-full relative">
            <span
              className={`absolute inset-0 rounded-full ${
                isScanning
                  ? 'bg-amber-400 animate-ping'
                  : isRunning
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            <span
              className={`relative block w-2 h-2 rounded-full ${
                isScanning ? 'bg-amber-500' : isRunning ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </span>
          <span className="text-slate-600 dark:text-slate-300">
            {isScanning
              ? 'Dosyalar Taranıyor ve Yedekleniyor'
              : isRunning
              ? 'Otomatik Tarama Aktif'
              : 'Yedekleme Duraklatıldı'}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenBuildExe}
          title="Windows EXE Dosyası Üret ve İndir"
          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>EXE Üret / İndir</span>
        </button>

        <button
          onClick={onOpenTrayPreview}
          title="Windows Sistem Tepsisi (Tray) Görünümünü İncele"
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <span className="hidden md:inline">Tepsi Önizleme</span>
        </button>

        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          aria-label="Tema Değiştir"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Windows standard titlebar window controls */}
        <div className="flex items-center ml-2 border-l border-slate-200 dark:border-slate-800 pl-2">
          <button
            onClick={onMinimizeToTray}
            title="Sistem Tepsisine Küçült"
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            title="Pencereyi Büyüt"
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={onMinimizeToTray}
            title="Kapat (Sistem Tepsisinde Çalışmaya Devam Eder)"
            className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
