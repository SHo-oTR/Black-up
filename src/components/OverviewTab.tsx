import React from 'react';
import {
  Play,
  Square,
  RefreshCw,
  Clock,
  Files,
  FileCheck2,
  AlertTriangle,
  HardDrive,
  FolderTree,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, BackupLog, BackupProgress, DashboardStats, SourceFolder } from '../types';

interface OverviewTabProps {
  stats: DashboardStats;
  settings: AppSettings;
  sources: SourceFolder[];
  logs: BackupLog[];
  isScanning: boolean;
  currentProgress: BackupProgress | null;
  onStartManualBackup: () => void;
  onCancelBackup: () => void;
  onToggleAuto: (active: boolean) => void;
  onNavigateToSettings: () => void;
  onNavigateToLogs: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  settings,
  sources,
  logs,
  isScanning,
  currentProgress,
  onStartManualBackup,
  onCancelBackup,
  onToggleAuto,
  onNavigateToSettings,
  onNavigateToLogs,
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const enabledSourcesCount = sources.filter(s => s.enabled).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner: Status & Action Bar */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Windows Otomatik Koruma</span>
            <span aria-hidden="true">·</span>
            <span>Tarama Aralığı: {settings.scan_interval_minutes} Dakika</span>
            <span aria-hidden="true">·</span>
            <span>{enabledSourcesCount} Aktif Kaynak</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Sistem Koruması:</span>
            <span
              className={
                stats.is_running
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }
            >
              {stats.is_running ? 'Aktif (Arka Planda Dinliyor)' : 'Durduruldu'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {stats.is_running
              ? `Bir sonraki otomatik tarama ${Math.max(1, Math.floor(stats.next_scan_in_seconds / 60))} dakika sonra gerçekleştirilecek.`
              : 'Otomatik periyodik tarama devre dışı. Aşağıdaki butondan başlatabilirsiniz.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {stats.is_running ? (
            <button
              onClick={() => onToggleAuto(false)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Korumayı Durdur</span>
            </button>
          ) : (
            <button
              onClick={() => onToggleAuto(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Korumayı Başlat</span>
            </button>
          )}

          {isScanning ? (
            <button
              onClick={onCancelBackup}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>İşlemi İptal Et</span>
            </button>
          ) : (
            <button
              onClick={onStartManualBackup}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Şimdi Yedekle</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Progress Bar (visible during scanning) */}
      {isScanning && (
        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>Dosyalar taranıyor ve atomik kopyalanıyor...</span>
            </div>
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              %{currentProgress ? Math.round(currentProgress.percent) : 45}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${currentProgress ? currentProgress.percent : 45}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-mono truncate max-w-md">
              İşlenen: {currentProgress?.current || 'Değişiklik tespiti yürütülüyor...'}
            </span>
            <span className="font-mono">
              {currentProgress
                ? `${currentProgress.processed} / ${currentProgress.total} dosya`
                : 'Analiz ediliyor...'}
            </span>
          </div>
        </div>
      )}

      {/* 4 Status Metric Cards (Clean Typography - Zero-Pill) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Son Tarama */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Son Tarama Zamanı</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {stats.last_scan_time ? stats.last_scan_time.split(' ')[1] : 'Henüz yapılmadı'}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {stats.last_scan_time ? stats.last_scan_time.split(' ')[0] : 'Sistem hazır'}
          </div>
        </div>

        {/* Card 2: Yedeklenen Dosya Sayısı */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Korumalı Dosyalar</span>
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {stats.total_backed_up_files} dosya
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Toplam: {formatBytes(stats.total_backed_up_bytes)}
          </div>
        </div>

        {/* Card 3: Bekleyen Değişiklikler */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Bekleyen Değişiklik</span>
            <Files className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {stats.pending_changes} dosya
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Sonraki taramada aktarılacak
          </div>
        </div>

        {/* Card 4: Hata Sayısı */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Tespit Edilen Hata</span>
            <AlertTriangle className={`w-4 h-4 ${stats.error_count > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div
            className={`text-lg font-bold tracking-tight font-mono ${
              stats.error_count > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {stats.error_count}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {stats.error_count === 0 ? 'Tüm operasyonlar sağlıklı' : 'Günlükleri inceleyin'}
          </div>
        </div>
      </div>

      {/* Target Disk and Source Folders Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Backup Target & Disk Health */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Yedekleme Hedefi & Disk Durumu</span>
              </div>
              <button
                onClick={onNavigateToSettings}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Hedefi Değiştir
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 font-mono text-xs text-slate-800 dark:text-slate-200 mb-3 truncate">
              {settings.target_directory}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Hedef Disk Boş Alanı</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {stats.target_disk_free_gb.toFixed(1)} GB boş / {stats.target_disk_total_gb.toFixed(0)} GB
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        5,
                        ((stats.target_disk_total_gb - stats.target_disk_free_gb) / stats.target_disk_total_gb) * 100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-3">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Sürüm Koruması: {settings.max_versions_per_file} Sürüm</span>
            </span>
            <span>SHA-256: {settings.verify_checksum ? 'Açık' : 'Kapalı'}</span>
          </div>
        </div>

        {/* Right: Sources Quick Overview */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <FolderTree className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Kayıtlı Kaynak Klasörler</span>
              </div>
              <button
                onClick={onNavigateToSettings}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Klasör Yönetimi ({sources.length})
              </button>
            </div>

            <div className="space-y-2">
              {sources.slice(0, 3).map(src => (
                <div
                  key={src.id}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        src.enabled ? 'text-emerald-500' : 'text-slate-400'
                      }`}
                    />
                    <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                      {src.path}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {src.enabled ? 'Aktif' : 'Devre dışı'}
                  </span>
                </div>
              ))}
              {sources.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  Henüz kaynak klasör eklenmemiş. Lütfen ayarlar sekmesinden ekleyin.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onNavigateToSettings}
            className="w-full mt-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1 font-medium transition-colors"
          >
            <span>Tüm klasör ayarlarını düzenle</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Son İşlemler ve Sistem Günlüğü
            </h2>
            <span className="text-xs text-slate-400">· Gerçek zamanlı</span>
          </div>
          <button
            onClick={onNavigateToLogs}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Tüm Günlükleri Gör
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-4 font-medium">Zaman</th>
                <th className="py-2.5 px-3 font-medium">Seviye</th>
                <th className="py-2.5 px-3 font-medium">Dosya / Kaynak</th>
                <th className="py-2.5 px-4 font-medium">Açıklama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {logs.slice(0, 5).map(log => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        log.level === 'SUCCESS'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : log.level === 'ERROR'
                          ? 'text-rose-600 dark:text-rose-400'
                          : log.level === 'WARN'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-w-xs truncate">
                    {log.source_path || 'Sistem Motoru'}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                    {log.message}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Kayıtlı işlem günlüğü bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
