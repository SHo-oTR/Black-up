<#
.SYNOPSIS
    Rust AutoBackup - Windows Tek Tıkla Otomatik EXE ve Kurulum Paketi Üreticisi
.DESCRIPTION
    Bu betik Windows 10/11 üzerinde Rust, Node.js ve gerekli derleyicileri kontrol eder,
    projeyi derler ve nihai EXE dosyasını 'dist-release' klasörüne kopyalar.
#>

$ErrorActionPreference = "Stop"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Rust AutoBackup - Windows EXE Derleme Sihirbazı        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Node.js Kontrolü
Write-Host "[1/5] Node.js kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "HATA: Node.js bulunamadı! Lütfen https://nodejs.org adresinden LTS sürümünü kurun." -ForegroundColor Red
    pause
    exit 1
}
$nodeVer = node -v
Write-Host "Node.js bulundu: $nodeVer" -ForegroundColor Green

# 2. Rust & Cargo Kontrolü
Write-Host "[2/5] Rust ve Cargo derleyicisi kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Get-Command "cargo" -ErrorAction SilentlyContinue)) {
    Write-Host "Rust bulunamadı. Otomatik yükleme deneniyor..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "$env:TEMP\rustup-init.exe"
    Start-Process -FilePath "$env:TEMP\rustup-init.exe" -ArgumentList "-y" -Wait
    $env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
}
$cargoVer = cargo --version
Write-Host "Rust bulundu: $cargoVer" -ForegroundColor Green

# 3. Ön yüz paketlerinin hazırlanması
Write-Host "[3/5] Ön yüz bağımlılıkları kuruluyor ve derleniyor..." -ForegroundColor Yellow
npm install
npm run build
Write-Host "Ön yüz derlendi." -ForegroundColor Green

# 4. Tauri CLI kontrolü ve kurulumu
Write-Host "[4/5] Tauri CLI kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Get-Command "cargo-tauri" -ErrorAction SilentlyContinue)) {
    Write-Host "Tauri CLI yükleniyor (bir defalık işlem)..." -ForegroundColor Yellow
    cargo install tauri-cli --version "^2.0.0" --locked
}

# 5. Rust Arka Planı ve Windows EXE Derleme
Write-Host "[5/5] Rust AutoBackup Windows EXE üretiliyor (Optimizasyon: Release)..." -ForegroundColor Yellow
cargo tauri build

# Çıktı Klasörünü Hazırla
$outDir = ".\dist-release"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$exeSource = ".\src-tauri\target\release\rust-auto-backup.exe"
$nsisDir = ".\src-tauri\target\release\bundle\nsis"
$msiDir = ".\src-tauri\target\release\bundle\msi"

if (Test-Path $exeSource) {
    Copy-Item $exeSource -Destination "$outDir\RustAutoBackup.exe" -Force
    Write-Host ""
    Write-Host "TEBRİKLER! Bağımsız çalıştırılabilir EXE üretildi:" -ForegroundColor Green
    Write-Host ">> $outDir\RustAutoBackup.exe" -ForegroundColor White
}

if (Test-Path $nsisDir) {
    Get-ChildItem -Path $nsisDir -Filter "*.exe" | ForEach-Object {
        Copy-Item $_.FullName -Destination "$outDir\RustAutoBackup-Setup.exe" -Force
        Write-Host ">> Kurulum Paketi: $outDir\RustAutoBackup-Setup.exe" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Tüm derleme dosyaları 'dist-release' klasöründe hazır!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
pause
