# Windows 10 & 11 Üzerinde Rust AutoBackup Derleme ve Kurulum Kılavuzu

Bu belge, **Rust AutoBackup** masaüstü uygulamasını yerel bir Windows 10 veya Windows 11 (64 bit) ortamında derlemek, `.exe` üretmek ve yedeklenen dosyaları güvenle geri yüklemek için gerekli tüm adımları içerir.

---

## 1. Sistem Gereksinimleri ve Ön Koşullar

Windows üzerinde Tauri 2 ve Rust derlemesi yapabilmek için aşağıdaki 4 temel bileşenin kurulu olması gerekir:

### A. Microsoft C++ Build Tools
1. [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) indiricisini açın.
2. Kurulum ekranında **"Desktop development with C++"** (C++ ile masaüstü geliştirme) seçeneğini işaretleyin.
3. Windows 10/11 SDK bileşeninin seçili olduğundan emin olun ve kurulumu tamamlayın.

### B. Rust Toolchain (rustup)
1. [rustup.rs](https://rustup.rs/) adresinden `rustup-init.exe` indirip çalıştırın.
2. `1) Proceed with default installation (default)` seçeneğini seçin.
3. PowerShell veya Komut İstemi'ni yeniden açıp doğrulamayı yapın:
   ```cmd
   rustc --version
   cargo --version
   ```

### C. Node.js (v20 veya üzeri)
1. [nodejs.org](https://nodejs.org/) adresinden LTS sürümünü kurun.
2. Doğrulama:
   ```cmd
   node -v
   npm -v
   ```

### D. WebView2 Runtime
- Windows 10 ve 11 işletim sistemlerinde Microsoft Edge WebView2 varsayılan olarak yüklüdür.

---

## 2. Geliştirici Ortamında Çalıştırma (Dev Mode)

Projeyi yerel bilgisayarınızda canlı geliştirme modunda çalıştırmak için:

```cmd
# 1. Proje dizinine girin
cd rust-auto-backup

# 2. Ön yüz bağımlılıklarını kurun
npm install

# 3. Tauri CLI aracını yükleyin (bir defaya mahsus)
cargo install tauri-cli --version "^2.0.0" --locked

# 4. Geliştirme modunu başlatın (React + Rust arka planı birlikte derlenir)
npm run tauri dev
```

---

## 3. Bağımsız Windows EXE ve NSIS Kurulum Paketi Üretimi

Üretim sürümünü (optimize edilmiş, sıkıştırılmış, konsol penceresi açılmayan tek parça Windows programı) derlemek için:

```cmd
cargo tauri build
```

Derleme tamamlandığında çıktılar şu konumlarda hazır olacaktır:

1. **Doğrudan Çalışan Taşınabilir EXE:**
   ```
   src-tauri\target\release\rust-auto-backup.exe
   ```
2. **Windows Kurulum Sihirbazı (NSIS Installer):**
   ```
   src-tauri\target\release\bundle\nsis\Rust AutoBackup_1.0.0_x64-setup.exe
   ```
3. **Kurumsal MSI Paketi (WiX):**
   ```
   src-tauri\target\release\bundle\msi\Rust AutoBackup_1.0.0_x64_tr-TR.msi
   ```

---

## 4. GitHub Actions ile Bulutta Windows EXE Üretme

Yerel bilgisayarınızda C++ derleyicisi kurmak istemiyorsanız, projede yer alan `.github/workflows/build-windows.yml` dosyası sayesinde:

1. Kodu GitHub deponuza `git push` yapın.
2. GitHub deponuzdaki **Actions** sekmesine gidin.
3. Otomatik olarak bir Windows sanal makinesinde derleme başlayacak ve bittiğinde **Artifacts** kısmından `RustAutoBackup-setup.exe` dosyasını tek tıkla indirebileceksiniz.

---

## 5. Testlerin Çalıştırılması (12 Senaryo)

Şartnamede belirtilen 12 güvenlik ve dayanıklılık senaryosunu komut satırından doğrulamak için:

```cmd
cd src-tauri
cargo test --test backup_tests
```

Test çıktısında tüm senaryoların (`test_01` ... `test_12`) yeşil **ok** aldığını göreceksiniz.

---

## 6. Yedeklerin Disk Yapısı ve Geri Yükleme Rehberi

### Disk Hiyerarşisi:
Uygulama, hedef klasörde dosyaları kaynak ID'lerine göre çakışmasız izole eder:

```
D:\Kurumsal_Yedekler\
  ├── kaynak_1\
  │   ├── guncel\
  │   │   ├── Mali_Tablolar_2026.xlsx
  │   │   └── Musteri_Sozlesmeleri.pdf
  │   └── surumler\
  │       ├── Mali_Tablolar_2026.xlsx_20260310_093500.bak
  │       └── Mali_Tablolar_2026.xlsx_20260312_114000.bak
  └── kaynak_2\
      ├── guncel\
      │   └── muhasebe_2026.sqlite
      └── surumler\
          └── muhasebe_2026.sqlite_20260312_090000.bak
```

### Geri Yükleme Yöntemleri:

#### Yöntem 1: Arayüz Üzerinden Güvenli Geri Yükleme (Önerilen)
1. Sol menüden **"Sürüm & Geri Yükleme"** sekmesine geçin.
2. Kurtarmak istediğiniz dosyayı ve ilgili tarihli sürümü seçin.
3. **"Bu Sürümü Geri Yükle"** butonuna basın.
4. Açılan modal pencerede:
   - *Orijinal konuma* veya *Farklı bir klasöre* geri yükleme seçeneğini belirleyin.
   - Dosya üzerine yazma onay kutusunu işaretleyin.
5. Rust motoru, atomik kopyalama ve hash doğrulaması ile dosyayı kurtarır.

#### Yöntem 2: Manuel Geri Yükleme (Acil Durum)
Uygulama kapalı olsa dahi hedef diskteki dosyalar standart, şifrelenmemiş dosya formatında korunur:
- Güncel kopyalar `kaynak_{id}\guncel\` klasöründen doğrudan kopyalanabilir.
- Geçmiş kopyalar `kaynak_{id}\surumler\` klasöründeki `.bak` uzantılı dosyanın adı düzeltilerek (örn. `Mali_Tablolar_2026.xlsx_*.bak` -> `Mali_Tablolar_2026.xlsx`) herhangi bir programa ihtiyaç duymadan geri alınabilir.

---

## 7. SQLite Veritabanı ve Günlüklerin İncelenmesi

Uygulamanın ayarları, taranan dosya metadata'sı ve işlem logları Windows kullanıcı profilinizde saklanır:
```
%APPDATA%\RustAutoBackup\autobackup.db
```
Bu dosya ücretsiz **DB Browser for SQLite** programı ile açılıp sorgulanabilir.
