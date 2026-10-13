import React from 'react';
import {
  Play,
  Square,
  Clock,
  Files,
  FileCheck2,
  AlertTriangle,
  HardDrive,
  FolderTree,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Activity,
  FolderSync,
} from 'lucide-react';
import { AppSettings, BackupLog, BackupProgress, DashboardStats, SourceFolder } from '../types';

interface OverviewTabProps {
  stats: DashboardStats;
  settings: AppSettings;
  sources: SourceFolder[];
  logs: BackupLog[];
  isScanning: boolean;
  currentProgress: BackupProgress | null;
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

  const minutesRemaining = Math.max(0, Math.floor(stats.next_scan_in_seconds / 60));
  const secondsRemaining = Math.max(0, stats.next_scan_in_seconds % 60);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HERO SECTION: Big Centered Protection Control */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-10 text-center">
        {/* Subtle decorative background glow */}
        <div
          className={`absolute inset-0 pointer-events-none opacity-20 dark:opacity-15 blur-3xl transition-colors duration-700 ${
            stats.is_running
              ? 'bg-gradient-to-b from-emerald-400 via-teal-500 to-transparent'
              : 'bg-gradient-to-b from-amber-400 via-slate-400 to-transparent'
          }`}
        />

        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border transition-colors bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                stats.is_running
                  ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20'
                  : 'bg-amber-500 ring-2 ring-amber-500/20'
              }`}
            />
            <span
              className={
                stats.is_running
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-amber-700 dark:text-amber-300'
              }
            >
              {stats.is_running ? 'Otomatik Koruma Aktif' : 'Koruma Duraklatıldı'}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {stats.is_running ? 'Sisteminiz Kesintisiz Korunuyor' : 'Otomatik Koruma Devre Dışı'}
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg">
            {stats.is_running
              ? `Belirlenen ${settings.scan_interval_minutes} dakikalık periyotlarla arka planda kaynaklar taranır ve değişen dosyalar anında yedeklenir.`
              : 'Periyodik dosya taraması şu an kapalı. Korumayı başlatarak arka plan senkronizasyonunu devreye alabilirsiniz.'}
          </p>

          {/* BIG CENTERED ACTION BUTTON */}
          <div className="mt-6 sm:mt-8 w-full flex flex-col items-center gap-3">
            {stats.is_running ? (
              <button
                type="button"
                onClick={() => onToggleAuto(false)}
                className="w-full sm:w-auto min-w-[280px] sm:min-w-[320px] px-8 py-4 rounded-xl text-sm sm:text-base font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                  <Square className="w-4 h-4 fill-white" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">Korumayı Durdur</div>
                  <div className="text-[11px] font-normal text-rose-100 opacity-90">
                    Otomatik taramaları beklemeye al
                  </div>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleAuto(true)}
                className="w-full sm:w-auto min-w-[280px] sm:min-w-[320px] px-8 py-4 rounded-xl text-sm sm:text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer ring-4 ring-emerald-500/20 group animate-pulse-subtle"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                </div>
                <div className="text-left">
                  <div className="leading-tight text-base font-bold">Korumayı Başlat</div>
                  <div className="text-[11px] font-normal text-emerald-100 opacity-90">
                    {settings.scan_interval_minutes} dakikalık otomatik taramayı başlat
                  </div>
                </div>
              </button>
            )}

            {/* Cancel scan button if scan in progress */}
            {isScanning && (
              <button
                type="button"
                onClick={onCancelBackup}
                className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Devam Eden Taramayı İptal Et</span>
              </button>
            )}
          </div>

          {/* Quick Info Strip Below Button */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">Sonraki Tarama</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {stats.is_running
                  ? `${minutesRemaining} dk ${secondsRemaining} sn`
                  : 'Durduruldu'}
              </span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">Aktif Kaynaklar</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {enabledSourcesCount} / {sources.length} Klasör
              </span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">Hedef Depolama</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate max-w-[140px]">
                {stats.target_disk_free_gb.toFixed(1)} GB Boş Alan
              </span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">Hedef Analizi</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Akıllı Eşitleme</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Scanning Progress Bar */}
      {isScanning && (
        <div className="p-4 sm:p-5 rounded-xl border border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>Dosyalar taranıyor ve atomik yedekleniyor...</span>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              %{currentProgress ? Math.round(currentProgress.percent) : 35}
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${currentProgress ? currentProgress.percent : 35}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="font-mono truncate max-w-md">
              İşlenen: {currentProgress?.current || 'Değişiklik tespiti yürütülüyor...'}
            </span>
            <span className="font-mono font-medium">
              {currentProgress
                ? `${currentProgress.processed} / ${currentProgress.total} dosya`
                : 'Analiz ediliyor...'}
            </span>
          </div>
        </div>
      )}

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Son Tarama */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
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
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
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
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
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
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
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
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Yedekleme Hedefi & Disk Durumu</span>
              </div>
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
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
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
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

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Sürüm Koruması: {settings.max_versions_per_file} Sürüm</span>
            </span>
            <span>SHA-256: {settings.verify_checksum ? 'Açık' : 'Kapalı'}</span>
          </div>
        </div>

        {/* Right: Sources Quick Overview */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <FolderTree className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Kayıtlı Kaynak Klasörler</span>
              </div>
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
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
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">
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
            type="button"
            onClick={onNavigateToSettings}
            className="w-full mt-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer border border-dashed border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-300 dark:hover:border-slate-700"
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span>Tüm klasör ayarlarını düzenle ({sources.length} Klasör)</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Son İşlemler ve Sistem Günlüğü
            </h2>
            <span className="text-xs text-slate-400">· Gerçek zamanlı</span>
          </div>
          <button
            type="button"
            onClick={onNavigateToLogs}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
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
