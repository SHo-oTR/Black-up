export interface SourceFolder {
  id: number;
  path: string;
  enabled: boolean;
  created_at: string;
  is_accessible: boolean;
}

export interface AppSettings {
  target_directory: string;
  scan_interval_minutes: number;
  auto_start_active: boolean;
  verify_checksum: boolean;
  max_versions_per_file: number;
  theme: 'dark' | 'light';
  run_on_windows_startup: boolean;
  minimize_to_tray: boolean;
}

export interface FileRecord {
  id: number;
  source_id: number;
  file_path: string;
  relative_path: string;
  file_size: number;
  modified_time: string;
  last_backup_time: string | null;
  status: 'backed_up' | 'pending' | 'error' | 'source_deleted';
  sha256_hash?: string | null;
}

export interface FileVersion {
  id: number;
  file_record_id: number;
  file_name: string;
  source_path: string;
  relative_path: string;
  version_number: number;
  backup_file_path: string;
  file_size: number;
  modified_time: string;
  backup_time: string;
  sha256_hash?: string | null;
}

export interface BackupLog {
  id: number;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  source_path?: string | null;
  message: string;
}

export interface DashboardStats {
  last_scan_time: string | null;
  next_scan_in_seconds: number;
  total_backed_up_files: number;
  total_backed_up_bytes: number;
  pending_changes: number;
  error_count: number;
  is_running: boolean;
  is_scanning: boolean;
  active_file_path: string | null;
  progress_percent: number;
  target_disk_free_gb: number;
  target_disk_total_gb: number;
  target_accessible: boolean;
}

export interface BackupProgress {
  total: number;
  processed: number;
  copied: number;
  skipped: number;
  errors: number;
  current: string;
  percent: number;
}

export interface RestoreRequest {
  version_id: number;
  destination_path: string;
  overwrite: boolean;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  restored_path: string;
}
