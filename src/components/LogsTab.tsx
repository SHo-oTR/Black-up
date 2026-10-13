import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { BackupLog } from '../types';

interface LogsTabProps {
  logs: BackupLog[];
  onClearLogs: () => Promise<void>;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs, onClearLogs }) => {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'SUCCESS' | 'INFO' | 'WARN' | 'ERROR'>('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      (log.source_path && log.source_path.toLowerCase().includes(search.toLowerCase())) ||
      log.timestamp.includes(search);
    return matchesLevel && matchesSearch;
  });

  const exportAsTxt = () => {
    const textContent = filteredLogs
      .map(
        l =>
          `[${l.timestamp}] [${l.level}] ${l.source_path ? `(${l.source_path}) ` : ''}${l.message}`
      )
      .join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RustAutoBackup_Gunluk_${new Date().toISOString().substring(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCsv = () => {
    const header = 'Zaman,Seviye,Kaynak Yolu,Mesaj\n';
    const rows = filteredLogs
      .map(
        l =>
          `"${l.timestamp}","${l.level}","${(l.source_path || '').replace(/"/g, '""')}","${l.message.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RustAutoBackup_Gunluk_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>İşlem Geçmişi ve Olay Günlükleri</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            SQLite veritabanında tutulan yedekleme aktiviteleri, hata kayıtları ve zamanlanmış görev raporları.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAsTxt}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>TXT İndir</span>
          </button>
          <button
            onClick={exportAsCsv}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV İndir</span>
          </button>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-300 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Temizle</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Günlük mesajlarında, zaman damgasında veya dosya yolunda ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Level Filter Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-full sm:w-auto shrink-0">
            {(['ALL', 'SUCCESS', 'INFO', 'WARN', 'ERROR'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  levelFilter === lvl
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {lvl === 'ALL'
                  ? 'Tümü'
                  : lvl === 'SUCCESS'
                  ? 'Başarılı'
                  : lvl === 'INFO'
                  ? 'Bilgi'
                  : lvl === 'WARN'
                  ? 'Uyarı'
                  : 'Hata'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-4 font-medium w-36">Zaman</th>
                <th className="py-2.5 px-3 font-medium w-24">Seviye</th>
                <th className="py-2.5 px-3 font-medium w-64">İlgili Dosya / Kaynak</th>
                <th className="py-2.5 px-4 font-medium">İşlem Mesajı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.map(log => {
                const isSuccess = log.level === 'SUCCESS';
                const isError = log.level === 'ERROR';
                const isWarn = log.level === 'WARN';

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        {isError && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                        {isWarn && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        {!isSuccess && !isError && !isWarn && (
                          <Info className="w-3.5 h-3.5 text-indigo-500" />
                        )}
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            isSuccess
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isError
                              ? 'text-rose-600 dark:text-rose-400'
                              : isWarn
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          {log.level}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {log.source_path || 'Sistem Çekirdeği'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-200">
                      {log.message}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    Filtreye uygun olay kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
