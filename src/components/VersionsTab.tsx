import React, { useState } from 'react';
import {
  History,
  Search,
  RotateCcw,
  FileText,
  Calendar,
  HardDrive,
  Copy,
  Check,
} from 'lucide-react';
import { FileVersion } from '../types';

interface VersionsTabProps {
  versions: FileVersion[];
  onOpenRestoreModal: (version: FileVersion) => void;
}

export const VersionsTab: React.FC<VersionsTabProps> = ({
  versions,
  onOpenRestoreModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileFilter, setSelectedFileFilter] = useState<string>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Unique file names list for quick filtering
  const uniqueFiles = Array.from(new Set(versions.map(v => v.file_name)));

  const filteredVersions = versions.filter(v => {
    const matchesSearch =
      v.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.source_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.sha256_hash && v.sha256_hash.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFile =
      selectedFileFilter === 'all' || v.file_name === selectedFileFilter;

    return matchesSearch && matchesFile;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Sürüm Geçmişi ve Geri Yükleme</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Değiştirilen tüm belgelerin önceki versiyonları hedeften bağımsız olarak saklanır. İstediğiniz tarihi kurtarabilirsiniz.
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Toplam {versions.length} kayıtlı sürüm
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Dosya adı, kaynak yolu veya SHA-256 ile ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs text-slate-500 whitespace-nowrap">Dosya Filtresi:</label>
            <select
              value={selectedFileFilter}
              onChange={e => setSelectedFileFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="all">Tüm Dosyalar ({uniqueFiles.length})</option>
              {uniqueFiles.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Versions List */}
      <div className="space-y-3">
        {filteredVersions.map(ver => (
          <div
            key={ver.id}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-900 transition-colors shadow-xs"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {ver.file_name}
                    </span>
                    <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      Sürüm #{ver.version_number}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                      {formatBytes(ver.file_size)}
                    </span>
                  </div>

                  <div className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">
                    Kaynak: {ver.source_path}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 flex-wrap pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Yedekleme: {ver.backup_time}</span>
                    </span>
                    <span>·</span>
                    <span>Son Değiştirilme: {ver.modified_time}</span>
                    {ver.sha256_hash && (
                      <>
                        <span>·</span>
                        <button
                          onClick={() => handleCopyHash(ver.sha256_hash!)}
                          className="flex items-center gap-1 font-mono hover:text-indigo-500 transition-colors"
                          title="SHA-256 Hash Kopyala"
                        >
                          <HardDrive className="w-3 h-3" />
                          <span>SHA-256: {ver.sha256_hash.substring(0, 10)}...</span>
                          {copiedHash === ver.sha256_hash ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button: Safe Restore */}
              <div className="shrink-0 flex md:flex-col items-end justify-between md:justify-center">
                <button
                  onClick={() => onOpenRestoreModal(ver)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Bu Sürümü Geri Yükle</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredVersions.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
            Arama kriterine uygun yedeklenmiş dosya sürümü bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
};
