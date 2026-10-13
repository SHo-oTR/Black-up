import React, { useState } from 'react';
import { RotateCcw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { FileVersion, RestoreRequest } from '../types';
import confetti from 'canvas-confetti';

interface RestoreModalProps {
  version: FileVersion | null;
  onClose: () => void;
  onConfirmRestore: (req: RestoreRequest) => Promise<void>;
}

export const RestoreModal: React.FC<RestoreModalProps> = ({
  version,
  onClose,
  onConfirmRestore,
}) => {
  if (!version) return null;

  const [destinationPath, setDestinationPath] = useState(version.source_path);
  const [overwrite, setOverwrite] = useState(false);
  const [useOriginalPath, setUseOriginalPath] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRestoring(true);
    setErrorMessage(null);
    setResultMessage(null);

    const target = useOriginalPath ? version.source_path : destinationPath;

    try {
      await onConfirmRestore({
        version_id: version.id,
        destination_path: target,
        overwrite,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      setResultMessage(`Sürüm #${version.version_number} başarıyla geri yüklendi!`);
      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(String(err));
      }
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Dosya Sürümünü Geri Yükle
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleRestore} className="p-5 space-y-4 text-xs">
          {/* File details card */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Dosya Adı:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {version.file_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kurtarılacak Sürüm:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                Sürüm #{version.version_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Yedekleme Zamanı:</span>
              <span className="text-slate-700 dark:text-slate-300">{version.backup_time}</span>
            </div>
          </div>

          {/* Target choice */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 dark:text-slate-200">
              Geri Yükleme Konumu:
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="restoreLoc"
                  checked={useOriginalPath}
                  onChange={() => setUseOriginalPath(true)}
                  className="text-indigo-600"
                />
                <span>Orijinal Konuma Geri Yükle</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="restoreLoc"
                  checked={!useOriginalPath}
                  onChange={() => setUseOriginalPath(false)}
                  className="text-indigo-600"
                />
                <span>Farklı Bir Konuma Aktar</span>
              </label>
            </div>

            {!useOriginalPath && (
              <input
                type="text"
                value={destinationPath}
                onChange={e => setDestinationPath(e.target.value)}
                placeholder="Örn: C:\Kurtarilanlar\Belge.xlsx"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            )}
          </div>

          {/* Security Overwrite checkbox */}
          <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                Hedef konumda aynı isimli dosya bulunuyorsa üzerine yazılması için onay gereklidir.
              </span>
            </div>

            <label className="flex items-center gap-2 font-medium cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={overwrite}
                onChange={e => setOverwrite(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Mevcut dosya varsa üzerine yazılmasına izin veriyorum</span>
            </label>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
              {errorMessage}
            </div>
          )}

          {resultMessage && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{resultMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isRestoring}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isRestoring ? 'Geri Yükleniyor...' : 'Geri Yüklemeyi Başlat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
