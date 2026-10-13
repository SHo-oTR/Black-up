import React, { useState } from 'react';
import {
  Play,
  Square,
  RefreshCw,
  LogOut,
  AppWindow,
  Shield,
  Wifi,
  Volume2,
  ChevronUp,
  MousePointerClick,
  X,
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
  const [contextMenuOpen, setContextMenuOpen] = useState(true);
  const [menuPosition, setMenuPosition] = useState<{ x?: number; y?: number } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isAppExited, setIsAppExited] = useState(false);

  if (!isOpen) return null;

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  const currentTime = new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const currentDate = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleExitApp = () => {
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      import('@tauri-apps/api/core')
        .then(() => {
          window.close();
        })
        .catch(() => window.close());
    } else {
      setIsAppExited(true);
    }
  };

  if (isAppExited) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <LogOut className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-base font-bold text-slate-100">
            Rust AutoBackup Kapatıldı
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Masaüstü uygulaması ve arka plan koruma servisleri tamamen durduruldu.
          </p>
          <button
            onClick={() => {
              setIsAppExited(false);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            Uygulamayı Tekrar Başlat (Önizleme)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onContextMenu={handleGlobalContextMenu}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex flex-col justify-between select-none"
    >
      {/* Top Notification & Quick Action Bar */}
      <div className="p-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="font-semibold text-slate-200">
            Uygulama Sistem Tepsisine Küçültüldü:
          </span>
          <span className="text-slate-400 hidden sm:inline">
            {isRunning ? 'Arka planda koruma aktif' : 'Koruma duraklatıldı'}
          </span>
          <span className="text-amber-400 font-medium hidden md:inline ml-2 flex items-center gap-1">
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>(Ekranda herhangi bir yere SAĞ TIKLAYARAK menüyü açabilirsiniz)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <AppWindow className="w-3.5 h-3.5" />
            <span>Pencereyi Göster</span>
          </button>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-rose-500/30"
            title="Programı Tamamen Kapat"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Programı Kapat</span>
          </button>
        </div>
      </div>

      {/* Center Screen: Interactive Info & Right-Click Helper */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 text-center cursor-context-menu"
        onClick={() => {
          // If clicked empty space, toggle or close context menu
          if (menuPosition) setContextMenuOpen(false);
        }}
      >
        <div className="max-w-md w-full p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Windows Sistem Tepsisi (Tray) Modu
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Program arka planda çalışmaya devam ediyor. Görev çubuğundaki simgeye veya bu ekranın herhangi bir yerine{' '}
              <strong className="text-indigo-400 underline">sağ tıklayarak</strong> sağ tık menüsünü açabilir, uygulamayı kapatabilir veya ayarları yönetebilirsiniz.
            </p>
          </div>

          {/* Direct action buttons in center */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            <button
              onClick={onClose}
              className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <AppWindow className="w-3.5 h-3.5" />
              <span>Pencereyi Aç</span>
            </button>
            <button
              onClick={() => {
                setMenuPosition(null);
                setContextMenuOpen(true);
              }}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <MousePointerClick className="w-3.5 h-3.5 text-indigo-400" />
              <span>Menüyü Göster</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating or Docked Windows Context Menu */}
      {contextMenuOpen && (
        <div
          style={
            menuPosition
              ? {
                  position: 'fixed',
                  left: Math.min(window.innerWidth - 260, Math.max(10, menuPosition.x ?? 100)),
                  top: Math.min(window.innerHeight - 250, Math.max(10, menuPosition.y ?? 100)),
                }
              : undefined
          }
          className={`${
            menuPosition
              ? 'z-60 animate-in fade-in zoom-in-95 duration-100'
              : 'absolute bottom-14 right-6 animate-in fade-in slide-in-from-bottom-2 duration-150 z-50'
          } w-64 rounded-xl border border-slate-700 bg-slate-900/98 shadow-2xl p-1.5 text-xs text-slate-200 backdrop-blur select-none`}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1 flex items-center justify-between">
            <span>Rust AutoBackup Menüsü</span>
            <span
              className={`font-mono text-[10px] font-bold ${
                isRunning ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isRunning ? 'Aktif' : 'Durduruldu'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-left font-medium transition-colors"
          >
            <AppWindow className="w-4 h-4 text-indigo-400" />
            <span>Pencereyi Aç (Öne Getir)</span>
          </button>

          <button
            onClick={() => {
              onStartManual();
              setContextMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-left font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <span>Şimdi Yedekle</span>
          </button>

          <div className="h-px bg-slate-800 my-1" />

          <button
            onClick={() => onToggleAuto(!isRunning)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-left font-medium transition-colors"
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Otomatik Taramayı Durdur</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                <span>Otomatik Taramayı Başlat</span>
              </>
            )}
          </button>

          <div className="h-px bg-slate-800 my-1" />

          <button
            onClick={() => {
              setContextMenuOpen(false);
              setShowExitConfirm(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white text-left font-semibold transition-colors border border-rose-900/50"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Programı Kapat (Çıkış)</span>
          </button>
        </div>
      )}

      {/* Windows Taskbar Bar at bottom */}
      <div
        onContextMenu={handleGlobalContextMenu}
        className="h-12 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 select-none text-slate-300 cursor-context-menu"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">
            Windows Görev Çubuğu
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            (Simgeye sağ tıklayarak menüyü açabilirsiniz)
          </span>
        </div>

        {/* System Tray icons corner */}
        <div className="flex items-center gap-3">
          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />

          {/* THE TRAY ICON WITH RIGHT-CLICK & CLICK HANDLERS */}
          <div
            onContextMenu={handleGlobalContextMenu}
            onClick={() => {
              setMenuPosition(null);
              setContextMenuOpen(prev => !prev);
            }}
            onDoubleClick={onClose}
            title="Rust AutoBackup (Sağ Tık: Menüyü Aç / Sol Tık: Pencereyi Aç)"
            className="relative p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer flex items-center justify-center transition-colors border border-indigo-500/50 bg-indigo-500/20 hover:scale-105"
          >
            <Shield className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
            <span
              className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${
                isRunning ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>

          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          <Wifi className="w-3.5 h-3.5 text-slate-400" />

          {/* Clock & Date */}
          <div className="text-right text-[11px] leading-tight font-mono text-slate-400 pl-2 border-l border-slate-800">
            <div>{currentTime}</div>
            <div>{currentDate}</div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-70 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="max-w-xs w-full p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3.5 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-500">
              <LogOut className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">
              Programı Kapatmak İstiyor musunuz?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uygulama kapatıldığında otomatik periyodik yedeklemeler durdurulacaktır.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={handleExitApp}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs"
              >
                Programı Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
