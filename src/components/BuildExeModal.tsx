import React, { useState } from 'react';
import {
  X,
  FileCode,
  Download,
  Terminal,
  Github,
  CheckCircle2,
  FolderArchive,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';

interface BuildExeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuildExeModal: React.FC<BuildExeModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Windows EXE Dosyası Üretme & İndirme Rehberi
              </h2>
              <p className="text-[11px] text-slate-500">
                Tauri 2 ve Rust ile derlenmiş bağımsız 64-bit Windows EXE ve NSIS kurulum paketi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs overflow-y-auto">
          {/* Method 1: GitHub Actions (No local install needed) */}
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-indigo-950 dark:text-indigo-200">
                <Github className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Yöntem 1: GitHub Actions ile Otomatik EXE Üretme (Önerilen)</span>
              </div>
              <span className="text-[10px] font-mono font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded">
                EN KOLAY
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Bilgisayarınızda Visual Studio veya Rust kurulu değilse, projede hazır bulunan <code className="font-mono bg-white/70 dark:bg-black/40 px-1 py-0.5 rounded">.github/workflows/build-windows.yml</code> iş akışı Windows sunucusunda doğrudan <code className="font-mono font-bold">RustAutoBackup-setup.exe</code> üretir.
            </p>

            <div className="space-y-1.5 pt-1 text-[11px] text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Projeyi GitHub deponuza yükleyin (<code className="font-mono text-[10px]">git push</code>).</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>GitHub deposundaki <strong>Actions</strong> sekmesinden derlemeyi izleyin.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Derleme bitince <strong>Artifacts</strong> bölümünden EXE paketini doğrudan indirin.</span>
              </div>
            </div>
          </div>

          {/* Method 2: One-click local script */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Yöntem 2: Windows'ta Tek Tıkla Derleme (build-windows.bat)</span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Proje kök dizinine eklenen <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">build-windows.bat</code> dosyasını Windows bilgisayarınızda çift tıklatarak veya PowerShell ile tek komutta çalıştırabilirsiniz:
            </p>

            <div className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] flex items-center justify-between">
              <code>powershell -ExecutionPolicy Bypass -File build-windows.ps1</code>
              <button
                onClick={() =>
                  copyToClipboard(
                    'powershell -ExecutionPolicy Bypass -File build-windows.ps1',
                    'ps1-cmd'
                  )
                }
                className="p-1 hover:text-indigo-400 text-slate-400 transition-colors"
                title="Komutu Kopyala"
              >
                {copiedCmd === 'ps1-cmd' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Bu betik Node.js ve Rust bağımlılıklarını kurup nihai dosyaları <code className="font-mono">dist-release/RustAutoBackup.exe</code> içerisine kopyalar.
            </p>
          </div>

          {/* Method 3: Standard Cargo Tauri CLI */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Yöntem 3: Doğrudan Komut Satırından Derleme</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] flex items-center justify-between">
              <code>cargo tauri build</code>
              <button
                onClick={() => copyToClipboard('cargo tauri build', 'tauri-cmd')}
                className="p-1 hover:text-indigo-400 text-slate-400 transition-colors"
                title="Komutu Kopyala"
              >
                {copiedCmd === 'tauri-cmd' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>Çıktı konumları:</div>
              <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 pl-2">
                • Bağımsız EXE: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">src-tauri/target/release/rust-auto-backup.exe</code>
              </div>
              <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 pl-2">
                • Kurulum Sihirbazı: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">src-tauri/target/release/bundle/nsis/Rust AutoBackup_1.0.0_x64-setup.exe</code>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <span className="text-[11px] text-slate-400">
            Detaylı adımlar için <code className="font-mono">WINDOWS_BUILD_GUIDE.md</code> dosyasını inceleyebilirsiniz.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
