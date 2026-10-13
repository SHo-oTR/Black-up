import React, { useState, useRef } from 'react';
import { Folder, X, FolderPlus, Check, HardDrive, Laptop, Server } from 'lucide-react';

interface FolderPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPath: (path: string) => void;
  title?: string;
  defaultPath?: string;
  mode?: 'source' | 'target';
}

export const FolderPickerModal: React.FC<FolderPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectPath,
  title = 'Klasör Seç (Gözat)',
  defaultPath = '',
  mode = 'source',
}) => {
  if (!isOpen) return null;

  const [customPath, setCustomPath] = useState(defaultPath);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sourcePresets = [
    { name: 'Belgelerim (Documents)', path: 'C:\\Users\\Kullanici\\Documents', icon: 'folder' },
    { name: 'Masaüstü (Desktop)', path: 'C:\\Users\\Kullanici\\Desktop', icon: 'folder' },
    { name: 'Mali Tablolar & Muhasebe', path: 'C:\\Sirket_Verileri\\Muhasebe_2026', icon: 'folder' },
    { name: 'Yazılım Projeleri (Repo)', path: 'C:\\Projeler\\Kaynak_Kodlar', icon: 'folder' },
    { name: 'Müşteri Sözleşmeleri & Faturalar', path: 'C:\\Ticari_Arsiv\\Sozlesmeler', icon: 'folder' },
    { name: 'D: İkinci Sürücü Belgeleri', path: 'D:\\Is_Dokumanlari', icon: 'drive' },
  ];

  const targetPresets = [
    { name: 'D: Kurumsal Yedekleme Alanı (Tavsiye Edilen)', path: 'D:\\Kurumsal_Yedekler', icon: 'drive' },
    { name: 'E: Harici SSD / USB Sürücüsü', path: 'E:\\Harici_Yedekler', icon: 'drive' },
    { name: 'C: Güvenli Yedek Klasörü', path: 'C:\\Guvenli_Yedek_Deposu', icon: 'folder' },
    { name: 'Ağ Paylaşımı (NAS Dosya Sunucusu)', path: '\\\\192.168.1.100\\Yedek_Alani', icon: 'network' },
    { name: 'F: Yedek Hard Disk Arşivi', path: 'F:\\Arsiv_Yedekler', icon: 'drive' },
  ];

  const currentPresets = mode === 'target' ? targetPresets : sourcePresets;

  const handleSelect = (path: string) => {
    onSelectPath(path);
    onClose();
  };

  // HTML5 Webkit Native Directory Picker trigger
  const handleNativeFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const relPath = file.webkitRelativePath;
      const rootFolder = relPath ? relPath.split('/')[0] : file.name;
      const simulatedPath = `C:\\Users\\Kullanici\\${rootFolder}`;
      handleSelect(simulatedPath);
    }
  };

  // Modern browser showDirectoryPicker API
  const handleOpenNativeDirectoryPicker = async () => {
    // If running in browser with File System Access API
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          handleSelect(`C:\\Users\\Kullanici\\${dirHandle.name}`);
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    // Fallback to hidden directory file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {title}
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
          {/* Native Explorer picker button */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Windows Dosya Gezginini Aç</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Bilgisayarınızdaki klasörü doğrudan dosya yöneticisinden seçin.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              // @ts-expect-error webkitdirectory is standard in Chromium browsers
              webkitdirectory=""
              directory=""
              className="hidden"
              onChange={handleNativeFolderSelect}
            />

            <button
              type="button"
              onClick={handleOpenNativeDirectoryPicker}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Gözat...</span>
            </button>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {mode === 'target' ? 'Önerilen Hedef Dizinler' : 'Hazır Klasörler (Tek Tıkla Seçin)'}
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {currentPresets.map(preset => (
                <button
                  key={preset.path}
                  type="button"
                  onClick={() => handleSelect(preset.path)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 text-left transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    {preset.icon === 'drive' ? (
                      <HardDrive className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                    ) : preset.icon === 'network' ? (
                      <Server className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {preset.name}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {preset.path}
                      </div>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="font-semibold text-slate-800 dark:text-slate-200">
              Veya Özel Windows Yolunu Belirtin:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={mode === 'target' ? 'Örn: D:\\Yedekler' : 'Örn: C:\\Belgelerim'}
                value={customPath}
                onChange={e => setCustomPath(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                disabled={!customPath.trim()}
                onClick={() => handleSelect(customPath.trim())}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium flex items-center gap-1 shrink-0"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Seç</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
