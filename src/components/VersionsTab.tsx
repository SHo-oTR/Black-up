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
  Trash2,
  Sparkles,
  AlertTriangle,
  Folder,
  Layers,
} from 'lucide-react';
import { FileVersion } from '../types';

interface VersionsTabProps {
  versions: FileVersion[];
  onOpenRestoreModal: (version: FileVersion) => void;
  onDeleteVersion?: (id: number) => Promise<void>;
  onClearAllVersions?: () => Promise<void>;
  onCleanOldVersions?: () => Promise<void>;
}

export const VersionsTab: React.FC<VersionsTabProps> = ({
  versions,
  onOpenRestoreModal,
  onDeleteVersion,
  onClearAllVersions,
  onCleanOldVersions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileFilter, setSelectedFileFilter] = useState<string>('all');
  const [versionTypeFilter, setVersionTypeFilter] = useState<'all' | 'latest' | 'old'>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showPruneConfirm, setShowPruneConfirm] = useState(false);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Determine highest version number for each file to distinguish latest vs old
  const highestVersionPerFile = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const v of versions) {
      const key = v.source_path || v.file_name;
      const current = map.get(key) || 0;
      if (v.version_number > current) {
        map.set(key, v.version_number);
      }
    }
    return map;
  }, [versions]);

  // Unique file names list for quick filtering
  const uniqueFiles = Array.from(new Set(versions.map(v => v.file_name)));

  // Calculate stats
  const totalVersions = versions.length;
  const oldVersionsCount = versions.filter(v => {
    const key = v.source_path || v.file_name;
    const maxV = highestVersionPerFile.get(key) || 1;
    return v.version_number < maxV;
  }).length;

  const filteredVersions = versions.filter(v => {
    const matchesSearch =
      v.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.source_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.backup_file_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.sha256_hash && v.sha256_hash.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFile =
      selectedFileFilter === 'all' || v.file_name === selectedFileFilter;

    const key = v.source_path || v.file_name;
    const isLatest = v.version_number === (highestVersionPerFile.get(key) || 1);
    const matchesType =
      versionTypeFilter === 'all' ||
      (versionTypeFilter === 'latest' && isLatest) ||
      (versionTypeFilter === 'old' && !isLatest);

    return matchesSearch && matchesFile && matchesType;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const showNotice = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleDeleteSingle = async (id: number) => {
    if (!onDeleteVersion) return;
    setIsProcessing(true);
    try {
      await onDeleteVersion(id);
      showNotice('Sürüm kaydı başarıyla silindi.');
      setDeleteConfirmId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCleanOld = async () => {
    if (!onCleanOldVersions) return;
    setIsProcessing(true);
    try {
      await onCleanOldVersions();
      showNotice('Eski sürüm kayıtları temizlendi, güncel sürümler korundu.');
      setShowPruneConfirm(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = async () => {
    if (!onClearAllVersions) return;
    setIsProcessing(true);
    try {
      await onClearAllVersions();
      showNotice('Tüm sürüm kayıtları başarıyla temizlendi.');
      setShowClearAllConfirm(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with Title and Cleanup Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Sürüm Geçmişi ve Geri Yükleme</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Yedeklenen dosyaların tüm sürümleri listelenir. Eski veya gereksiz kayıtları dilediğiniz gibi temizleyebilir, istediğiniz sürümü geri yükleyebilirsiniz.
          </p>
        </div>

        {/* Cleaning Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPruneConfirm(true)}
            disabled={isProcessing || oldVersionsCount === 0}
            title="Her dosyanın yalnızca en son güncel sürümünü saklar, eski ara kayıtları temizler"
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Eski Sürümleri Temizle ({oldVersionsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearAllConfirm(true)}
            disabled={isProcessing || totalVersions === 0}
            title="Tüm sürüm geçmişi kayıtlarını tamamen sıfırlar"
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tümünü Temizle</span>
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Confirmation Modal: Prune Old */}
      {showPruneConfirm && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/90 dark:bg-amber-950/60 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-amber-900 dark:text-amber-200">
                Eski Sürüm Kayıtları Temizlensin mi?
              </div>
              <div className="text-amber-700 dark:text-amber-300">
                Bu işlem, mevcut dosyaların en son güncel sürümünü korur; geriye dönük {oldVersionsCount} adet eski geçmiş kaydını temizler.
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowPruneConfirm(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleCleanOld}
              disabled={isProcessing}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs"
            >
              Evet, Eski Sürümleri Temizle
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear All */}
      {showClearAllConfirm && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-50/90 dark:bg-rose-950/60 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-rose-900 dark:text-rose-200">
                Tüm Sürüm Geçmişi Temizlensin mi?
              </div>
              <div className="text-rose-700 dark:text-rose-300">
                Toplam {totalVersions} adet sürüm kaydı veritabanından tamamen silinecektir. Bu işlem geri alınamaz.
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowClearAllConfirm(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isProcessing}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
            >
              Evet, Tümünü Temizle
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Dosya adı, kaynak yolu, hedef veya SHA-256 ile ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Version Type Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setVersionTypeFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  versionTypeFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Tümü ({totalVersions})
              </button>
              <button
                type="button"
                onClick={() => setVersionTypeFilter('latest')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  versionTypeFilter === 'latest'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Günceller ({totalVersions - oldVersionsCount})
              </button>
              <button
                type="button"
                onClick={() => setVersionTypeFilter('old')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  versionTypeFilter === 'old'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Eskiler ({oldVersionsCount})
              </button>
            </div>

            {/* File Dropdown Filter */}
            <select
              value={selectedFileFilter}
              onChange={e => setSelectedFileFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="all">Tüm Belgeler ({uniqueFiles.length})</option>
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
        {filteredVersions.map(ver => {
          const key = ver.source_path || ver.file_name;
          const maxV = highestVersionPerFile.get(key) || 1;
          const isLatest = ver.version_number === maxV;

          return (
            <div
              key={ver.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-900 transition-colors shadow-xs"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                    isLatest
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400'
                  }`}>
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
                      {isLatest ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          En Güncel
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          Eski Sürüm
                        </span>
                      )}
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                        {formatBytes(ver.file_size)}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">
                      Kaynak: {ver.source_path}
                    </div>

                    <div className="font-mono text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-xl flex items-center gap-1">
                      <Folder className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Yedek Dosyası: {ver.backup_file_path}</span>
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
                            type="button"
                            onClick={() => handleCopyHash(ver.sha256_hash!)}
                            className="flex items-center gap-1 font-mono hover:text-indigo-500 transition-colors cursor-pointer"
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

                {/* Action Buttons: Restore and Delete Single */}
                <div className="shrink-0 flex items-center gap-2 md:flex-col md:items-end justify-between md:justify-center pt-2 md:pt-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenRestoreModal(ver)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Geri Yükle</span>
                    </button>

                    {deleteConfirmId === ver.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in">
                        <button
                          type="button"
                          onClick={() => handleDeleteSingle(ver.id)}
                          className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                          title="Silmeyi Onayla"
                        >
                          Onayla
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(ver.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Bu sürüm kaydını sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredVersions.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
            Arama kriterine uygun yedeklenmiş dosya sürümü bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
};
