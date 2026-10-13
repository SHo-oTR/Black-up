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
  Folder,
  RefreshCw,
  Square,
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
  onOpenTargetPicker: () => void;
  onStartManualBackup?: () => void;
  isScanning?: boolean;
  onCancelBackup?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  sources,
  onSaveSettings,
  onAddFolder,
  onRemoveFolder,
  onClearFolders,
  onOpenFolderPicker,
  onOpenTargetPicker,
  onStartManualBackup,
  isScanning = false,
  onCancelBackup,
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

  const quickSourceSuggestions = [
    { label: 'Belgelerim', path: 'C:\\Users\\Kullanici\\Documents' },
    { label: 'Masaüstü', path: 'C:\\Users\\Kullanici\\Desktop' },
    { label: 'Muhasebe & Mali İşler', path: 'C:\\Sirket_Verileri\\Muhasebe_2026' },
    { label: 'Yazılım Projeleri', path: 'C:\\Projeler\\Kaynak_Kodlar' },
  ];

  const quickTargetSuggestions = [
    { label: 'D: Kurumsal Yedekler (Önerilen)', path: 'D:\\Kurumsal_Yedekler' },
    { label: 'E: Harici USB / SSD Disk', path: 'E:\\Harici_Yedekler' },
    { label: 'Ağ Paylaşımı (NAS Sunucu)', path: '\\\\192.168.1.100\\Yedek_Alani' },
    { label: 'C: Güvenli Depo', path: 'C:\\Guvenli_Yedek_Deposu' },
  ];

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

  const handleAddCustomPath = async (pathToAdd?: string) => {
    setPathError(null);
    const targetPath = pathToAdd || newPathInput.trim();
    if (!targetPath) return;

    try {
      await onAddFolder(targetPath);
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

      {/* Manual Backup Action Card (Requested by user) */}
      <div className="p-4 sm:p-5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 ${isScanning ? 'animate-spin' : ''}`} />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Manuel Yedekleme Başlat
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium">
              Anında Senkronizasyon
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Periyodik süreyi beklemeden tüm aktif kaynak klasörlerdeki yeni ve değişen dosyaları anında tespit edip hedef alana yedekler.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isScanning ? (
            <button
              type="button"
              onClick={onCancelBackup}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>İşlemi İptal Et</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartManualBackup}
              className="px-5 py-2.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Şimdi Yedekle</span>
            </button>
          )}
        </div>
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

          {/* Quick Add Bar with Browse Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Örn: C:\Users\Kullanici\Documents veya ağ yolu \\Sunucu\Paylasim"
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
              onClick={onOpenFolderPicker}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5 shrink-0"
              title="Bilgisayarınızdaki klasörleri görsel olarak seçin"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Gözat...</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddCustomPath()}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Listeye Ekle</span>
            </button>
          </div>

          {/* Quick Suggestion Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-slate-400 mr-1">Hızlı Ekle:</span>
            {quickSourceSuggestions.map(item => (
              <button
                key={item.path}
                type="button"
                onClick={() => handleAddCustomPath(item.path)}
                className="text-[11px] font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                + {item.label}
              </button>
            ))}
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
                Henüz kayıtlı kaynak klasör bulunmuyor. Yukarıdaki "Gözat..." butonu veya hızlı butonlarla klasör ekleyin.
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
            <button
              type="button"
              onClick={onOpenTargetPicker}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Gözat...</span>
            </button>
          </div>

          {/* Quick Target Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-slate-400 mr-1">Önerilen Hedefler:</span>
            {quickTargetSuggestions.map(item => (
              <button
                key={item.path}
                type="button"
                onClick={() => setFormData({ ...formData, target_directory: item.path })}
                className={`text-[11px] font-medium px-2 py-1 rounded-md border transition-colors ${
                  formData.target_directory === item.path
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 border-slate-200 dark:border-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

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
                  key={preset}
                  type="button"
                  onClick={() => {
                    setIsCustomInterval(false);
                    setFormData({ ...formData, scan_interval_minutes: preset });
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50'
                  }`}
                >
                  {preset} dk
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsCustomInterval(true)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                isCustomInterval
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50'
              }`}
            >
              Özel Süre
            </button>
          </div>

          {isCustomInterval && (
            <div className="flex items-center gap-3 pt-2">
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Özel dakika girin (1 - 1440):
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

        {/* Section 4: Advanced Engine Settings */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Gelişmiş Güvenlik ve Sürüm Politikası
            </h2>
          </div>

          <div className="space-y-3">
            {/* Max versions per file */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Dosya Başına Azami Sürüm Sayısı</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Her dosya için saklanacak maksimum eski sürüm adedi (Aşıldığında en eski sürüm silinir)
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.max_versions_per_file}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      max_versions_per_file: Math.max(1, parseInt(e.target.value) || 5),
                    })
                  }
                  className="w-20 px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-right"
                />
                <span className="text-xs text-slate-400 font-mono">adet</span>
              </div>
            </div>

            {/* SHA-256 Checksum toggle */}
            <label className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 cursor-pointer">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  SHA-256 Sağlama Doğrulaması (Checksum)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kopyalama sonrasında dosya içeriğinin doğruluğunu kriptografik hash ile garanti et
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.verify_checksum}
                onChange={e => setFormData({ ...formData, verify_checksum: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
              />
            </label>

            {/* Run on Windows Startup */}
            <label className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 cursor-pointer">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Windows Başlangıcında Otomatik Başlat
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Bilgisayar açıldığında arka planda sessizce korumayı devreye sok
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.run_on_windows_startup}
                onChange={e =>
                  setFormData({ ...formData, run_on_windows_startup: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
              />
            </label>

            {/* Minimize to Tray */}
            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Kapatıldığında Sistem Tepsisine Küçült
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Çarpı (X) tuşuna basıldığında programı kapatmak yerine arka planda çalıştırmaya devam et
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.minimize_to_tray}
                onChange={e => setFormData({ ...formData, minimize_to_tray: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
              />
            </label>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveStatus === 'success' && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ayarlar başarıyla kaydedildi!</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4" />
              <span>Kayıt sırasında bir hata oluştu!</span>
            </span>
          )}

          {onStartManualBackup && (
            <button
              type="button"
              onClick={onStartManualBackup}
              disabled={isScanning}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Yedekleniyor...' : 'Şimdi Yedekle'}</span>
            </button>
          )}

          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saveStatus === 'saving' ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
