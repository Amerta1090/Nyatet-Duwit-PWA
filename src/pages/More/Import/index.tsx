import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileSpreadsheet, ArrowLeft, Check, AlertTriangle, ChevronRight } from 'lucide-react';
import { parseCsv, detectColumnMapping, processImport } from '@/utils/importCsv';
import type { CsvRow, ImportMapping, ImportedTransaction } from '@/utils/importCsv';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import type { CreateTransactionInput } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { accountRepo } from '@/db/repositories/accountRepository';
import { tagRepo } from '@/db/repositories/tagRepository';
import { generateId } from '@/utils/id';
import { Button } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { formatCurrency, formatDate } from '@/utils/format';

type Step = 'upload' | 'mapping' | 'preview' | 'done';

const FIELD_LABELS: Record<keyof ImportMapping, string> = {
  date: 'Tanggal',
  type: 'Tipe',
  amount: 'Jumlah',
  category: 'Kategori',
  account: 'Akun',
  notes: 'Catatan',
  tags: 'Tag',
};

export default function ImportPage() {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ImportMapping>({
    date: '', type: '', amount: '', category: '', account: '', notes: '', tags: '',
  });
  const [processed, setProcessed] = useState<{
    valid: ImportedTransaction[];
    errors: { row: number; message: string }[];
    duplicates: { row: number; tx: ImportedTransaction }[];
    unmatchedCategories: string[];
    unmatchedAccounts: string[];
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) {
      showToast('File CSV tidak valid atau kosong', 'error');
      return;
    }
    setCsvRows(rows);
    setHeaders(Object.keys(rows[0]));
    const detected = detectColumnMapping(Object.keys(rows[0]));
    setMapping(detected);
    setStep('mapping');
  }, [showToast]);

  const updateMapping = useCallback((field: keyof ImportMapping, value: string) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePreview = useCallback(async () => {
    const [categories, accounts] = await Promise.all([
      categoryRepo.getAll(),
      accountRepo.getAll(true),
    ]);

    const result = await processImport(csvRows, mapping, categories, accounts);
    setProcessed({
      valid: result.rows,
      errors: result.errors,
      duplicates: result.duplicates,
      unmatchedCategories: result.unmatchedCategories,
      unmatchedAccounts: result.unmatchedAccounts,
    });
    setStep('preview');
  }, [csvRows, mapping]);

  const handleImport = useCallback(async () => {
    if (!processed) return;
    setImporting(true);

    const [categories, accounts, existingTags] = await Promise.all([
      categoryRepo.getAll(),
      accountRepo.getAll(true),
      tagRepo.getAll(),
    ]);

    const catByName = new Map<string, string>();
    for (const c of categories) catByName.set(c.name.toLowerCase(), c.id);

    const accByName = new Map<string, string>();
    for (const a of accounts) accByName.set(a.name.toLowerCase(), a.id);

    const tagByName = new Map<string, string>();
    for (const t of existingTags) tagByName.set(t.name.toLowerCase(), t.id);

    let count = 0;

    for (const tx of processed.valid) {
      const categoryId = catByName.get(tx.categoryName.toLowerCase());
      const accountId = accByName.get(tx.accountName.toLowerCase());
      if (!categoryId || !accountId) continue;

      const tagIds: string[] = [];
      for (const tagName of tx.tags) {
        const key = tagName.trim().toLowerCase();
        if (!key) continue;
        let tagId = tagByName.get(key);
        if (!tagId) {
          tagId = generateId();
          await tagRepo.create({ name: tagName.trim(), color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0') });
          tagByName.set(key, tagId);
        }
        tagIds.push(tagId);
      }

      const input: CreateTransactionInput = {
        type: tx.type,
        amount: tx.amount,
        categoryId,
        accountId,
        date: tx.date,
        notes: tx.notes || undefined,
        tags: tagIds.length > 0 ? tagIds : undefined,
      };

      await transactionRepo.create(input);
      count++;
    }

    setImported(count);
    setImporting(false);
    setStep('done');
    showToast(`Berhasil mengimpor ${count} transaksi`, 'success');
  }, [processed, showToast]);

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30">
          <Check className="h-8 w-8 text-success-500" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Import Selesai</h2>
        <p className="text-sm text-neutral-500">
          {imported} transaksi berhasil diimpor
        </p>
        {processed && processed.errors.length > 0 && (
          <p className="text-xs text-danger-500">{processed.errors.length} baris dilewati karena error</p>
        )}
        {processed && processed.duplicates.length > 0 && (
          <p className="text-xs text-amber-500">{processed.duplicates.length} duplikat dilewati</p>
        )}
        <Button onClick={() => navigate('/more')} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Back button */}
      <button
        onClick={() => step === 'upload' ? navigate('/more') : setStep('upload')}
        className="flex items-center gap-2 text-sm text-neutral-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      {step === 'upload' && (
        <>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Import Transaksi</h2>
          <p className="text-sm text-neutral-500">
            Unggah file CSV untuk mengimpor transaksi. Format yang didukung: CSV dengan kolom Tanggal, Tipe, Jumlah, Kategori, Akun, Catatan, Tag.
          </p>

          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-neutral-300 p-12 transition-colors hover:border-primary-500 dark:border-neutral-600">
            <Upload className="h-8 w-8 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Klik untuk unggah file CSV
            </span>
            <span className="text-xs text-neutral-400">File .csv</span>
            <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
          </label>
        </>
      )}

      {step === 'mapping' && (
        <>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <FileSpreadsheet className="h-4 w-4" />
            {fileName}
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Atur Kolom</h2>
          <p className="text-sm text-neutral-500">
            Cocokkan kolom dari file CSV dengan field di aplikasi.
          </p>

          <div className="flex flex-col gap-3">
            {(Object.keys(FIELD_LABELS) as (keyof ImportMapping)[]).map((field) => (
              <div key={field}>
                <label className="mb-1 block text-xs font-medium text-neutral-500">{FIELD_LABELS[field]}</label>
                <select
                  value={mapping[field]}
                  onChange={(e) => updateMapping(field, e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                >
                  <option value="">-- Pilih kolom --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <Button onClick={handlePreview} className="mt-2">
            Lanjutkan
          </Button>
        </>
      )}

      {step === 'preview' && processed && (
        <>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Pratinjau</h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-success-50 p-3 text-center dark:bg-success-900/20">
              <p className="text-lg font-bold text-success-600 dark:text-success-400">{processed.valid.length}</p>
              <p className="text-xs text-neutral-500">Valid</p>
            </div>
            <div className="rounded-xl bg-danger-50 p-3 text-center dark:bg-danger-900/20">
              <p className="text-lg font-bold text-danger-600 dark:text-danger-400">{processed.errors.length}</p>
              <p className="text-xs text-neutral-500">Error</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-900/20">
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{processed.duplicates.length}</p>
              <p className="text-xs text-neutral-500">Duplikat</p>
            </div>
          </div>

          {processed.unmatchedCategories.length > 0 && (
            <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Kategori tidak dikenal ({processed.unmatchedCategories.length})
              </div>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                {processed.unmatchedCategories.join(', ')} — transaksi dengan kategori ini akan dilewati.
              </p>
            </div>
          )}

          {processed.unmatchedAccounts.length > 0 && (
            <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Akun tidak dikenal ({processed.unmatchedAccounts.length})
              </div>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                {processed.unmatchedAccounts.join(', ')} — transaksi dengan akun ini akan dilewati.
              </p>
            </div>
          )}

          {processed.valid.length > 0 && (
            <div className="max-h-60 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-2 py-1.5 font-medium text-neutral-500">Tanggal</th>
                    <th className="px-2 py-1.5 font-medium text-neutral-500">Tipe</th>
                    <th className="px-2 py-1.5 font-medium text-neutral-500">Jumlah</th>
                    <th className="px-2 py-1.5 font-medium text-neutral-500">Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {processed.valid.slice(0, 10).map((tx, i) => (
                    <tr key={i} className="border-t border-neutral-100 dark:border-neutral-700">
                      <td className="px-2 py-1.5">{formatDate(tx.date, 'dd/MM/yyyy')}</td>
                      <td className="px-2 py-1.5 capitalize">{tx.type}</td>
                      <td className="px-2 py-1.5">{formatCurrency(tx.amount)}</td>
                      <td className="px-2 py-1.5">{tx.categoryName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {processed.valid.length > 10 && (
                <p className="p-2 text-center text-xs text-neutral-400">
                  ...dan {processed.valid.length - 10} lainnya
                </p>
              )}
            </div>
          )}

          <Button onClick={handleImport} loading={importing} disabled={processed.valid.length === 0} className="mt-2">
            <Upload className="h-4 w-4" />
            Import {processed.valid.length} Transaksi
          </Button>
        </>
      )}
    </div>
  );
}
