# Rust AutoBackup - Modern Windows Otomatik Dosya Yedekleme Uygulaması

Modern, güvenli, hafif ve kurumsal kullanıma uygun Windows 10/11 masaüstü otomatik yedekleme ve sürüm kontrol uygulaması.

---

## Öne Çıkan Özellikler

- **Rust Destekli Yedekleme Motoru (`src-tauri/src/backup_engine.rs`):**
  - Akıllı değişiklik tespiti: Dosya boyutu ve son değiştirilme tarihi (`mtime`) SQLite kayıtlarıyla karşılaştırılır. Değişmeyen dosyalar tekrar kopyalanmaz.
  - Sürüm korumalı hiyerarşi: Dosya değiştiğinde eski kopyalar asla silinmez; `kaynak_{id}/surumler/` altında zaman damgasıyla saklanır.
  - Atomik dosya kopyalama: `.tmp_*` geçici dosyaya yazılır, boyutu ve hash değeri teyit edildikten sonra nihai hedefe taşınır.
  - Kaynak dosyaların dokunulmazlığı: Kaynak dosyalar hiçbir koşulda değiştirilmez veya silinmez. Kaynakta silinen dosyalar hedefte arşiv olarak korunur.
  - Güvenlik denetimleri: Hedef klasörün kaynak klasörün içinde olması veya aynı olması engellenir.
- **Tauri 2 Native Sistem Tepsisi (Tray Icon):**
  - Pencere küçültüldüğünde veya kapatıldığında uygulama sistem tepsisine geçer.
  - Arka plan iş parçacığı (`tokio / std::thread`) zamanlayıcı ile dakika bazında otomatik taramayı kesintisiz sürdürür.
- **Yerel SQLite Veritabanı (`rusqlite`):**
  - Taranan dosyalar, SHA-256 hash'leri, sürüm geçmişi, sistem ayarları ve olay günlükleri yerel `autobackup.db` içinde saklanır.
- **Modern Arayüz (React 19 + TypeScript + Tailwind CSS + Lucide):**
  - Kurumsal, sade ve responsive Windows masaüstü tasarımı.
  - Açık ve koyu tema desteği.
  - Canlı ilerleme çubuğu, disk kapasitesi göstergesi, filtreli günlükler ve tek tıkla geri yükleme sihirbazı.
  - 12 senaryolu test paneli.

---

## Proje Dizini

```
├── .github/workflows/
│   └── build-windows.yml       # GitHub Actions ile Windows EXE ve MSI derleme iş akışı
├── src-tauri/                   # Rust Backend (Tauri 2)
│   ├── Cargo.toml               # Rust bağımlılıkları (rusqlite, sha2, walkdir, tokio, sysinfo)
│   ├── tauri.conf.json          # Tauri 2 pencere ve sistem tepsisi yapılandırması
│   ├── capabilities/            # Tauri 2 izin matrisi (default.json)
│   ├── src/
│   │   ├── main.rs              # Windows Subsystem giriş noktası
│   │   ├── lib.rs               # Tauri IPC komutları ve arka plan zamanlayıcı döngüsü
│   │   ├── backup_engine.rs     # Akıllı değişiklik algılama ve atomik kopyalama motoru
│   │   ├── db.rs                # SQLite şeması, sorguları ve göçleri
│   │   ├── models.rs            # Rust veri yapıları
│   │   └── tray.rs              # Windows sistem tepsisi menüsü ve olay yönetimi
│   └── tests/
│       └── backup_tests.rs      # Şartnamedeki 12 sınır durumunun Rust birim testleri
├── src/                         # React Frontend
│   ├── components/              # Header, Sidebar, Overview, Settings, Versions, Logs, TestSuite
│   ├── services/
│   │   ├── tauriBridge.ts       # Tauri IPC ve Web simülatörü köprüsü
│   │   └── mockStorage.ts       # Tarayıcı önizleme motoru
│   ├── types/                   # TypeScript arayüzleri
│   ├── App.tsx                  # Ana uygulama düzeni
│   └── main.tsx                 # React giriş noktası
├── WINDOWS_BUILD_GUIDE.md       # Adım adım Windows derleme ve geri yükleme kılavuzu
└── Colab_Build_Script.py        # Google Colab test ve kontrol betiği
```

---

## Hızlı Başlangıç

### Geliştirme Modu:
```bash
npm install
npm run dev
```

### Windows EXE Derleme:
```bash
cargo tauri build
```
Derlenen `.exe` ve `.msi` dosyaları `src-tauri/target/release/` dizininde üretilir. Detaylar için `WINDOWS_BUILD_GUIDE.md` dosyasını inceleyin.
