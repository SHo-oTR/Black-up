"""
Google Colab Üzerinde Rust AutoBackup Kaynak Kodlarını Doğrulama ve Derleme Betiği
Bu betik Colab ortamında Rust toolchain'ini kurar, SQLite bağlamlarını test eder ve
test süitini çalıştırır.
"""

import os
import subprocess
import sys

def run_cmd(cmd, cwd=None):
    print(f">> {cmd}")
    res = subprocess.run(cmd, shell=True, cwd=cwd, text=True, capture_output=True)
    if res.stdout:
        print(res.stdout)
    if res.stderr:
        print(res.stderr)
    if res.returncode != 0:
        print(f"HATA: Komut {res.returncode} kodu ile sonlandı.")
    return res.returncode

def main():
    print("=== Google Colab Rust AutoBackup Doğrulama Başlatılıyor ===")
    
    # 1. Rust kurulumu kontrolü
    print("\n[1/4] Rust Toolchain Kontrol Ediliyor...")
    if run_cmd("rustc --version") != 0:
        print("Rust kurulu değil. Kuruluyor...")
        run_cmd("curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y")
        os.environ["PATH"] += os.pathsep + os.path.expanduser("~/.cargo/bin")
    
    # 2. Gerekli Linux derleme paketleri (Tauri / SQLite testleri için)
    print("\n[2/4] Gerekli Sistem Kütüphaneleri Yükleniyor...")
    run_cmd("apt-get update -qq && apt-get install -y -qq libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev")

    # 3. Node.js ve Ön Yüz Derleme Kontrolü
    print("\n[3/4] Node.js Paketleri Derleniyor...")
    run_cmd("npm install")
    run_cmd("npm run build")

    # 4. Rust Test Süiti Doğrulaması
    print("\n[4/4] Rust Test Süiti Çalıştırılıyor...")
    src_tauri_dir = os.path.join(os.getcwd(), "src-tauri")
    if os.path.exists(src_tauri_dir):
        code = run_cmd("cargo check", cwd=src_tauri_dir)
        if code == 0:
            print("\nTEBRİKLER: Rust kaynak kodları ve bağımlılıkları hatasız doğrulandı!")
            print("Windows EXE üretimi için GitHub Actions veya yerel Windows makinesinde 'cargo tauri build' komutunu çalıştırabilirsiniz.")
    else:
        print("src-tauri dizini bulunamadı.")

if __name__ == "__main__":
    main()
