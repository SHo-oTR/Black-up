import {
  AppSettings,
  BackupLog,
  BackupProgress,
  DashboardStats,
  FileVersion,
  RestoreRequest,
  RestoreResult,
  SourceFolder,
} from '../types';
import { mockStorage } from './mockStorage';

// Check if app is running inside Tauri 2 native desktop webview
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export const tauriBridge = {
  isTauri: isTauriEnvironment(),

  async getDashboardStats(): Promise<DashboardStats> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<DashboardStats>('get_dashboard_stats');
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    return mockStorage.getDashboardStats();
  },

  async getSettings(): Promise<AppSettings> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<AppSettings>('get_settings');
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    return mockStorage.getSettings();
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('save_settings', { settings });
        return;
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    mockStorage.saveSettings(settings);
  },

  async getSourceFolders(): Promise<SourceFolder[]> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<SourceFolder[]>('get_source_folders');
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    return mockStorage.getSourceFolders();
  },

  async addSourceFolder(path: string): Promise<number> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<number>('add_source_folder', { path });
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    return mockStorage.addSourceFolder(path);
  },

  async removeSourceFolder(id: number): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('remove_source_folder', { id });
        return;
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    mockStorage.removeSourceFolder(id);
  },

  async clearSourceFolders(): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('clear_source_folders');
        return;
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    mockStorage.clearSourceFolders();
  },

  async startBackupManual(onProgress?: (progress: BackupProgress) => void): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const { listen } = await import('@tauri-apps/api/event');

        if (onProgress) {
          const unlisten = await listen<BackupProgress>('backup-progress', event => {
            onProgress(event.payload);
          });
          // Also listen for completion
          const unlistenFinish = await listen('backup-finished', () => {
            unlisten();
            unlistenFinish();
          });
        }

        await invoke('start_backup_manual');
        return;
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }

    await mockStorage.runBackupSimulation(onProgress);
  },

  async cancelBackup(): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('cancel_backup');
        return;
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    mockStorage.cancelBackup();
  },

  async toggleAutoBackup(active: boolean): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('toggle_auto_backup', { active });
        return;
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    const s = mockStorage.getSettings();
    s.auto_start_active = active;
    mockStorage.saveSettings(s);
  },

  async getLogs(limit = 100): Promise<BackupLog[]> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<BackupLog[]>('get_logs', { limit });
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    return mockStorage.getLogs();
  },

  async clearLogs(): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('clear_logs');
        return;
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    mockStorage.clearLogs();
  },

  async getFileVersions(): Promise<FileVersion[]> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<FileVersion[]>('get_file_versions');
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    return mockStorage.getFileVersions();
  },

  async deleteFileVersion(id: number): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('delete_file_version', { id });
        return;
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    mockStorage.deleteVersion(id);
  },

  async clearAllFileVersions(): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('clear_all_file_versions');
        return;
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    mockStorage.clearAllVersions();
  },

  async cleanOldVersions(keepLast = 1): Promise<number> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<number>('clean_old_versions', { keepLast });
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    return mockStorage.cleanOldVersions(keepLast);
  },

  async restoreFileVersion(req: RestoreRequest): Promise<RestoreResult> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<RestoreResult>('restore_file_version', { req });
      } catch (err) {
        console.warn('Tauri invoke error, falling back to mock storage:', err);
      }
    }
    return mockStorage.restoreVersion(req);
  },

  async openDirectoryDialog(): Promise<string | null> {
    if (isTauriEnvironment()) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const selected = await open({
          directory: true,
          multiple: false,
          title: 'Yedeklenecek Kaynak Klasörü Seçin',
        });
        if (typeof selected === 'string') return selected;
        return null;
      } catch (e) {
        console.warn('Tauri dialog error:', e);
      }
    }
    return null;
  },
};
