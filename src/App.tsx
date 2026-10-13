import { useEffect, useState, useCallback, useRef } from 'react';
import { TopNav } from './components/TopNav';
import { TabType } from './components/Sidebar';
import { OverviewTab } from './components/OverviewTab';
import { SettingsTab } from './components/SettingsTab';
import { VersionsTab } from './components/VersionsTab';
import { LogsTab } from './components/LogsTab';
import { TestSuiteTab } from './components/TestSuiteTab';
import { RestoreModal } from './components/RestoreModal';
import { FolderPickerModal } from './components/FolderPickerModal';
import { SystemTrayModal } from './components/SystemTrayModal';
import { BuildExeModal } from './components/BuildExeModal';
import { tauriBridge } from './services/tauriBridge';
import {
  AppSettings,
  BackupLog,
  BackupProgress,
  DashboardStats,
  FileVersion,
  RestoreRequest,
  SourceFolder,
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // State
  const [stats, setStats] = useState<DashboardStats>({
    last_scan_time: '2026-03-13 10:00:12',
    next_scan_in_seconds: 300,
    total_backed_up_files: 5,
    total_backed_up_bytes: 19829020,
    pending_changes: 0,
    error_count: 0,
    is_running: true,
    is_scanning: false,
    active_file_path: null,
    progress_percent: 0,
    target_disk_free_gb: 348.6,
    target_disk_total_gb: 1024.0,
    target_accessible: true,
  });

  const [settings, setSettings] = useState<AppSettings>({
    target_directory: 'D:\\Kurumsal_Yedekler',
    scan_interval_minutes: 5,
    auto_start_active: true,
    verify_checksum: true,
    max_versions_per_file: 10,
    theme: 'dark',
    run_on_windows_startup: true,
    minimize_to_tray: true,
  });

  const [sources, setSources] = useState<SourceFolder[]>([]);
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [versions, setVersions] = useState<FileVersion[]>([]);

  // Scanning progress
  const [isScanning, setIsScanning] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<BackupProgress | null>(null);

  // Modals
  const [restoreModalVersion, setRestoreModalVersion] = useState<FileVersion | null>(null);
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const [folderPickerMode, setFolderPickerMode] = useState<'source' | 'target'>('source');
  const [isTrayModalOpen, setIsTrayModalOpen] = useState(false);
  const [isBuildExeModalOpen, setIsBuildExeModalOpen] = useState(false);

  // Ref to track scanning without stale closures
  const isScanningRef = useRef(false);
  isScanningRef.current = isScanning;

  // Load all data
  const refreshData = useCallback(async () => {
    try {
      const [sData, srcData, logData, verData, statData] = await Promise.all([
        tauriBridge.getSettings(),
        tauriBridge.getSourceFolders(),
        tauriBridge.getLogs(150),
        tauriBridge.getFileVersions(),
        tauriBridge.getDashboardStats(),
      ]);

      setSettings(sData);
      setSources(srcData);
      setLogs(logData);
      setVersions(verData);
      setStats(prev => ({
        ...statData,
        // preserve local countdown if running
        next_scan_in_seconds: prev.next_scan_in_seconds > 0 ? prev.next_scan_in_seconds : (sData.auto_start_active ? sData.scan_interval_minutes * 60 : 0),
        is_running: sData.auto_start_active,
      }));
      setTheme(sData.theme);

      if (sData.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Veri yuklenirken hata:', e);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Actions
  const handleStartManualBackup = useCallback(async () => {
    if (isScanningRef.current) return;
    setIsScanning(true);
    setCurrentProgress(null);

    try {
      await tauriBridge.startBackupManual(prog => {
        setCurrentProgress(prog);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
      refreshData();
    }
  }, [refreshData]);

  // Periodic stats ticker & countdown with automatic scan execution
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => {
        if (!prev.is_running) {
          return { ...prev, next_scan_in_seconds: 0 };
        }

        if (prev.next_scan_in_seconds <= 1) {
          // Timer expired: trigger scheduled scan if not currently scanning!
          if (!isScanningRef.current) {
            handleStartManualBackup();
          }
          return {
            ...prev,
            next_scan_in_seconds: settings.scan_interval_minutes * 60,
          };
        }

        return {
          ...prev,
          next_scan_in_seconds: prev.next_scan_in_seconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.scan_interval_minutes, handleStartManualBackup]);

  // Theme toggle
  const handleToggleTheme = () => {
    const nextTheme: 'dark' | 'light' = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const updated: AppSettings = { ...settings, theme: nextTheme };
    setSettings(updated);
    tauriBridge.saveSettings(updated);
  };

  const handleCancelBackup = async () => {
    await tauriBridge.cancelBackup();
    setIsScanning(false);
    refreshData();
  };

  const handleToggleAuto = async (active: boolean) => {
    await tauriBridge.toggleAutoBackup(active);
    setStats(prev => ({
      ...prev,
      is_running: active,
      next_scan_in_seconds: active ? settings.scan_interval_minutes * 60 : 0,
    }));
    setSettings(prev => ({ ...prev, auto_start_active: active }));

    if (active && !isScanningRef.current) {
      // Immediately run an initial scan when user activates protection
      handleStartManualBackup();
    } else {
      refreshData();
    }
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    await tauriBridge.saveSettings(newSettings);
    setSettings(newSettings);
    setStats(prev => ({
      ...prev,
      next_scan_in_seconds: newSettings.auto_start_active ? newSettings.scan_interval_minutes * 60 : 0,
      is_running: newSettings.auto_start_active,
    }));
    refreshData();
  };

  const handleAddFolder = async (path: string) => {
    await tauriBridge.addSourceFolder(path);
    refreshData();
  };

  const handleRemoveFolder = async (id: number) => {
    await tauriBridge.removeSourceFolder(id);
    refreshData();
  };

  const handleClearFolders = async () => {
    await tauriBridge.clearSourceFolders();
    refreshData();
  };

  const handleClearLogs = async () => {
    await tauriBridge.clearLogs();
    refreshData();
  };

  const handleConfirmRestore = async (req: RestoreRequest) => {
    await tauriBridge.restoreFileVersion(req);
    refreshData();
  };

  const handleSelectFolderFromPicker = async (path: string) => {
    if (folderPickerMode === 'source') {
      await handleAddFolder(path);
    } else {
      const updated = { ...settings, target_directory: path };
      await handleSaveSettings(updated);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sleek Compact Top Navigation (NO <header>, NO <aside>) */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isRunning={stats.is_running}
        isScanning={isScanning}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        totalBackedUp={versions.length}
        errorCount={stats.error_count}
        onMinimizeToTray={() => setIsTrayModalOpen(true)}
        onOpenTrayPreview={() => setIsTrayModalOpen(true)}
        onOpenBuildExe={() => setIsBuildExeModalOpen(true)}
      />

      {/* Main Content Area - Full Width & Clean */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {currentTab === 'overview' && (
          <OverviewTab
            stats={stats}
            settings={settings}
            sources={sources}
            logs={logs}
            isScanning={isScanning}
            currentProgress={currentProgress}
            onCancelBackup={handleCancelBackup}
            onToggleAuto={handleToggleAuto}
            onNavigateToSettings={() => setCurrentTab('settings')}
            onNavigateToLogs={() => setCurrentTab('logs')}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsTab
            settings={settings}
            sources={sources}
            onSaveSettings={handleSaveSettings}
            onAddFolder={handleAddFolder}
            onRemoveFolder={handleRemoveFolder}
            onClearFolders={handleClearFolders}
            onOpenFolderPicker={() => {
              setFolderPickerMode('source');
              setIsFolderPickerOpen(true);
            }}
            onOpenTargetPicker={() => {
              setFolderPickerMode('target');
              setIsFolderPickerOpen(true);
            }}
            onStartManualBackup={handleStartManualBackup}
            isScanning={isScanning}
            onCancelBackup={handleCancelBackup}
          />
        )}

        {currentTab === 'versions' && (
          <VersionsTab
            versions={versions}
            onOpenRestoreModal={setRestoreModalVersion}
          />
        )}

        {currentTab === 'logs' && (
          <LogsTab logs={logs} onClearLogs={handleClearLogs} />
        )}

        {currentTab === 'tests' && <TestSuiteTab />}
      </main>

      {/* Modals */}
      <RestoreModal
        version={restoreModalVersion}
        onClose={() => setRestoreModalVersion(null)}
        onConfirmRestore={handleConfirmRestore}
      />

      <FolderPickerModal
        isOpen={isFolderPickerOpen}
        onClose={() => setIsFolderPickerOpen(false)}
        onSelectPath={handleSelectFolderFromPicker}
        title={folderPickerMode === 'source' ? 'Kaynak Klasör Seç (Gözat)' : 'Yedekleme Hedef Klasörünü Seç (Gözat)'}
        defaultPath={folderPickerMode === 'source' ? '' : settings.target_directory}
        mode={folderPickerMode}
      />

      <SystemTrayModal
        isOpen={isTrayModalOpen}
        onClose={() => setIsTrayModalOpen(false)}
        isRunning={stats.is_running}
        onToggleAuto={handleToggleAuto}
        onStartManual={handleStartManualBackup}
      />

      <BuildExeModal
        isOpen={isBuildExeModalOpen}
        onClose={() => setIsBuildExeModalOpen(false)}
      />
    </div>
  );
}
