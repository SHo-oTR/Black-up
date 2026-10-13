use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SourceFolder {
    pub id: i64,
    pub path: String,
    pub enabled: bool,
    pub created_at: String,
    pub is_accessible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub target_directory: String,
    pub scan_interval_minutes: i64,
    pub auto_start_active: bool,
    pub verify_checksum: bool,
    pub max_versions_per_file: i64,
    pub theme: String,
    pub run_on_windows_startup: bool,
    pub minimize_to_tray: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            target_directory: "C:\\Yedekler".to_string(),
            scan_interval_minutes: 5,
            auto_start_active: false,
            verify_checksum: false,
            max_versions_per_file: 10,
            theme: "dark".to_string(),
            run_on_windows_startup: false,
            minimize_to_tray: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileRecord {
    pub id: i64,
    pub source_id: i64,
    pub file_path: String,
    pub relative_path: String,
    pub file_size: u64,
    pub modified_time: String,
    pub last_backup_time: Option<String>,
    pub status: String, // "backed_up", "pending", "error", "source_deleted"
    pub sha256_hash: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileVersion {
    pub id: i64,
    pub file_record_id: i64,
    pub file_name: String,
    pub source_path: String,
    pub relative_path: String,
    pub version_number: i64,
    pub backup_file_path: String,
    pub file_size: u64,
    pub modified_time: String,
    pub backup_time: String,
    pub sha256_hash: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupLog {
    pub id: i64,
    pub timestamp: String,
    pub level: String, // "INFO", "SUCCESS", "WARN", "ERROR"
    pub source_path: Option<String>,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardStats {
    pub last_scan_time: Option<String>,
    pub next_scan_in_seconds: i64,
    pub total_backed_up_files: i64,
    pub total_backed_up_bytes: u64,
    pub pending_changes: i64,
    pub error_count: i64,
    pub is_running: bool,
    pub is_scanning: bool,
    pub active_file_path: Option<String>,
    pub progress_percent: f32,
    pub target_disk_free_gb: f64,
    pub target_disk_total_gb: f64,
    pub target_accessible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RestoreRequest {
    pub version_id: i64,
    pub destination_path: String,
    pub overwrite: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RestoreResult {
    pub success: bool,
    pub message: String,
    pub restored_path: String,
}
