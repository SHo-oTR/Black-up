import React from 'react';
import {
  X,
  Play,
  Square,
  RefreshCw,
  LogOut,
  AppWindow,
  Cpu,
} from 'lucide-react';

interface SystemTrayModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRunning: boolean;
  onToggleAuto: (active: boolean) => void;
  onStartManual: () => void;
}

export const SystemTrayModal: React.FC<SystemTrayModalProps> = ({
  isOpen,
  onClose,
  isRunning,
  onToggleAuto,
  onStartManual,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Windows Sistem Tepsisi (Tray) Simülasyonu
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 text-slate-700 dark:text-slate-300 space-y-1">
            <div className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Tauri 2 Tray API (src-tauri/src/tray.rs)</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Windows masaüstünde pencere küçültüldüğünde veya kapatıldığında uygulama arka plana geçer, tepside çalışır ve otomatik taramayı kesintisiz sürdürür.
            </p>
          </div>

          {/* Windows 11 Taskbar Tray Context Menu Simulation */}
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase text-slate-400 px-1 pb-1">
              Sağ Tık Tepsi Menüsü (Native Tray Menu)
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 shadow-md space-y-0.5">
              <button
                onClick={onClose}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 text-left font-medium transition-colors"
              >
                <AppWindow className="w-4 h-4 text-indigo-500" />
                <span>Pencereyi Aç (Öne Getir)</span>
              </button>

              <button
                onClick={() => {
                  onStartManual();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 text-left font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-indigo-500" />
                <span>Şimdi Yedekle</span>
              </button>

              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

              <button
                onClick={() => {
                  onToggleAuto(!isRunning);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 text-left font-medium transition-colors"
              >
                {isRunning ? (
                  <>
                    <Square className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Otomatik Yedeklemeyi Durdur</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                    <span>Otomatik Yedeklemeyi Başlat</span>
                  </>
                )}
              </button>

              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

              <button
                onClick={() => {
                  alert('Tauri uygulaması güvenle kapatıldı (app.exit(0)).');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış (Uygulamayı Kapat)</span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 text-center">
            Tepsi simgesine çift tıklandığında ana pencere otomatik olarak geri yüklenir.
          </div>
        </div>
      </div>
    </div>
  );
};
