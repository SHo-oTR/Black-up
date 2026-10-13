use std::fs;
use std::time::Duration;
use tempfile::tempdir;

use rust_auto_backup::backup_engine::BackupEngine;
use rust_auto_backup::db::Database;
use rust_auto_backup::models::{AppSettings, RestoreRequest, SourceFolder};

#[test]
fn test_01_initial_backup_copies_all_files() {
    let temp_src = tempdir().unwrap();
    let temp_target = tempdir().unwrap();

    let file1 = temp_src.path().join("Rapor.docx");
    let file2 = temp_src.path().join("Tablo.xlsx");
    fs::write(&file1, b"Gecici dokuman icerigi 1").unwrap();
    fs::write(&file2, b"Mali veriler 2026").unwrap();

    let db = Database::new_in_memory().unwrap();
    let src_id = db.add_source_folder(&temp_src.path().to_string_lossy()).unwrap();
    let mut settings = AppSettings::default();
    settings.target_directory = temp_target.path().to_string_lossy().to_string();

    let sources = vec![SourceFolder {
        id: src_id,
        path: temp_src.path().to_string_lossy().to_string(),
        enabled: true,
        created_at: "2026-01-01".to_string(),
        is_accessible: true,
    }];

    let engine = BackupEngine::new();
    let res = engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();

    assert_eq!(res.processed_files, 2);
    assert_eq!(res.copied_files, 2);
    assert_eq!(res.skipped_files, 0);

    // Verify backup files exist in target
    let src_folder_name = temp_src.path().file_name().unwrap();
    let target_file1 = temp_target.path().join(src_folder_name).join("Rapor.docx");
    assert!(target_file1.exists(), "İlk taramada dosya hedefe kopyalanmalıydı");
}

#[test]
fn test_02_unchanged_file_is_skipped() {
    let temp_src = tempdir().unwrap();
    let temp_target = tempdir().unwrap();

    let file1 = temp_src.path().join("Sabit.pdf");
    fs::write(&file1, b"Sabit icerik degismeyecek").unwrap();

    let db = Database::new_in_memory().unwrap();
    let src_id = db.add_source_folder(&temp_src.path().to_string_lossy()).unwrap();
    let mut settings = AppSettings::default();
    settings.target_directory = temp_target.path().to_string_lossy().to_string();

    let sources = vec![SourceFolder {
        id: src_id,
        path: temp_src.path().to_string_lossy().to_string(),
        enabled: true,
        created_at: "2026-01-01".to_string(),
        is_accessible: true,
    }];

    let engine = BackupEngine::new();
    // Run 1: initial
    let res1 = engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();
    assert_eq!(res1.copied_files, 1);

    // Run 2: without modifying file
    let res2 = engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();
    assert_eq!(res2.processed_files, 1);
    assert_eq!(res2.copied_files, 0, "Değişmeyen dosya tekrar kopyalanmamalı");
    assert_eq!(res2.skipped_files, 1);
}

#[test]
fn test_03_file_size_change_triggers_backup() {
    let temp_src = tempdir().unwrap();
    let temp_target = tempdir().unwrap();

    let file1 = temp_src.path().join("Veri.csv");
    fs::write(&file1, b"satir1").unwrap();

    let db = Database::new_in_memory().unwrap();
    let src_id = db.add_source_folder(&temp_src.path().to_string_lossy()).unwrap();
    let mut settings = AppSettings::default();
    settings.target_directory = temp_target.path().to_string_lossy().to_string();

    let sources = vec![SourceFolder {
        id: src_id,
        path: temp_src.path().to_string_lossy().to_string(),
        enabled: true,
        created_at: "2026-01-01".to_string(),
        is_accessible: true,
    }];

    let engine = BackupEngine::new();
    engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();

    // Modify file size
    fs::write(&file1, b"satir1\nsatir2_eklendi_boyut_artti").unwrap();

    let res2 = engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();
    assert_eq!(res2.copied_files, 1, "Boyutu değişen dosya yeniden yedeklenmeli");
}

#[test]
fn test_04_mtime_change_triggers_backup() {
    let temp_src = tempdir().unwrap();
    let temp_target = tempdir().unwrap();

    let file1 = temp_src.path().join("Not.txt");
    fs::write(&file1, b"ayni_boyut").unwrap();

    let db = Database::new_in_memory().unwrap();
    let src_id = db.add_source_folder(&temp_src.path().to_string_lossy()).unwrap();
    let mut settings = AppSettings::default();
    settings.target_directory = temp_target.path().to_string_lossy().to_string();

    let sources = vec![SourceFolder {
        id: src_id,
        path: temp_src.path().to_string_lossy().to_string(),
        enabled: true,
        created_at: "2026-01-01".to_string(),
        is_accessible: true,
    }];

    let engine = BackupEngine::new();
    engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();

    // Small sleep then touch file with same size but updated modified time
    std::thread::sleep(Duration::from_millis(1100));
    fs::write(&file1, b"fark_metin").unwrap(); // length 10 bytes, same as "ayni_boyut"

    let res2 = engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();
    assert_eq!(res2.copied_files, 1, "Değiştirilme zamanı değiştiğinde yeni sürüm oluşturulmalı");
}

#[test]
fn test_05_deleted_source_file_preserves_backup() {
    let temp_src = tempdir().unwrap();
    let temp_target = tempdir().unwrap();

    let file1 = temp_src.path().join("SilinecekDosya.txt");
    fs::write(&file1, b"Onemli arsiv").unwrap();

    let db = Database::new_in_memory().unwrap();
    let src_id = db.add_source_folder(&temp_src.path().to_string_lossy()).unwrap();
    let mut settings = AppSettings::default();
    settings.target_directory = temp_target.path().to_string_lossy().to_string();

    let sources = vec![SourceFolder {
        id: src_id,
        path: temp_src.path().to_string_lossy().to_string(),
        enabled: true,
        created_at: "2026-01-01".to_string(),
        is_accessible: true,
    }];

    let engine = BackupEngine::new();
    engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();

    let src_folder_name = temp_src.path().file_name().unwrap();
    let target_backup = temp_target.path().join(src_folder_name).join("SilinecekDosya.txt");
    assert!(target_backup.exists());

    // User deletes source file
    fs::remove_file(&file1).unwrap();

    // Next scan
    engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();

    // Backup file MUST STILL EXIST!
    assert!(target_backup.exists(), "Kaynakta silinen dosya hedefte silinmemelidir!");

    // Status in db should be source_deleted
    let rec = db.get_file_record(&file1.to_string_lossy()).unwrap().expect("Dosya kaydı veritabanında bulunmalı");
    assert_eq!(rec.status, "source_deleted");
}

#[test]
fn test_06_same_filename_in_different_sources_do_not_collide() {
    let temp_src1 = tempdir().unwrap();
    let temp_src2 = tempdir().unwrap();
    let temp_target = tempdir().unwrap();

    let file_a = temp_src1.path().join("Proje.doc");
    let file_b = temp_src2.path().join("Proje.doc");

    fs::write(&file_a, b"Kaynak 1 Icerigi").unwrap();
    fs::write(&file_b, b"Kaynak 2 Tamamen Farkli Icerik").unwrap();

    let db = Database::new_in_memory().unwrap();
    let src1_id = db.add_source_folder(&temp_src1.path().to_string_lossy()).unwrap();
    let src2_id = db.add_source_folder(&temp_src2.path().to_string_lossy()).unwrap();

    let mut settings = AppSettings::default();
    settings.target_directory = temp_target.path().to_string_lossy().to_string();

    let sources = vec![
        SourceFolder {
            id: src1_id,
            path: temp_src1.path().to_string_lossy().to_string(),
            enabled: true,
            created_at: "2026-01-01".to_string(),
            is_accessible: true,
        },
        SourceFolder {
            id: src2_id,
            path: temp_src2.path().to_string_lossy().to_string(),
            enabled: true,
            created_at: "2026-01-01".to_string(),
            is_accessible: true,
        },
    ];

    let engine = BackupEngine::new();
    engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();

    let target1 = temp_target.path().join(temp_src1.path().file_name().unwrap()).join("Proje.doc");
    let target2 = temp_target.path().join(temp_src2.path().file_name().unwrap()).join("Proje.doc");

    assert!(target1.exists());
    assert!(target2.exists());
    assert_eq!(fs::read(&target1).unwrap(), b"Kaynak 1 Icerigi");
    assert_eq!(fs::read(&target2).unwrap(), b"Kaynak 2 Tamamen Farkli Icerik");
}

#[test]
fn test_07_inaccessible_target_disk_fails_safely() {
    let temp_src = tempdir().unwrap();
    let file = temp_src.path().join("Belge.txt");
    fs::write(&file, b"test").unwrap();

    let db = Database::new_in_memory().unwrap();
    let src_id = db.add_source_folder(&temp_src.path().to_string_lossy()).unwrap();
    let mut settings = AppSettings::default();
    // Non-existent invalid path simulation (disconnected drive)
    settings.target_directory = "Z:\\OlmayanSurucu_9999\\Yedek".to_string();

    let sources = vec![SourceFolder {
        id: src_id,
        path: temp_src.path().to_string_lossy().to_string(),
        enabled: true,
        created_at: "2026-01-01".to_string(),
        is_accessible: true,
    }];

    let engine = BackupEngine::new();
    let result = engine.run_backup(&db, &settings, &sources, |_| {});

    assert!(result.is_err(), "Erişilemeyen hedef diskte işlem güvenle durmalı ve hata dönmelidir");
}

#[test]
fn test_08_safe_cancellation() {
    let engine = BackupEngine::new();
    engine.cancel();
    assert!(engine.should_cancel.load(std::sync::atomic::Ordering::SeqCst));
}

#[test]
fn test_09_db_persistence_across_sessions() {
    let db_dir = tempdir().unwrap();
    let db_file = db_dir.path().join("test.db");

    // Session 1: create db and insert folder
    {
        let db1 = Database::new(&db_file).unwrap();
        db1.add_source_folder("C:\\TestKlasor").unwrap();
    }

    // Session 2: reopen db and verify data preserved
    {
        let db2 = Database::new(&db_file).unwrap();
        let folders = db2.get_source_folders().unwrap();
        assert_eq!(folders.len(), 1);
        assert_eq!(folders[0].path, "C:\\TestKlasor");
    }
}

#[test]
fn test_10_target_inside_source_security_check() {
    let sources = vec![SourceFolder {
        id: 1,
        path: "C:\\Belgelerim".to_string(),
        enabled: true,
        created_at: "2026-01-01".to_string(),
        is_accessible: true,
    }];

    // Target inside source should error
    let res = BackupEngine::validate_paths(&sources, "C:\\Belgelerim\\Yedekler");
    assert!(res.is_err(), "Hedef kaynak içinde olamaz");
}

#[test]
fn test_11_multiple_folders_scanned_together() {
    let temp_src1 = tempdir().unwrap();
    let temp_src2 = tempdir().unwrap();
    let temp_target = tempdir().unwrap();

    fs::write(temp_src1.path().join("f1.txt"), b"1").unwrap();
    fs::write(temp_src2.path().join("f2.txt"), b"2").unwrap();

    let db = Database::new_in_memory().unwrap();
    let src1_id = db.add_source_folder(&temp_src1.path().to_string_lossy()).unwrap();
    let src2_id = db.add_source_folder(&temp_src2.path().to_string_lossy()).unwrap();

    let mut settings = AppSettings::default();
    settings.target_directory = temp_target.path().to_string_lossy().to_string();

    let sources = vec![
        SourceFolder {
            id: src1_id,
            path: temp_src1.path().to_string_lossy().to_string(),
            enabled: true,
            created_at: "2026-01-01".to_string(),
            is_accessible: true,
        },
        SourceFolder {
            id: src2_id,
            path: temp_src2.path().to_string_lossy().to_string(),
            enabled: true,
            created_at: "2026-01-01".to_string(),
            is_accessible: true,
        },
    ];

    let engine = BackupEngine::new();
    let res = engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();
    assert_eq!(res.copied_files, 2);
}

#[test]
fn test_12_restore_previous_version() {
    let temp_src = tempdir().unwrap();
    let temp_target = tempdir().unwrap();
    let temp_restore_dir = tempdir().unwrap();

    let file = temp_src.path().join("Sozlesme.pdf");
    fs::write(&file, b"Surum 1 Ilk Metin").unwrap();

    let db = Database::new_in_memory().unwrap();
    let src_id = db.add_source_folder(&temp_src.path().to_string_lossy()).unwrap();
    let mut settings = AppSettings::default();
    settings.target_directory = temp_target.path().to_string_lossy().to_string();

    let sources = vec![SourceFolder {
        id: src_id,
        path: temp_src.path().to_string_lossy().to_string(),
        enabled: true,
        created_at: "2026-01-01".to_string(),
        is_accessible: true,
    }];

    let engine = BackupEngine::new();
    engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();

    // Create version 2 with different content
    std::thread::sleep(Duration::from_millis(1100));
    fs::write(&file, b"Surum 2 Degistirilmis Metin").unwrap();
    engine.run_backup(&db, &settings, &sources, |_| {}).unwrap();

    // Query versions
    let versions = db.get_all_file_versions().unwrap();
    assert!(versions.len() >= 2, "En az 2 sürüm bulunmalı, bulunan: {}", versions.len());

    let v1 = versions.iter().find(|v| v.version_number == 1).expect("Sürüm 1 bulunmalı");

    let restore_path = temp_restore_dir.path().join("Kurtarilan_Sozlesme_v1.pdf");
    let req = RestoreRequest {
        version_id: v1.id,
        destination_path: restore_path.to_string_lossy().to_string(),
        overwrite: true,
    };

    let result = BackupEngine::restore_version(&db, &req).unwrap();
    assert!(result.success);
    assert!(restore_path.exists());
    assert_eq!(fs::read(&restore_path).unwrap(), b"Surum 1 Ilk Metin");
}
