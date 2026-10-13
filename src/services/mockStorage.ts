import {
  AppSettings,
  BackupLog,
  DashboardStats,
  FileVersion,
  RestoreRequest,
  RestoreResult,
  SourceFolder,
} from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'rust_autobackup_settings',
  SOURCES: 'rust_autobackup_sources',
  LOGS: 'rust_autobackup_logs',
  VERSIONS: 'rust_autobackup_versions',
  STATS: 'rust_autobackup_stats',
};

const DEFAULT_SETTINGS: AppSettings = {
  target_directory: 'D:\\Kurumsal_Yedekler',
  scan_interval_minutes: 5,
  auto_start_active: true,
  verify_checksum: true,
  max_versions_per_file: 10,
  theme: 'dark',
  run_on_windows_startup: true,
  minimize_to_tray: true,
};

const INITIAL_SOURCES: SourceFolder[] = [
  {
    id: 1,
    path: 'C:\\Sirket_Belgeleri',
    enabled: true,
    created_at: '2026-03-10 09:30:00',
    is_accessible: true,
  },
  {
    id: 2,
    path: 'C:\\Mali_Isler_Veritabani',
    enabled: true,
    created_at: '2026-03-11 14:15:00',
    is_accessible: true,
  },
  {
    id: 3,
    path: 'C:\\Yazilim_Projeleri',
    enabled: true,
    created_at: '2026-03-12 11:20:00',
    is_accessible: true,
  },
];

const INITIAL_LOGS: BackupLog[] = [
  {
    id: 1,
    timestamp: '2026-03-13 10:00:00',
    level: 'INFO',
    source_path: null,
    message: 'Rust AutoBackup hizmeti başlatıldı. Arka plan zamanlayıcısı devrede.',
  },
  {
    id: 2,
    timestamp: '2026-03-13 10:00:05',
    level: 'SUCCESS',
    source_path: 'C:\\Sirket_Belgeleri\\Mali_Tablolar_2026.xlsx',
    message: 'Dosya başarıyla yedeklendi [İlk tarama]: Mali_Tablolar_2026.xlsx',
  },
  {
    id: 3,
    timestamp: '2026-03-13 10:00:07',
    level: 'SUCCESS',
    source_path: 'C:\\Sirket_Belgeleri\\Musteri_Sozlesmeleri.pdf',
    message: 'Dosya başarıyla yedeklendi [İlk tarama]: Musteri_Sozlesmeleri.pdf',
  },
  {
    id: 4,
    timestamp: '2026-03-13 10:00:10',
    level: 'SUCCESS',
    source_path: 'C:\\Mali_Isler_Veritabani\\muhasebe_2026.sqlite',
    message: 'Dosya başarıyla yedeklendi [İlk tarama]: muhasebe_2026.sqlite',
  },
  {
    id: 5,
    timestamp: '2026-03-13 10:00:12',
    level: 'SUCCESS',
    source_path: null,
    message: 'Yedekleme tamamlandı. Taranan: 18, Kopyalanan: 3, Değişmeyen/Atlanan: 15, Hata: 0',
  },
];

const INITIAL_VERSIONS: FileVersion[] = [
  {
    id: 1,
    file_record_id: 101,
    file_name: 'Mali_Tablolar_2026.xlsx',
    source_path: 'C:\\Sirket_Belgeleri\\Mali_Tablolar_2026.xlsx',
    relative_path: 'Mali_Tablolar_2026.xlsx',
    version_number: 1,
    backup_file_path: 'D:\\Kurumsal_Yedekler\\Sirket_Belgeleri\\surumler\\Mali_Tablolar_2026_20260310_093500.bak',
    file_size: 485120,
    modified_time: '2026-03-10 09:30:00',
    backup_time: '2026-03-10 09:35:00',
    sha256_hash: '3f786850e387550fdab836ed7e6dc881de23001b70e87038c0136221509b380d',
  },
  {
    id: 2,
    file_record_id: 101,
    file_name: 'Mali_Tablolar_2026.xlsx',
    source_path: 'C:\\Sirket_Belgeleri\\Mali_Tablolar_2026.xlsx',
    relative_path: 'Mali_Tablolar_2026.xlsx',
    version_number: 2,
    backup_file_path: 'D:\\Kurumsal_Yedekler\\Sirket_Belgeleri\\surumler\\Mali_Tablolar_2026_20260312_114000.bak',
    file_size: 512400,
    modified_time: '2026-03-12 11:38:00',
    backup_time: '2026-03-12 11:40:00',
    sha256_hash: '6a4e8d35cf8e29a99ef871b681498b671a53b52d9a6f376f87455a3036643bf7',
  },
  {
    id: 3,
    file_record_id: 102,
    file_name: 'Musteri_Sozlesmeleri.pdf',
    source_path: 'C:\\Sirket_Belgeleri\\Musteri_Sozlesmeleri.pdf',
    relative_path: 'Musteri_Sozlesmeleri.pdf',
    version_number: 1,
    backup_file_path: 'D:\\Kurumsal_Yedekler\\Sirket_Belgeleri\\surumler\\Musteri_Sozlesmeleri_20260311_150000.bak',
    file_size: 1420500,
    modified_time: '2026-03-11 14:50:00',
    backup_time: '2026-03-11 15:00:00',
    sha256_hash: 'c89b7c8df295f70a1a8df9e80d256875d9e5642a8b30e3860bb775796a56b694',
  },
  {
    id: 4,
    file_record_id: 103,
    file_name: 'muhasebe_2026.sqlite',
    source_path: 'C:\\Mali_Isler_Veritabani\\muhasebe_2026.sqlite',
    relative_path: 'muhasebe_2026.sqlite',
    version_number: 1,
    backup_file_path: 'D:\\Kurumsal_Yedekler\\Mali_Isler_Veritabani\\surumler\\muhasebe_2026_20260312_090000.bak',
    file_size: 8421000,
    modified_time: '2026-03-12 08:50:00',
    backup_time: '2026-03-12 09:00:00',
    sha256_hash: '9e7b34b67d53f8a00632a67a80b067f9d8544f128c79c88beea917ac3ab8a556',
  },
  {
    id: 5,
    file_record_id: 103,
    file_name: 'muhasebe_2026.sqlite',
    source_path: 'C:\\Mali_Isler_Veritabani\\muhasebe_2026.sqlite',
    relative_path: 'muhasebe_2026.sqlite',
    version_number: 2,
    backup_file_path: 'D:\\Kurumsal_Yedekler\\Mali_Isler_Veritabani\\surumler\\muhasebe_2026_20260313_095500.bak',
    file_size: 8940000,
    modified_time: '2026-03-13 09:50:00',
    backup_time: '2026-03-13 09:55:00',
    sha256_hash: 'd41d8cd98f00b204e9800998ecf8427e0a811a2f64f4340788647a505b229774',
  },
];

class MockStorageService {
  private isScanning = false;
  private cancelFlag = false;

  getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(raw);
  }

  saveSettings(s: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(s));
  }

  getSourceFolders(): SourceFolder[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SOURCES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(INITIAL_SOURCES));
      return INITIAL_SOURCES;
    }
    return JSON.parse(raw);
  }

  addSourceFolder(path: string): number {
    const clean = path.trim();
    if (!clean) throw new Error('Klasör yolu boş olamaz.');
    const sources = this.getSourceFolders();
    if (sources.some(s => s.path.toLowerCase() === clean.toLowerCase())) {
      throw new Error('Bu klasör zaten kaynak listesinde ekli.');
    }
    const settings = this.getSettings();
    if (clean.toLowerCase() === settings.target_directory.toLowerCase()) {
      throw new Error('Kaynak klasör hedef klasör ile aynı olamaz!');
    }
    if (settings.target_directory.toLowerCase().startsWith(clean.toLowerCase())) {
      throw new Error('Hedef klasör, bu kaynak klasörün altında yer alamaz!');
    }

    const newId = Date.now();
    const newFolder: SourceFolder = {
      id: newId,
      path: clean,
      enabled: true,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      is_accessible: true,
    };
    sources.push(newFolder);
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
    this.addLog('INFO', clean, `Yeni kaynak klasör eklendi: ${clean}`);
    return newId;
  }

  removeSourceFolder(id: number): void {
    const sources = this.getSourceFolders();
    const target = sources.find(s => s.id === id);
    const filtered = sources.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(filtered));
    if (target) {
      this.addLog('INFO', target.path, `Kaynak klasör kaldırıldı: ${target.path}`);
    }
  }

  clearSourceFolders(): void {
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify([]));
    this.addLog('WARN', null, 'Tüm kaynak klasörler temizlendi.');
  }

  getLogs(): BackupLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(raw);
  }

  addLog(level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR', source_path: string | null, message: string): void {
    const logs = this.getLogs();
    const newLog: BackupLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      level,
      source_path,
      message,
    };
    logs.unshift(newLog);
    if (logs.length > 500) logs.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  clearLogs(): void {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  }

  getFileVersions(): FileVersion[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VERSIONS);
    let list: FileVersion[] = [];
    if (!raw) {
      list = INITIAL_VERSIONS;
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_VERSIONS;
      }
    }
    // Sanitize any legacy 'kaynak_' names from previously saved sessions
    let modified = false;
    list = list.map(v => {
      let bPath = v.backup_file_path;
      let sPath = v.source_path;
      if (bPath && /kaynak_\d+/i.test(bPath)) {
        bPath = bPath.replace(/kaynak_1/gi, 'Sirket_Belgeleri').replace(/kaynak_2/gi, 'Mali_Isler_Veritabani').replace(/kaynak_\d+/gi, 'Belgeler');
        modified = true;
      }
      if (sPath && /Kaynak_\d+/i.test(sPath)) {
        sPath = sPath.replace(/Kaynak_1/gi, 'Sirket_Belgeleri').replace(/Kaynak_2/gi, 'Mali_Isler_Veritabani').replace(/Kaynak_\d+/gi, 'Belgeler');
        modified = true;
      }
      return { ...v, backup_file_path: bPath, source_path: sPath };
    });
    if (modified || !raw) {
      localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(list));
    }
    return list;
  }

  deleteVersion(id: number): void {
    const versions = this.getFileVersions();
    const target = versions.find(v => v.id === id);
    const filtered = versions.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(filtered));
    if (target) {
      this.addLog('INFO', target.source_path, `Sürüm kaydı silindi: ${target.file_name} (Sürüm #${target.version_number})`);
    }
  }

  clearAllVersions(): void {
    const count = this.getFileVersions().length;
    localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify([]));
    this.addLog('WARN', null, `Tüm sürüm kayıtları temizlendi (${count} adet kayıt silindi).`);
  }

  cleanOldVersions(keepLastPerFile = 1): number {
    const versions = this.getFileVersions();
    // Group by file_name or relative_path
    const map = new Map<string, FileVersion[]>();
    for (const v of versions) {
      const key = v.source_path || v.file_name;
      const group = map.get(key) || [];
      group.push(v);
      map.set(key, group);
    }

    const toKeep: FileVersion[] = [];
    let removedCount = 0;

    for (const [, group] of map.entries()) {
      // Sort by version_number descending or backup_time descending
      group.sort((a, b) => b.version_number - a.version_number);
      const kept = group.slice(0, keepLastPerFile);
      const removed = group.slice(keepLastPerFile);
      removedCount += removed.length;
      toKeep.push(...kept);
    }

    // Sort kept versions by backup_time descending
    toKeep.sort((a, b) => (b.backup_time > a.backup_time ? 1 : -1));
    localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(toKeep));
    this.addLog(
      'INFO',
      null,
      `Eski sürümler temizlendi: ${removedCount} eski sürüm kaydı kaldırıldı, güncel sürümler korundu.`
    );
    return removedCount;
  }

  getDashboardStats(): DashboardStats {
    const settings = this.getSettings();
    const versions = this.getFileVersions();
    const logs = this.getLogs();
    const errorCount = logs.filter(l => l.level === 'ERROR').length;
    const lastScanLog = logs.find(l => l.message.includes('tamamlandı'));

    const totalBytes = versions.reduce((sum, v) => sum + v.file_size, 0);

    return {
      last_scan_time: lastScanLog ? lastScanLog.timestamp : '2026-03-13 10:00:12',
      next_scan_in_seconds: settings.auto_start_active ? settings.scan_interval_minutes * 60 : 0,
      total_backed_up_files: versions.length,
      total_backed_up_bytes: totalBytes,
      pending_changes: 0,
      error_count: errorCount,
      is_running: settings.auto_start_active,
      is_scanning: this.isScanning,
      active_file_path: null,
      progress_percent: 0,
      target_disk_free_gb: 348.6,
      target_disk_total_gb: 1024.0,
      target_accessible: true,
    };
  }

  async runBackupSimulation(onProgress?: (progress: {
    total: number;
    processed: number;
    copied: number;
    skipped: number;
    errors: number;
    current: string;
    percent: number;
  }) => void): Promise<void> {
    if (this.isScanning) throw new Error('Zaten çalışan bir yedekleme var.');
    this.isScanning = true;
    this.cancelFlag = false;

    const sources = this.getSourceFolders().filter(s => s.enabled);
    const settings = this.getSettings();

    this.addLog('INFO', null, 'Manuel / periyodik yedekleme işlemi başlatıldı.');

    const mockFiles = [
      { source_id: 1, rel: 'Finansal_Raporlar_Q1.xlsx', size: 340200 },
      { source_id: 1, rel: 'Yonetim_Kurulu_Kararlari.docx', size: 124500 },
      { source_id: 2, rel: 'Cari_Hesaplar_2026.db', size: 4500000 },
      { source_id: 3, rel: 'backend/src/main.rs', size: 14200 },
      { source_id: 3, rel: 'frontend/src/App.tsx', size: 28400 },
      { source_id: 1, rel: 'Musteri_Sozlesmeleri.pdf', size: 1420500 },
    ];

    const total = mockFiles.length;
    let copied = 0;
    let skipped = 0;

    for (let i = 0; i < total; i++) {
      if (this.cancelFlag) {
        this.addLog('WARN', null, 'Yedekleme işlemi kullanıcı tarafından güvenle durduruldu.');
        break;
      }

      const file = mockFiles[i];
      const percent = Math.round(((i + 1) / total) * 100);

      if (onProgress) {
        onProgress({
          total,
          processed: i + 1,
          copied,
          skipped,
          errors: 0,
          current: file.rel,
          percent,
        });
      }

      // Small async delay to show smooth real-time progress
      await new Promise(r => setTimeout(r, 350));

      const isNewOrChanged = i % 2 === 0;
      if (isNewOrChanged) {
        copied++;
        // Add new version with real folder and file names
        const sourceFolder = sources.find(s => s.id === file.source_id) || sources[0];
        const sourceBase = sourceFolder ? sourceFolder.path : 'C:\\Sirket_Belgeleri';
        const folderName = sourceBase.split(/[/\\]/).filter(Boolean).pop() || 'Belgeler';
        const fileName = file.rel.split(/[/\\]/).pop() || file.rel;

        const versions = this.getFileVersions();
        const nextId = Date.now() + i;
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const existingForThisFile = versions.filter(v => v.file_name === fileName);
        const versionNumber = existingForThisFile.length + 1;

        const timeSuffix = nowStr.replace(/[- :]/g, '').slice(0, 14);
        const newVersion: FileVersion = {
          id: nextId,
          file_record_id: 200 + i,
          file_name: fileName,
          source_path: `${sourceBase}\\${file.rel.replace(/\//g, '\\')}`,
          relative_path: file.rel,
          version_number: versionNumber,
          backup_file_path: `${settings.target_directory}\\${folderName}\\surumler\\${fileName}_${timeSuffix}.bak`,
          file_size: file.size,
          modified_time: nowStr,
          backup_time: nowStr,
          sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        };
        versions.unshift(newVersion);
        localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(versions));
        this.addLog('SUCCESS', newVersion.source_path, `Dosya başarıyla yedeklendi [${folderName}]: ${fileName}`);
      } else {
        skipped++;
      }
    }

    this.isScanning = false;
    this.addLog('SUCCESS', null, `Yedekleme tamamlandı. Taranan: ${total}, Kopyalanan: ${copied}, Değişmeyen/Atlanan: ${skipped}, Hata: 0`);
  }

  cancelBackup(): void {
    this.cancelFlag = true;
    this.isScanning = false;
  }

  restoreVersion(req: RestoreRequest): RestoreResult {
    const versions = this.getFileVersions();
    const ver = versions.find(v => v.id === req.version_id);
    if (!ver) {
      throw new Error('Sürüm kaydı bulunamadı.');
    }

    this.addLog('SUCCESS', req.destination_path, `Sürüm #${ver.version_number} başarıyla geri yüklendi -> ${req.destination_path}`);
    return {
      success: true,
      message: `Sürüm #${ver.version_number} (${ver.file_name}) başarıyla hedefe geri yüklendi.`,
      restored_path: req.destination_path,
    };
  }

  async runFull12TestSuite(onTestUpdate: (idx: number, name: string, status: 'running' | 'passed' | 'failed', detail: string) => void): Promise<void> {
    const tests = [
      { id: 1, name: 'İlk taramada tüm dosyaların yedeklenmesi', detail: 'Tüm mevcut dosyalar tespit edildi ve kaynak_1/guncel altına kopyalandı.' },
      { id: 2, name: 'Değişmeyen dosyanın yeniden kopyalanmaması', detail: 'Boyut ve mtime aynı olduğundan dosya atlandı, gereksiz I/O engellendi.' },
      { id: 3, name: 'Boyutu değişen dosyanın yedeklenmesi', detail: 'Dosya boyutu değiştiğinde tespit edildi ve yeni sürüm oluşturuldu.' },
      { id: 4, name: 'Boyutu aynı fakat değiştirilme zamanı değişen dosya', detail: 'mtime farkı algılandı, atomik olarak yedeklendi.' },
      { id: 5, name: 'Kaynakta silinen dosyanın hedefte korunması', detail: 'Kaynak dosya silinse dahi hedefteki yedek ve SQLite sürüm kaydı korundu.' },
      { id: 6, name: 'Farklı kaynaklardaki aynı isimli dosyaların çakışmaması', detail: 'kaynak_1 ve kaynak_2 bağımsız klasör ağaçlarında izole saklandı.' },
      { id: 7, name: 'Hedef diskin bağlantısının kesilmesi / hata yönetimi', detail: 'Hedefe ulaşılamadığında hata günlüğe yazıldı ve işlem güvenle durdu.' },
      { id: 8, name: 'Dosya kopyalama sırasında uygulamanın durdurulması', detail: 'Atomik .tmp dosyası kopyalandı, yarıda kalma durumunda bozuk dosya oluşmadı.' },
      { id: 9, name: 'Uygulama yeniden açıldığında kaldığı yerden devam etmesi', detail: 'SQLite tablosu önceki durumu tam olarak hatırladı.' },
      { id: 10, name: 'Pencerenin sistem tepsisine küçültülmesi ve arka plan', detail: 'Tauri 2 tray-icon arka planda otomatik zamanlayıcıyı kesintisiz yürüttü.' },
      { id: 11, name: 'Birden fazla klasörün eş zamanlı taranması', detail: 'Tüm kaynaklar walkdir ile tarandı ve tek oturumda konsolide edildi.' },
      { id: 12, name: 'Yedeklenen bir dosyanın önceki sürümünün geri yüklenmesi', detail: 'Seçilen sürüm dosyası teyit edilerek hedef dizine başarıyla geri yüklendi.' },
    ];

    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      onTestUpdate(t.id, t.name, 'running', 'Test senaryosu yürütülüyor...');
      await new Promise(r => setTimeout(r, 400));
      onTestUpdate(t.id, t.name, 'passed', t.detail);
      this.addLog('SUCCESS', null, `Test #${t.id} Başarılı: ${t.name}`);
    }
  }
}

export const mockStorage = new MockStorageService();
