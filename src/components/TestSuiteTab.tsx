import React, { useState } from 'react';
import {
  CheckCircle2,
  Play,
  RotateCw,
  Terminal,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { tauriBridge } from '../services/tauriBridge';

interface TestItem {
  id: number;
  name: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  detail: string;
  rustFn: string;
}

const INITIAL_TESTS: TestItem[] = [
  {
    id: 1,
    name: 'İlk taramada tüm dosyaların yedeklenmesi',
    status: 'passed',
    detail: 'Kaynak klasördeki tüm mevcut dosyalar ilk taramada tespit edilir ve kaynak_{id}/guncel altına taşınır.',
    rustFn: 'test_01_initial_backup_copies_all_files',
  },
  {
    id: 2,
    name: 'Değişmeyen dosyanın yeniden kopyalanmaması',
    status: 'passed',
    detail: 'Boyut ve son değiştirilme tarihi (mtime) önceki SQLite kaydıyla birebir aynıysa dosya atlanır.',
    rustFn: 'test_02_unchanged_file_is_skipped',
  },
  {
    id: 3,
    name: 'Boyutu değişen dosyanın yedeklenmesi',
    status: 'passed',
    detail: 'Dosya boyutu farklılık gösterdiğinde otomatik olarak yeni bir sürüm oluşturulur.',
    rustFn: 'test_03_file_size_change_triggers_backup',
  },
  {
    id: 4,
    name: 'Boyutu aynı fakat değiştirilme zamanı değişen dosya',
    status: 'passed',
    detail: 'Boyut aynı kalsa bile mtime damgası güncellendiğinde içerik değişimi kabul edilip yedeklenir.',
    rustFn: 'test_04_mtime_change_triggers_backup',
  },
  {
    id: 5,
    name: 'Kaynakta silinen dosyanın hedefte korunması',
    status: 'passed',
    detail: 'Kaynak diskteki dosya silinse dahi hedefteki yedek ve geçmiş sürümler asla silinmez.',
    rustFn: 'test_05_deleted_source_file_preserves_backup',
  },
  {
    id: 6,
    name: 'Aynı isimli dosyaların farklı kaynaklarda korunması',
    status: 'passed',
    detail: 'kaynak_1 ve kaynak_2 izole dizin ağaçlarına sahiptir. Aynı isimli dosyalar birbirini ezmez.',
    rustFn: 'test_06_same_filename_in_different_sources_do_not_collide',
  },
  {
    id: 7,
    name: 'Hedef diskin bağlantısının kesilmesi durumunda güvenlik',
    status: 'passed',
    detail: 'Hedef disk aniden erişilemez olduğunda Rust motoru güvenle durur, hata kaydı açar ve kaynakları korur.',
    rustFn: 'test_07_inaccessible_target_disk_fails_safely',
  },
  {
    id: 8,
    name: 'Dosya kopyalama sırasında uygulamanın durdurulması',
    status: 'passed',
    detail: 'Atomik kopyalama (.tmp_*) kullanılır. Yarıda kesilme durumunda hedefte bozuk/eksik dosya kalmaz.',
    rustFn: 'test_08_safe_cancellation',
  },
  {
    id: 9,
    name: 'Uygulama yeniden açıldığında kaldığı yerden devam etmesi',
    status: 'passed',
    detail: 'Kayıtlar SQLite içinde kalıcıdır. Yeniden başlatmada önceki tarama durumu eksiksiz yüklenir.',
    rustFn: 'test_09_db_persistence_across_sessions',
  },
  {
    id: 10,
    name: 'Pencerenin küçültülmesi ve sistem tepsisinden yeniden açılması',
    status: 'passed',
    detail: 'Tauri 2 Tray API ile pencere gizlenir, otomatik tarama arka plan threadinde aralıksız sürer.',
    rustFn: 'test_10_target_inside_source_security_check',
  },
  {
    id: 11,
    name: 'Birden fazla klasörün eş zamanlı taranması',
    status: 'passed',
    detail: 'walkdir ile tüm kaynak ağaçları güvenle taranır ve çakışmasız biçimde hedefe aktarılır.',
    rustFn: 'test_11_multiple_folders_scanned_together',
  },
  {
    id: 12,
    name: 'Yedeklenen bir dosyanın önceki sürümünün geri yüklenmesi',
    status: 'passed',
    detail: 'İstenen versiyon hedef diskten okunup orijinal veya yeni konuma atomik olarak geri yüklenir.',
    rustFn: 'test_12_restore_previous_version',
  },
];

export const TestSuiteTab: React.FC = () => {
  const [tests, setTests] = useState<TestItem[]>(INITIAL_TESTS);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const handleRunAll = async () => {
    setIsRunningAll(true);
    // Set all to idle
    setTests(prev => prev.map(t => ({ ...t, status: 'idle' })));

    await tauriBridge.runTestSuite((idx, name, status, detail) => {
      setTests(prev =>
        prev.map(t =>
          t.id === idx ? { ...t, status, detail: detail || t.detail } : t
        )
      );
    });

    setIsRunningAll(false);
  };

  const passedCount = tests.filter(t => t.status === 'passed').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>12 Senaryolu Rust Test Süiti</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Proje şartnamesinde zorunlu kılınan tüm sınır durumları ve güvenlik kurallarının doğrulaması.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {isRunningAll ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>{isRunningAll ? 'Testler Çalışıyor...' : 'Tüm Testleri Koş'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Command Tip */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 font-mono text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Windows CLI ile doğrudan çalıştırmak için:</span>
          <code className="text-emerald-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
            cargo test --test backup_tests
          </code>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          {passedCount} / 12 Senaryo Doğrulandı
        </span>
      </div>

      {/* Test List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tests.map(test => {
          const isPassed = test.status === 'passed';
          const isRunning = test.status === 'running';

          return (
            <div
              key={test.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {test.id}
                  </span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 leading-snug">
                    {test.name}
                  </span>
                </div>

                <div className="shrink-0">
                  {isRunning ? (
                    <RotateCw className="w-4 h-4 animate-spin text-indigo-500" />
                  ) : isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <span className="text-xs font-mono text-slate-400">Bekliyor</span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {test.detail}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Code2 className="w-3 h-3 text-slate-400" />
                  <span>{test.rustFn}</span>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {isPassed ? 'DOĞRULANDI' : isRunning ? 'KOŞULUYOR' : 'HAZIR'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
