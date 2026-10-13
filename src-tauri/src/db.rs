use std::path::Path;
use rusqlite::{params, Connection, Result};
use crate::models::{AppSettings, BackupLog, FileRecord, FileVersion, SourceFolder};
use chrono::Local;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self> {
        if let Some(parent) = path.as_ref().parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let conn = Connection::open(path)?;
        let db = Database { conn };
        db.init_tables()?;
        Ok(db)
    }

    pub fn new_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        let db = Database { conn };
        db.init_tables()?;
        Ok(db)
    }

    fn init_tables(&self) -> Result<()> {
        self.conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                target_directory TEXT NOT NULL,
                scan_interval_minutes INTEGER NOT NULL,
                auto_start_active INTEGER NOT NULL,
                verify_checksum INTEGER NOT NULL,
                max_versions_per_file INTEGER NOT NULL,
                theme TEXT NOT NULL,
                run_on_windows_startup INTEGER NOT NULL,
                minimize_to_tray INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS source_folders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path TEXT NOT NULL UNIQUE,
                enabled INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS file_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_id INTEGER NOT NULL,
                file_path TEXT NOT NULL UNIQUE,
                relative_path TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                modified_time TEXT NOT NULL,
                last_backup_time TEXT,
                status TEXT NOT NULL,
                sha256_hash TEXT
            );

            CREATE TABLE IF NOT EXISTS file_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_record_id INTEGER NOT NULL,
                version_number INTEGER NOT NULL,
                backup_file_path TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                modified_time TEXT NOT NULL,
                backup_time TEXT NOT NULL,
                sha256_hash TEXT
            );

            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                level TEXT NOT NULL,
                source_path TEXT,
                message TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_file_path ON file_records(file_path);
            CREATE INDEX IF NOT EXISTS idx_file_versions_record ON file_versions(file_record_id);
            CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
            "
        )?;

        // Ensure default settings row exists
        let mut stmt = self.conn.prepare("SELECT COUNT(*) FROM settings WHERE id = 1")?;
        let count: i64 = stmt.query_row([], |row| row.get(0))?;
        if count == 0 {
            let def = AppSettings::default();
            self.conn.execute(
                "INSERT INTO settings (id, target_directory, scan_interval_minutes, auto_start_active, verify_checksum, max_versions_per_file, theme, run_on_windows_startup, minimize_to_tray)
                 VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![
                    def.target_directory,
                    def.scan_interval_minutes,
                    if def.auto_start_active { 1 } else { 0 },
                    if def.verify_checksum { 1 } else { 0 },
                    def.max_versions_per_file,
                    def.theme,
                    if def.run_on_windows_startup { 1 } else { 0 },
                    if def.minimize_to_tray { 1 } else { 0 },
                ],
            )?;
        }

        Ok(())
    }

    pub fn get_settings(&self) -> Result<AppSettings> {
        let mut stmt = self.conn.prepare(
            "SELECT target_directory, scan_interval_minutes, auto_start_active, verify_checksum, max_versions_per_file, theme, run_on_windows_startup, minimize_to_tray FROM settings WHERE id = 1"
        )?;

        stmt.query_row([], |row| {
            let auto_start: i64 = row.get(2)?;
            let verify_chk: i64 = row.get(3)?;
            let win_startup: i64 = row.get(6)?;
            let min_tray: i64 = row.get(7)?;
            Ok(AppSettings {
                target_directory: row.get(0)?,
                scan_interval_minutes: row.get(1)?,
                auto_start_active: auto_start == 1,
                verify_checksum: verify_chk == 1,
                max_versions_per_file: row.get(4)?,
                theme: row.get(5)?,
                run_on_windows_startup: win_startup == 1,
                minimize_to_tray: min_tray == 1,
            })
        })
    }

    pub fn save_settings(&self, s: &AppSettings) -> Result<()> {
        self.conn.execute(
            "UPDATE settings SET target_directory = ?1, scan_interval_minutes = ?2, auto_start_active = ?3, verify_checksum = ?4, max_versions_per_file = ?5, theme = ?6, run_on_windows_startup = ?7, minimize_to_tray = ?8 WHERE id = 1",
            params![
                s.target_directory,
                s.scan_interval_minutes,
                if s.auto_start_active { 1 } else { 0 },
                if s.verify_checksum { 1 } else { 0 },
                s.max_versions_per_file,
                s.theme,
                if s.run_on_windows_startup { 1 } else { 0 },
                if s.minimize_to_tray { 1 } else { 0 },
            ],
        )?;
        Ok(())
    }

    pub fn get_source_folders(&self) -> Result<Vec<SourceFolder>> {
        let mut stmt = self.conn.prepare("SELECT id, path, enabled, created_at FROM source_folders ORDER BY id ASC")?;
        let rows = stmt.query_map([], |row| {
            let enabled_int: i64 = row.get(2)?;
            let path_str: String = row.get(1)?;
            let is_accessible = Path::new(&path_str).exists();
            Ok(SourceFolder {
                id: row.get(0)?,
                path: path_str,
                enabled: enabled_int == 1,
                created_at: row.get(3)?,
                is_accessible,
            })
        })?;

        let mut folders = Vec::new();
        for r in rows {
            folders.push(r?);
        }
        Ok(folders)
    }

    pub fn add_source_folder(&self, path: &str) -> Result<i64> {
        let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        self.conn.execute(
            "INSERT INTO source_folders (path, enabled, created_at) VALUES (?1, 1, ?2)",
            params![path, now],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn remove_source_folder(&self, id: i64) -> Result<()> {
        self.conn.execute("DELETE FROM source_folders WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn clear_source_folders(&self) -> Result<()> {
        self.conn.execute("DELETE FROM source_folders", [])?;
        Ok(())
    }

    pub fn get_file_record(&self, file_path: &str) -> Result<Option<FileRecord>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, source_id, file_path, relative_path, file_size, modified_time, last_backup_time, status, sha256_hash FROM file_records WHERE file_path = ?1"
        )?;

        let mut rows = stmt.query(params![file_path])?;
        if let Some(row) = rows.next()? {
            let size_i64: i64 = row.get(4)?;
            Ok(Some(FileRecord {
                id: row.get(0)?,
                source_id: row.get(1)?,
                file_path: row.get(2)?,
                relative_path: row.get(3)?,
                file_size: size_i64 as u64,
                modified_time: row.get(5)?,
                last_backup_time: row.get(6)?,
                status: row.get(7)?,
                sha256_hash: row.get(8)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn upsert_file_record(
        &self,
        source_id: i64,
        file_path: &str,
        relative_path: &str,
        file_size: u64,
        modified_time: &str,
        last_backup_time: Option<&str>,
        status: &str,
        sha256_hash: Option<&str>,
    ) -> Result<i64> {
        self.conn.execute(
            "INSERT INTO file_records (source_id, file_path, relative_path, file_size, modified_time, last_backup_time, status, sha256_hash)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
             ON CONFLICT(file_path) DO UPDATE SET
                source_id = excluded.source_id,
                relative_path = excluded.relative_path,
                file_size = excluded.file_size,
                modified_time = excluded.modified_time,
                last_backup_time = excluded.last_backup_time,
                status = excluded.status,
                sha256_hash = excluded.sha256_hash",
            params![
                source_id,
                file_path,
                relative_path,
                file_size as i64,
                modified_time,
                last_backup_time,
                status,
                sha256_hash
            ],
        )?;

        let mut stmt = self.conn.prepare("SELECT id FROM file_records WHERE file_path = ?1")?;
        let record_id: i64 = stmt.query_row(params![file_path], |row| row.get(0))?;
        Ok(record_id)
    }

    pub fn mark_missing_files_as_deleted(&self, source_id: i64, active_paths: &[String]) -> Result<usize> {
        // Find existing records for this source that are not in active_paths
        let mut stmt = self.conn.prepare("SELECT id, file_path FROM file_records WHERE source_id = ?1 AND status != 'source_deleted'")?;
        let rows = stmt.query_map(params![source_id], |row| {
            Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?))
        })?;

        let mut updated = 0;
        for item in rows {
            let (id, path) = item?;
            if !active_paths.contains(&path) && !Path::new(&path).exists() {
                self.conn.execute("UPDATE file_records SET status = 'source_deleted' WHERE id = ?1", params![id])?;
                updated += 1;
            }
        }
        Ok(updated)
    }

    pub fn add_file_version(
        &self,
        file_record_id: i64,
        backup_file_path: &str,
        file_size: u64,
        modified_time: &str,
        sha256_hash: Option<&str>,
        max_versions: i64,
    ) -> Result<i64> {
        // Get next version number
        let mut stmt = self.conn.prepare("SELECT COALESCE(MAX(version_number), 0) + 1 FROM file_versions WHERE file_record_id = ?1")?;
        let next_v: i64 = stmt.query_row(params![file_record_id], |row| row.get(0))?;
        let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

        self.conn.execute(
            "INSERT INTO file_versions (file_record_id, version_number, backup_file_path, file_size, modified_time, backup_time, sha256_hash)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                file_record_id,
                next_v,
                backup_file_path,
                file_size as i64,
                modified_time,
                now,
                sha256_hash
            ],
        )?;

        // Prune oldest versions beyond max_versions if limit is set
        if max_versions > 0 {
            let mut count_stmt = self.conn.prepare("SELECT COUNT(*) FROM file_versions WHERE file_record_id = ?1")?;
            let count: i64 = count_stmt.query_row(params![file_record_id], |row| row.get(0))?;
            if count > max_versions {
                let to_remove = count - max_versions;
                self.conn.execute(
                    "DELETE FROM file_versions WHERE id IN (
                        SELECT id FROM file_versions WHERE file_record_id = ?1 ORDER BY version_number ASC LIMIT ?2
                    )",
                    params![file_record_id, to_remove],
                )?;
            }
        }

        Ok(next_v)
    }

    pub fn get_file_versions(&self, file_record_id: i64) -> Result<Vec<FileVersion>> {
        let mut stmt = self.conn.prepare(
            "SELECT v.id, v.file_record_id, r.file_path, r.relative_path, v.version_number, v.backup_file_path, v.file_size, v.modified_time, v.backup_time, v.sha256_hash
             FROM file_versions v
             JOIN file_records r ON v.file_record_id = r.id
             WHERE v.file_record_id = ?1
             ORDER BY v.version_number DESC"
        )?;

        let rows = stmt.query_map(params![file_record_id], |row| {
            let source_path: String = row.get(2)?;
            let file_name = Path::new(&source_path)
                .file_name()
                .map(|s| s.to_string_lossy().to_string())
                .unwrap_or_else(|| source_path.clone());
            let size_i64: i64 = row.get(6)?;

            Ok(FileVersion {
                id: row.get(0)?,
                file_record_id: row.get(1)?,
                file_name,
                source_path,
                relative_path: row.get(3)?,
                version_number: row.get(4)?,
                backup_file_path: row.get(5)?,
                file_size: size_i64 as u64,
                modified_time: row.get(7)?,
                backup_time: row.get(8)?,
                sha256_hash: row.get(9)?,
            })
        })?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r?);
        }
        Ok(list)
    }

    pub fn get_all_file_versions(&self) -> Result<Vec<FileVersion>> {
        let mut stmt = self.conn.prepare(
            "SELECT v.id, v.file_record_id, r.file_path, r.relative_path, v.version_number, v.backup_file_path, v.file_size, v.modified_time, v.backup_time, v.sha256_hash
             FROM file_versions v
             JOIN file_records r ON v.file_record_id = r.id
             ORDER BY v.backup_time DESC, v.version_number DESC"
        )?;

        let rows = stmt.query_map([], |row| {
            let source_path: String = row.get(2)?;
            let file_name = Path::new(&source_path)
                .file_name()
                .map(|s| s.to_string_lossy().to_string())
                .unwrap_or_else(|| source_path.clone());
            let size_i64: i64 = row.get(6)?;

            Ok(FileVersion {
                id: row.get(0)?,
                file_record_id: row.get(1)?,
                file_name,
                source_path,
                relative_path: row.get(3)?,
                version_number: row.get(4)?,
                backup_file_path: row.get(5)?,
                file_size: size_i64 as u64,
                modified_time: row.get(7)?,
                backup_time: row.get(8)?,
                sha256_hash: row.get(9)?,
            })
        })?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r?);
        }
        Ok(list)
    }

    pub fn delete_file_version(&self, version_id: i64) -> Result<()> {
        self.conn.execute("DELETE FROM file_versions WHERE id = ?1", params![version_id])?;
        Ok(())
    }

    pub fn clear_all_file_versions(&self) -> Result<()> {
        self.conn.execute("DELETE FROM file_versions", [])?;
        Ok(())
    }

    pub fn clean_old_versions(&self, keep_last: i64) -> Result<usize> {
        let keep = if keep_last < 1 { 1 } else { keep_last };
        let count = self.conn.execute(
            "DELETE FROM file_versions WHERE id NOT IN (
                SELECT id FROM (
                    SELECT id, ROW_NUMBER() OVER (PARTITION BY file_record_id ORDER BY version_number DESC) as rn
                    FROM file_versions
                ) WHERE rn <= ?1
            )",
            params![keep],
        )?;
        Ok(count)
    }

    pub fn add_log(&self, level: &str, source_path: Option<&str>, message: &str) -> Result<()> {
        let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        self.conn.execute(
            "INSERT INTO logs (timestamp, level, source_path, message) VALUES (?1, ?2, ?3, ?4)",
            params![now, level, source_path, message],
        )?;
        Ok(())
    }

    pub fn get_logs(&self, limit: i64) -> Result<Vec<BackupLog>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, timestamp, level, source_path, message FROM logs ORDER BY id DESC LIMIT ?1"
        )?;

        let rows = stmt.query_map(params![limit], |row| {
            Ok(BackupLog {
                id: row.get(0)?,
                timestamp: row.get(1)?,
                level: row.get(2)?,
                source_path: row.get(3)?,
                message: row.get(4)?,
            })
        })?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r?);
        }
        Ok(list)
    }

    pub fn clear_logs(&self) -> Result<()> {
        self.conn.execute("DELETE FROM logs", [])?;
        Ok(())
    }

    pub fn get_dashboard_counts(&self) -> Result<(i64, u64, i64, i64, Option<String>)> {
        let mut total_files_stmt = self.conn.prepare("SELECT COUNT(*), COALESCE(SUM(file_size), 0) FROM file_records WHERE status = 'backed_up'")?;
        let (total_files, total_bytes): (i64, i64) = total_files_stmt.query_row([], |row| Ok((row.get(0)?, row.get(1)?)))?;

        let mut pending_stmt = self.conn.prepare("SELECT COUNT(*) FROM file_records WHERE status = 'pending'")?;
        let pending_count: i64 = pending_stmt.query_row([], |row| row.get(0))?;

        let mut err_stmt = self.conn.prepare("SELECT COUNT(*) FROM logs WHERE level = 'ERROR'")?;
        let err_count: i64 = err_stmt.query_row([], |row| row.get(0))?;

        let mut last_scan_stmt = self.conn.prepare("SELECT timestamp FROM logs WHERE level = 'SUCCESS' AND message LIKE '%tamamlandı%' ORDER BY id DESC LIMIT 1")?;
        let last_scan = last_scan_stmt.query_row([], |row| row.get::<_, String>(0)).ok();

        Ok((total_files, total_bytes as u64, pending_count, err_count, last_scan))
    }
}
