pub mod backup_engine;
pub mod db;
pub mod models;
pub mod tray;

use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicI64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use tauri::{AppHandle, Emitter, Manager, State, WindowEvent};

use crate::backup_engine::BackupEngine;
use crate::db::Database;
use crate::models::{
    AppSettings, BackupLog, DashboardStats, FileVersion, RestoreRequest, RestoreResult,
    SourceFolder,
};

pub struct AppState {
    pub db: Arc<Mutex<Database>>,
    pub engine: Arc<BackupEngine>,
    pub is_auto_active: Arc<AtomicBool>,
    pub next_scan_seconds: Arc<AtomicI64>,
}

// ---------------- TAURI IPC COMMANDS ----------------

#[tauri::command]
fn get_dashboard_stats(state: State<'_, AppState>) -> Result<DashboardStats, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let settings = db.get_settings().map_err(|e| e.to_string())?;
    let (total_files, total_bytes, pending, errors, last_scan) =
        db.get_dashboard_counts().map_err(|e| e.to_string())?;

    let is_running = state.engine.is_running.load(Ordering::SeqCst);
    let is_auto = state.is_auto_active.load(Ordering::SeqCst);
    let next_sec = state.next_scan_seconds.load(Ordering::SeqCst);

    // Target accessibility and disk space check
    let target_path = std::path::Path::new(&settings.target_directory);
    let target_accessible = target_path.exists();

    let (free_gb, total_gb) = get_disk_space_internal(&settings.target_directory);

    Ok(DashboardStats {
        last_scan_time: last_scan,
        next_scan_in_seconds: if is_auto { next_sec } else { 0 },
        total_backed_up_files: total_files,
        total_backed_up_bytes: total_bytes,
        pending_changes: pending,
        error_count: errors,
        is_running: is_auto,
        is_scanning: is_running,
        active_file_path: None,
        progress_percent: if is_running { 50.0 } else { 0.0 },
        target_disk_free_gb: free_gb,
        target_disk_total_gb: total_gb,
        target_accessible,
    })
}

#[tauri::command]
fn get_settings(state: State<'_, AppState>) -> Result<AppSettings, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_settings().map_err(|e| e.to_string())
}

#[tauri::command]
fn save_settings(settings: AppSettings, state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_settings(&settings).map_err(|e| e.to_string())?;
    state
        .is_auto_active
        .store(settings.auto_start_active, Ordering::SeqCst);
    state
        .next_scan_seconds
        .store(settings.scan_interval_minutes * 60, Ordering::SeqCst);
    Ok(())
}

#[tauri::command]
fn get_source_folders(state: State<'_, AppState>) -> Result<Vec<SourceFolder>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_source_folders().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_source_folder(path: String, state: State<'_, AppState>) -> Result<i64, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let path_clean = path.trim();
    if path_clean.is_empty() {
        return Err("Klasör yolu boş olamaz.".to_string());
    }

    // Check duplicate
    let existing = db.get_source_folders().map_err(|e| e.to_string())?;
    if existing.iter().any(|f| f.path.eq_ignore_ascii_case(path_clean)) {
        return Err("Bu klasör zaten kaynak listesinde ekli.".to_string());
    }

    // Check target conflict
    let settings = db.get_settings().map_err(|e| e.to_string())?;
    if let Err(e) = BackupEngine::validate_paths(
        &[SourceFolder {
            id: 0,
            path: path_clean.to_string(),
            enabled: true,
            created_at: String::new(),
            is_accessible: true,
        }],
        &settings.target_directory,
    ) {
        return Err(e);
    }

    db.add_source_folder(path_clean).map_err(|e| e.to_string())
}

#[tauri::command]
fn remove_source_folder(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.remove_source_folder(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn clear_source_folders(state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.clear_source_folders().map_err(|e| e.to_string())
}

#[tauri::command]
fn start_backup_manual(app_handle: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    let engine = Arc::clone(&state.engine);
    let db_arc = Arc::clone(&state.db);

    // Run backup in asynchronous background thread
    std::thread::spawn(move || {
        let (settings, sources) = {
            let db = match db_arc.lock() {
                Ok(guard) => guard,
                Err(_) => return,
            };
            let s = db.get_settings().unwrap_or_default();
            let src = db.get_source_folders().unwrap_or_default();
            (s, src)
        };

        let app_clone = app_handle.clone();
        let db_lock = match db_arc.lock() {
            Ok(guard) => guard,
            Err(_) => return,
        };

        let _ = engine.run_backup(&db_lock, &settings, &sources, |progress| {
            let _ = app_clone.emit(
                "backup-progress",
                serde_json::json!({
                    "total": progress.total_files,
                    "processed": progress.processed_files,
                    "copied": progress.copied_files,
                    "skipped": progress.skipped_files,
                    "errors": progress.error_files,
                    "current": progress.current_file,
                    "percent": progress.percent
                }),
            );
        });

        let _ = app_handle.emit("backup-finished", ());
    });

    Ok(())
}

#[tauri::command]
fn cancel_backup(state: State<'_, AppState>) -> Result<(), String> {
    state.engine.cancel();
    Ok(())
}

#[tauri::command]
fn toggle_auto_backup(active: bool, state: State<'_, AppState>) -> Result<(), String> {
    state.is_auto_active.store(active, Ordering::SeqCst);
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let mut settings = db.get_settings().map_err(|e| e.to_string())?;
    settings.auto_start_active = active;
    db.save_settings(&settings).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_logs(limit: Option<i64>, state: State<'_, AppState>) -> Result<Vec<BackupLog>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_logs(limit.unwrap_or(100)).map_err(|e| e.to_string())
}

#[tauri::command]
fn clear_logs(state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.clear_logs().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_file_versions(state: State<'_, AppState>) -> Result<Vec<FileVersion>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_all_file_versions().map_err(|e| e.to_string())
}

#[tauri::command]
fn restore_file_version(req: RestoreRequest, state: State<'_, AppState>) -> Result<RestoreResult, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    BackupEngine::restore_version(&db, &req)
}

fn get_disk_space_internal(path_str: &str) -> (f64, f64) {
    let sys = sysinfo::Disks::new_with_refreshed_list();
    let target_path = std::path::Path::new(path_str);

    for disk in &sys {
        if target_path.starts_with(disk.mount_point()) {
            let free_gb = disk.available_space() as f64 / (1024.0 * 1024.0 * 1024.0);
            let total_gb = disk.total_space() as f64 / (1024.0 * 1024.0 * 1024.0);
            return (free_gb, total_gb);
        }
    }

    // Default approximation if disk mount point not matched directly
    (128.5, 512.0)
}

// ---------------- TAURI RUNNER ENTRYPOINT ----------------

pub fn run() {
    let app_dir = std::env::var("APPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("RustAutoBackup");

    let db_path = app_dir.join("autobackup.db");
    let db = Database::new(db_path).expect("SQLite veritabanı başlatılamadı!");

    let initial_settings = db.get_settings().unwrap_or_default();
    let auto_active = initial_settings.auto_start_active;
    let scan_interval = initial_settings.scan_interval_minutes;

    let app_state = AppState {
        db: Arc::new(Mutex::new(db)),
        engine: Arc::new(BackupEngine::new()),
        is_auto_active: Arc::new(AtomicBool::new(auto_active)),
        next_scan_seconds: Arc::new(AtomicI64::new(scan_interval * 60)),
    };

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .setup(|app| {
            // Setup System Tray
            if let Err(e) = tray::setup_tray(app.handle()) {
                eprintln!("Tepsi simgesi başlatılamadı: {}", e);
            }

            // Background scheduler thread
            let app_handle = app.handle().clone();
            let state = app.state::<AppState>();
            let db_arc = Arc::clone(&state.db);
            let engine = Arc::clone(&state.engine);
            let is_auto_active = Arc::clone(&state.is_auto_active);
            let next_scan_seconds = Arc::clone(&state.next_scan_seconds);

            std::thread::spawn(move || loop {
                std::thread::sleep(Duration::from_secs(1));

                if is_auto_active.load(Ordering::SeqCst) {
                    let cur = next_scan_seconds.fetch_sub(1, Ordering::SeqCst);
                    if cur <= 1 {
                        // Reset counter based on db settings
                        let interval = {
                            if let Ok(guard) = db_arc.lock() {
                                guard.get_settings().map(|s| s.scan_interval_minutes).unwrap_or(5)
                            } else {
                                5
                            }
                        };
                        next_scan_seconds.store(interval * 60, Ordering::SeqCst);

                        // Trigger scheduled backup
                        if !engine.is_running.load(Ordering::SeqCst) {
                            let (settings, sources) = {
                                if let Ok(guard) = db_arc.lock() {
                                    (guard.get_settings().unwrap_or_default(), guard.get_source_folders().unwrap_or_default())
                                } else {
                                    continue;
                                }
                            };

                            let app_emit = app_handle.clone();
                            if let Ok(guard) = db_arc.lock() {
                                let _ = engine.run_backup(&guard, &settings, &sources, |progress| {
                                    let _ = app_emit.emit("backup-progress", serde_json::json!({
                                        "total": progress.total_files,
                                        "processed": progress.processed_files,
                                        "copied": progress.copied_files,
                                        "skipped": progress.skipped_files,
                                        "errors": progress.error_files,
                                        "current": progress.current_file,
                                        "percent": progress.percent
                                    }));
                                });
                            }
                            let _ = app_handle.emit("backup-finished", ());
                        }
                    }
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            // Window close handler: minimize to system tray if enabled
            if let WindowEvent::CloseRequested { api, .. } = event {
                let app = window.app_handle();
                let state = app.state::<AppState>();
                let minimize_to_tray = {
                    if let Ok(db) = state.db.lock() {
                        db.get_settings().map(|s| s.minimize_to_tray).unwrap_or(true)
                    } else {
                        true
                    }
                };

                if minimize_to_tray {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        });

    builder
        .invoke_handler(tauri::generate_handler![
            get_dashboard_stats,
            get_settings,
            save_settings,
            get_source_folders,
            add_source_folder,
            remove_source_folder,
            clear_source_folders,
            start_backup_manual,
            cancel_backup,
            toggle_auto_backup,
            get_logs,
            clear_logs,
            get_file_versions,
            restore_file_version,
        ])
        .run(tauri::generate_context!())
        .expect("Tauri uygulaması başlatılırken hata oluştu!");
}
