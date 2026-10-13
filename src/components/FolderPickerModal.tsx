import React, { useState } from 'react';
import { Folder, X, FolderPlus, Check } from 'lucide-react';

interface FolderPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPath: (path: string) => void;
}

export const FolderPickerModal: React.FC<FolderPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectPath,
}) => {
  if (!isOpen) return null;

  const [customPath, setCustomPath] = useState('');

  const quickFolders = [
    { name: 'Belgelerim (Documents)', path: 'C:\\Users\\Admin\\Documents' },
    { name: 'Masaüstü (Desktop)', path: 'C:\\Users\\Admin\\Desktop' },
    { name: 'Mali İşler & Faturalar', path: 'C:\\Sirket_Verileri\\Muhasebe_2026' },
    { name: 'Yazılım Projeleri (Repo)', path: 'C:\\Gelistirme\\Kaynak_Kodlar' },
    { name: 'Müşteri Sözleşmeleri & Arşiv', path: 'D:\\Musteri_Portfoyu' },
    { name: 'Ağ Paylaşımı (NAS)', path: '\\\\192.168.1.100\\Yedek_Alani' },
  ];

  const handleSelect = (path: string) => {
    onSelectPath(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Klasör Seçimi (Windows Dosya Yolu)
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
          <p className="text-slate-500 dark:text-slate-400">
            Aşağıdaki sık kullanılan iş klasörlerinden birini seçebilir veya özel bir tam yol girebilirsiniz:
          </p>

          <div className="space-y-1.5">
            {quickFolders.map(folder => (
              <button
                key={folder.path}
                type="button"
                onClick={() => handleSelect(folder.path)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {folder.name}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                    {folder.path}
                  </div>
                </div>
                <Check className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="font-semibold text-slate-800 dark:text-slate-200">
              Özel Windows Dizin Yolu:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Örn: E:\Ozel_Klasor"
                value={customPath}
                onChange={e => setCustomPath(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                disabled={!customPath.trim()}
                onClick={() => handleSelect(customPath.trim())}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium flex items-center gap-1 shrink-0"
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
