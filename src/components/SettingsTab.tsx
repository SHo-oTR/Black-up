import React, { useState } from 'react';
import {
  FolderPlus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Save,
  Clock,
  HardDrive,
  FolderTree,
  Shield,
  Layers,
  Info,
} from 'lucide-react';
import { AppSettings, SourceFolder } from '../types';

interface SettingsTabProps {
  settings: AppSettings;
  sources: SourceFolder[];
  onSaveSettings: (settings: AppSettings) => Promise<void>;
  onAddFolder: (path: string) => Promise<void>;
  onRemoveFolder: (id: number) => Promise<void>;
  onClearFolders: () => Promise<void>;
  onOpenFolderPicker: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  sources,
  onSaveSettings,
  onAddFolder,
  onRemoveFolder,
  onClearFolders,
  onOpenFolderPicker,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [newPathInput, setNewPathInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [pathError, setPathError] = useState<string | null>(null);
  const [customMinutes, setCustomMinutes] = useState<number>(
    [1, 5, 10, 15, 30, 60].includes(settings.scan_interval_minutes)
      ? 5
      : settings.scan_interval_minutes
  );
  const [isCustomInterval, setIsCustomInterval] = useState<boolean>(
    ![1, 5, 10, 15, 30, 60].includes(settings.scan_interval_minutes)
  );

  const intervalPresets = [1, 5, 10, 15, 30, 60];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');

    const updated = {
      ...formData,
      scan_interval_minutes: isCustomInterval ? customMinutes : formData.scan_interval_minutes,
    };

    try {
      await onSaveSettings(updated);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('error');
    }
  };

  const handleAddCustomPath = async (e: React.FormEvent) => {
    e.preventDefault();
    setPathError(null);
    if (!newPathInput.trim()) return;

    try {
      await onAddFolder(newPathInput.trim());
      setNewPathInput('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPathError(err.message);
      } else {
        setPathError(String(err));
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Yedekleme ve Çalışma Ayarları
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Kaynak klasörleri yönetin, hedef konumu belirleyin ve otomatik tarama frekansını yapılandırın.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Source Folders Management */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Kaynak Klasörler ({sources.length})
              </h2>
            </div>
            {sources.length > 0 && (
              <button
                type="button"
                onClick={onClearFolders}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Listeyi Temizle</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Seçilen klasörler ve tüm alt klasörleri taranır. Kaynak dosyalar hiçbir durumda silinmez veya değiştirilmez.
          </p>

          {/* Quick Add Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Örn: C:\Kullanicilar\Ahmet\Belgeler veya ağ yolu \\Sunucu\Paylasim"
                value={newPathInput}
                onChange={e => {
                  setNewPathInput(e.target.value);
                  setPathError(null);
                }}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddCustomPath}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shrink-0"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Klasör Ekle</span>
            </button>
            <button
              type="button"
              onClick={onOpenFolderPicker}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
            >
              Gözat...
            </button>
          </div>

          {pathError && (
            <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pathError}</span>
            </div>
          )}

          {/* Folder List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {sources.map(src => (
              <div
                key={src.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 truncate mr-2">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      src.is_accessible ? 'text-emerald-500' : 'text-amber-500'
                    }`}
                  />
                  <div className="truncate">
                    <div className="font-mono text-xs text-slate-900 dark:text-slate-100 truncate">
                      {src.path}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {src.is_accessible ? 'Erişilebilir · Alt klasörler dahil' : 'Erişim kontrol ediliyor'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFolder(src.id)}
                  title="Klasörü Kaldır"
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {sources.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                Henüz kayıtlı kaynak klasör bulunmuyor. Yukarıdan klasör ekleyin.
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Backup Target Directory */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Yedekleme Hedefi
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">İzole Dizin Yapısı</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Yerel disk, harici USB/SSD sürücüsü veya yerel ağ (NAS) paylaşımı seçebilirsiniz.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={formData.target_directory}
              onChange={e => setFormData({ ...formData, target_directory: e.target.value })}
              className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Security warning prompt compliance */}
          <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <span className="font-semibold">Hedef Yapısı: </span>
              Dosyalar hedefte <code className="font-mono bg-white/50 dark:bg-black/30 px-1 py-0.5 rounded">kaynak_ID/guncel</code> ve <code className="font-mono bg-white/50 dark:bg-black/30 px-1 py-0.5 rounded">kaynak_ID/surumler</code> hiyerarşisinde güvenle saklanır. Farklı kaynaklardaki aynı isimli dosyalar asla çakışmaz.
            </div>
          </div>
        </div>

        {/* Section 3: Scan Interval Selection */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Tarama Aralığı
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Seçili: {isCustomInterval ? customMinutes : formData.scan_interval_minutes} Dakika
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {intervalPresets.map(preset => {
              const isSelected = !isCustomInterval && formData.scan_interval_minutes === preset;
              return (
                <button
                  type="button"
                  key={preset}
                  onClick={() => {
                    setIsCustomInterval(false);
                    setFormData({ ...formData, scan_interval_minutes: preset });
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {preset} Dakika
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsCustomInterval(true)}
              className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                isCustomInterval
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Özel...
            </button>
          </div>

          {isCustomInterval && (
            <div className="flex items-center gap-3 pt-2">
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Özel dakika değeri:
              </label>
              <input
                type="number"
                min={1}
                max={1440}
                value={customMinutes}
                onChange={e => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <span className="text-xs text-slate-500">dakikada bir otomatik tara</span>
            </div>
          )}
        </div>

        {/* Section 4: Versioning & Advanced Engine Options */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Sürüm Politikası ve Güvenlik Seçenekleri
            </h2>
          </div>

          <div className="space-y-4">
            {/* Version retention slider/number */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Dosya Başına Azami Sürüm Sayısı
                </div>
                <div className="text-[11px] text-slate-500">
                  Değişen dosyaların önceki sürümlerini saklar. Eskiler bu limiti aşınca otomatik elenir.
                </div>
              </div>
              <input
                type="number"
                min={1}
                max={50}
                value={formData.max_versions_per_file}
                onChange={e =>
                  setFormData({
                    ...formData,
                    max_versions_per_file: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-24 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Checksum SHA-256 Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>SHA-256 İçerik Doğrulaması</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Boyut ve mtime dışında şüpheli durumlarda dosya hash kontrolü uygula.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.verify_checksum}
                onChange={e => setFormData({ ...formData, verify_checksum: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            {/* Windows Startup Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Windows Açılışında Başlat
                </div>
                <div className="text-[11px] text-slate-500">
                  Kullanıcı Windows oturumu açtığında uygulama arka planda başlasın.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.run_on_windows_startup}
                onChange={e =>
                  setFormData({ ...formData, run_on_windows_startup: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            {/* Minimize to tray toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Kapatıldığında Sistem Tepsisine Küçült
                </div>
                <div className="text-[11px] text-slate-500">
                  Pencere kapatıldığında arka planda çalışmaya devam eder (Tauri 2 Tray).
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.minimize_to_tray}
                onChange={e => setFormData({ ...formData, minimize_to_tray: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {saveStatus === 'success' && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ayarlar SQLite veritabanına başarıyla kaydedildi!</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Kayıt sırasında bir hata oluştu.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Ayarları Kaydet</span>
          </button>
        </div>
      </form>
    </div>
  );
};
