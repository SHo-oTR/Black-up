use std::fs::{self, File};
use std::io::{self, Read};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::SystemTime;
use chrono::{DateTime, Local};
use sha2::{Digest, Sha256};
use walkdir::WalkDir;

use crate::db::Database;
use crate::models::{AppSettings, RestoreRequest, RestoreResult, SourceFolder};

pub struct BackupProgress {
    pub total_files: usize,
    pub processed_files: usize,
    pub copied_files: usize,
    pub skipped_files: usize,
    pub error_files: usize,
    pub current_file: String,
    pub percent: f32,
}

pub struct BackupEngine {
    pub is_running: Arc<AtomicBool>,
    pub should_cancel: Arc<AtomicBool>,
}

impl BackupEngine {
    pub fn new() -> Self {
        Self {
            is_running: Arc::new(AtomicBool::new(false)),
            should_cancel: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn cancel(&self) {
        self.should_cancel.store(true, Ordering::SeqCst);
    }

    /// Validates path relationship: target must not be inside any source folder,
    /// and source must not be equal to target.
    pub fn validate_paths(source_folders: &[SourceFolder], target_path: &str) -> Result<(), String> {
        let target_canonical = Path::new(target_path)
            .canonicalize()
            .unwrap_or_else(|_| PathBuf::from(target_path));

        for src in source_folders {
            if !src.enabled {
                continue;
            }
            let src_canonical = Path::new(&src.path)
                .canonicalize()
                .unwrap_or_else(|_| PathBuf::from(&src.path));

            if target_canonical == src_canonical {
                return Err(format!(
                    "Güvenlik uyarısı: Hedef klasör ({}) ile kaynak klasör ({}) aynı olamaz!",
                    target_path, src.path
                ));
            }

            // Target inside source check
            if target_canonical.starts_with(&src_canonical) {
                return Err(format!(
                    "Güvenlik uyarısı: Hedef klasör ({}) kaynak klasörün ({}) içinde yer alamaz!",
                    target_path, src.path
                ));
            }

            // Source inside target check
            if src_canonical.starts_with(&target_canonical) {
                return Err(format!(
                    "Güvenlik uyarısı: Kaynak klasör ({}) hedef klasörün ({}) içinde yer alamaz!",
                    src.path, target_path
                ));
            }
        }
        Ok(())
    }

    /// Calculates SHA-256 checksum of a file
    pub fn compute_sha256<P: AsRef<Path>>(path: P) -> io::Result<String> {
        let mut file = File::open(path)?;
        let mut hasher = Sha256::new();
        let mut buffer = [0u8; 65536]; // 64KB chunks
        loop {
            let bytes_read = file.read(&mut buffer)?;
            if bytes_read == 0 {
                break;
            }
            hasher.update(&buffer[..bytes_read]);
        }
        Ok(format!("{:x}", hasher.finalize()))
    }

    /// Performs atomic copy: writes to a temporary file first, verifies size,
    /// then atomically renames to the destination.
    pub fn atomic_copy<P: AsRef<Path>, Q: AsRef<Path>>(source: P, destination: Q) -> io::Result<()> {
        let src_path = source.as_ref();
        let dest_path = destination.as_ref();

        if let Some(dest_dir) = dest_path.parent() {
            fs::create_dir_all(dest_dir)?;
        }

        let temp_filename = format!(
            ".tmp_{}_{}",
            dest_path.file_name().and_then(|n| n.to_str()).unwrap_or("file"),
            SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_nanos()
        );
        let temp_path = dest_path.parent().unwrap().join(temp_filename);

        // Copy bytes to temp
        fs::copy(src_path, &temp_path)?;

        // Verify temp file size matches source
        let src_size = fs::metadata(src_path)?.len();
        let tmp_size = fs::metadata(&temp_path)?.len();
        if src_size != tmp_size {
            let _ = fs::remove_file(&temp_path);
            return Err(io::Error::new(
                io::ErrorKind::Other,
                "Geçici dosya kopyalama boyutu kaynak dosya boyutu ile eşleşmedi!",
            ));
        }

        // Atomic rename / move to destination
        #[cfg(target_os = "windows")]
        {
            // On Windows, rename might fail if target exists, remove target first if it exists
            if dest_path.exists() {
                let _ = fs::remove_file(dest_path);
            }
        }
        fs::rename(&temp_path, dest_path)?;

        Ok(())
    }

    /// Executes full backup cycle across all enabled source folders.
    pub fn run_backup<F>(
        &self,
        db: &Database,
        settings: &AppSettings,
        source_folders: &[SourceFolder],
        mut on_progress: F,
    ) -> Result<BackupProgress, String>
    where
        F: FnMut(&BackupProgress),
    {
        // Enforce concurrency lock
        if self.is_running.compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst).is_err() {
            return Err("Hata: Zaten aktif çalışan bir yedekleme işlemi bulunmaktadır.".to_string());
        }

        // Reset cancellation flag
        self.should_cancel.store(false, Ordering::SeqCst);

        // Validate paths
        if let Err(err) = Self::validate_paths(source_folders, &settings.target_directory) {
            self.is_running.store(false, Ordering::SeqCst);
            let _ = db.add_log("ERROR", None, &err);
            return Err(err);
        }

        // Ensure target directory exists and is writable
        let target_dir = Path::new(&settings.target_directory);
        if let Err(e) = fs::create_dir_all(target_dir) {
            self.is_running.store(false, Ordering::SeqCst);
            let msg = format!("Yedekleme hedef klasörüne erişilemiyor veya oluşturulamıyor ({}): {}", settings.target_directory, e);
            let _ = db.add_log("ERROR", None, &msg);
            return Err(msg);
        }

        let _ = db.add_log("INFO", None, "Otomatik yedekleme işlemi başlatıldı.");

        // Step 1: Collect all files across enabled sources
        let mut files_to_scan = Vec::new();
        for src in source_folders {
            if !src.enabled {
                continue;
            }

            let src_path = Path::new(&src.path);
            if !src_path.exists() {
                let msg = format!("Kaynak klasöre erişilemiyor veya mevcut değil: {}", src.path);
                let _ = db.add_log("WARN", Some(&src.path), &msg);
                continue;
            }

            for entry in WalkDir::new(src_path).into_iter().filter_map(|e| e.ok()) {
                if entry.file_type().is_file() {
                    files_to_scan.push((src.id, src.path.clone(), entry.into_path()));
                }
            }
        }

        let total_files = files_to_scan.len();
        let mut progress = BackupProgress {
            total_files,
            processed_files: 0,
            copied_files: 0,
            skipped_files: 0,
            error_files: 0,
            current_file: String::new(),
            percent: 0.0,
        };

        let mut active_paths_per_source: std::collections::HashMap<i64, Vec<String>> = std::collections::HashMap::new();
        for src in source_folders {
            if src.enabled {
                active_paths_per_source.insert(src.id, Vec::new());
            }
        }

        for (source_id, source_root, file_path) in files_to_scan {
            if self.should_cancel.load(Ordering::SeqCst) {
                let _ = db.add_log("WARN", None, "Yedekleme işlemi kullanıcı tarafından güvenle durduruldu.");
                break;
            }

            let file_path_str = file_path.to_string_lossy().to_string();
            active_paths_per_source
                .entry(source_id)
                .or_default()
                .push(file_path_str.clone());

            let rel_path = match file_path.strip_prefix(Path::new(&source_root)) {
                Ok(p) => p.to_string_lossy().to_string(),
                Err(_) => file_path.file_name().unwrap_or_default().to_string_lossy().to_string(),
            };

            progress.current_file = rel_path.clone();
            progress.processed_files += 1;
            progress.percent = if total_files > 0 {
                (progress.processed_files as f32 / total_files as f32) * 100.0
            } else {
                100.0
            };
            on_progress(&progress);

            // Read metadata
            let meta = match fs::metadata(&file_path) {
                Ok(m) => m,
                Err(e) => {
                    progress.error_files += 1;
                    let msg = format!("Dosya bilgileri okunamadı ({}): {}", rel_path, e);
                    let _ = db.add_log("ERROR", Some(&file_path_str), &msg);
                    continue;
                }
            };

            let current_size = meta.len();
            let current_mtime_epoch = meta.modified().unwrap_or(SystemTime::UNIX_EPOCH);
            let current_mtime_dt: DateTime<Local> = current_mtime_epoch.into();
            let current_mtime_str = current_mtime_dt.format("%Y-%m-%d %H:%M:%S").to_string();

            // Check against database record
            let existing_record = db.get_file_record(&file_path_str).ok().flatten();

            let mut needs_backup = false;
            let mut reason = "";

            if let Some(ref rec) = existing_record {
                if rec.file_size != current_size {
                    needs_backup = true;
                    reason = "Dosya boyutu değişti";
                } else if rec.modified_time != current_mtime_str {
                    needs_backup = true;
                    reason = "Değiştirilme zamanı güncellendi";
                } else if rec.status != "backed_up" {
                    needs_backup = true;
                    reason = "Önceki yedekleme tamamlanmamıştı";
                } else if settings.verify_checksum {
                    // Optional SHA-256 verification
                    if let Ok(cur_hash) = Self::compute_sha256(&file_path) {
                        if rec.sha256_hash.as_deref() != Some(&cur_hash) {
                            needs_backup = true;
                            reason = "SHA-256 içeriği değişti";
                        }
                    }
                }
            } else {
                needs_backup = true;
                reason = "İlk tarama - Yeni dosya";
            }

            if !needs_backup {
                progress.skipped_files += 1;
                continue;
            }

            // Path construction
            // Current destination: target / kaynak_{id} / guncel / {rel_path}
            let current_dest_path = target_dir
                .join(format!("kaynak_{}", source_id))
                .join("guncel")
                .join(&rel_path);

            // Version destination: target / kaynak_{id} / surumler / {rel_path}_{timestamp}.bak
            let timestamp_suffix = Local::now().format("%Y%m%d_%H%M%S").to_string();
            let version_filename = format!("{}_{}.bak", rel_path.replace(['/', '\\'], "_"), timestamp_suffix);
            let version_dest_path = target_dir
                .join(format!("kaynak_{}", source_id))
                .join("surumler")
                .join(&version_filename);

            // Execute atomic copy to current location
            if let Err(e) = Self::atomic_copy(&file_path, &current_dest_path) {
                progress.error_files += 1;
                let msg = format!("Dosya kopyalama başarısız ({}): {}", rel_path, e);
                let _ = db.add_log("ERROR", Some(&file_path_str), &msg);
                let _ = db.upsert_file_record(
                    source_id,
                    &file_path_str,
                    &rel_path,
                    current_size,
                    &current_mtime_str,
                    None,
                    "error",
                    None,
                );
                continue;
            }

            // Also preserve into versions directory
            let _ = Self::atomic_copy(&file_path, &version_dest_path);

            // Compute hash if enabled or optional
            let sha256_hash = if settings.verify_checksum {
                Self::compute_sha256(&file_path).ok()
            } else {
                None
            };

            let now_str = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

            // Update SQLite file record
            match db.upsert_file_record(
                source_id,
                &file_path_str,
                &rel_path,
                current_size,
                &current_mtime_str,
                Some(&now_str),
                "backed_up",
                sha256_hash.as_deref(),
            ) {
                Ok(record_id) => {
                    // Record new version in SQLite
                    let _ = db.add_file_version(
                        record_id,
                        &version_dest_path.to_string_lossy(),
                        current_size,
                        &current_mtime_str,
                        sha256_hash.as_deref(),
                        settings.max_versions_per_file,
                    );
                }
                Err(e) => {
                    progress.error_files += 1;
                    let msg = format!("Dosya veritabanına kaydedilemedi ({}): {}", rel_path, e);
                    let _ = db.add_log("ERROR", Some(&file_path_str), &msg);
                    continue;
                }
            }

            progress.copied_files += 1;
            let log_msg = format!("Dosya başarıyla yedeklendi [{}]: {}", reason, rel_path);
            let _ = db.add_log("SUCCESS", Some(&file_path_str), &log_msg);
        }

        // Mark deleted source files in SQLite (preserving backup files)
        for (source_id, paths) in active_paths_per_source {
            let _ = db.mark_missing_files_as_deleted(source_id, &paths);
        }

        let summary = format!(
            "Yedekleme tamamlandı. Taranan: {}, Kopyalanan: {}, Değişmeyen/Atlanan: {}, Hata: {}",
            progress.processed_files, progress.copied_files, progress.skipped_files, progress.error_files
        );
        let _ = db.add_log(if progress.error_files == 0 { "SUCCESS" } else { "WARN" }, None, &summary);

        self.is_running.store(false, Ordering::SeqCst);
        Ok(progress)
    }

    /// Restores a specific version back to original or chosen path.
    pub fn restore_version(
        db: &Database,
        req: &RestoreRequest,
    ) -> Result<RestoreResult, String> {
        // Query version details
        let all_versions = db.get_all_file_versions().map_err(|e| e.to_string())?;
        let ver = all_versions
            .into_iter()
            .find(|v| v.id == req.version_id)
            .ok_or_else(|| "Belirtilen sürüm kaydı veritabanında bulunamadı!".to_string())?;

        let backup_path = Path::new(&ver.backup_file_path);
        if !backup_path.exists() {
            return Err(format!(
                "Yedek dosyası hedef diskte bulunamadı: {}",
                ver.backup_file_path
            ));
        }

        let dest_path = Path::new(&req.destination_path);

        // Security check: overwrite verification
        if dest_path.exists() && !req.overwrite {
            return Err("Hedef konumda aynı isimli dosya zaten mevcut. Üzerine yazma izni verilmedi!".to_string());
        }

        // Ensure parent directory exists
        if let Some(parent) = dest_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        // Restore file via atomic copy
        if let Err(e) = Self::atomic_copy(backup_path, dest_path) {
            let err_msg = format!("Dosya geri yüklenemedi: {}", e);
            let _ = db.add_log("ERROR", Some(&req.destination_path), &err_msg);
            return Err(err_msg);
        }

        let success_msg = format!(
            "Sürüm #{} başarıyla geri yüklendi: {}",
            ver.version_number, req.destination_path
        );
        let _ = db.add_log("SUCCESS", Some(&req.destination_path), &success_msg);

        Ok(RestoreResult {
            success: true,
            message: success_msg,
            restored_path: req.destination_path.clone(),
        })
    }
}
