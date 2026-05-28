import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui';
import { getMonthRange, startOfDay } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { ArrowLeft, Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  collectExportData,
  generateCSV,
  generatePDFHtml,
  downloadFile,
  downloadPDFHtmlAsFile,
  getExportFilename,
  type ExportData,
} from '@/utils/export';

type Format = 'csv' | 'pdf';
type Preset = 'this-month' | 'last-month' | '3-months' | 'custom';

const presets: { value: Preset; label: string }[] = [
  { value: 'this-month', label: 'Bulan Ini' },
  { value: 'last-month', label: 'Bulan Lalu' },
  { value: '3-months', label: '3 Bulan Terakhir' },
  { value: 'custom', label: 'Kustom' },
];

function getPresetRange(preset: Preset): { dateFrom: number; dateTo: number } {
  const now = Date.now();
  const today = startOfDay(now);

  switch (preset) {
    case 'this-month': {
      const r = getMonthRange(now);
      return { dateFrom: r.start, dateTo: r.end };
    }
    case 'last-month': {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      const r = getMonthRange(d.getTime());
      return { dateFrom: r.start, dateTo: r.end };
    }
    case '3-months': {
      const r = getMonthRange(now);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return { dateFrom: startOfDay(threeMonthsAgo.getTime()), dateTo: r.end };
    }
    default:
      return { dateFrom: startOfDay(now - 30 * 86400000), dateTo: today + 86400000 };
  }
}

export default function ExportPage() {
  const navigate = useNavigate();
  const { showToast } = useUIStore();

  const [format, setFormat] = useState<Format>('csv');
  const [preset, setPreset] = useState<Preset>('this-month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState<ExportData | null>(null);

  const [nowRef] = useState(() => Date.now());

  const dateRange = useMemo(() => {
    if (preset !== 'custom') return getPresetRange(preset);
    const from = customFrom ? new Date(customFrom).getTime() : nowRef - 30 * 86400000;
    const to = customTo ? new Date(customTo).getTime() + 86400000 : nowRef + 86400000;
    return { dateFrom: from, dateTo: to };
  }, [preset, customFrom, customTo, nowRef]);

  const loadPreview = useCallback(async () => {
    setExporting(true);
    try {
      const data = await collectExportData(dateRange);
      setPreview(data);
    } catch {
      showToast('Gagal memuat data', 'error');
    }
    setExporting(false);
  }, [dateRange, showToast]);

  async function handleExport() {
    setExporting(true);
    try {
      const data = await collectExportData(dateRange);
      const prefix = preset === 'this-month' ? 'BulanIni' : preset === 'last-month' ? 'BulanLalu' : 'Laporan';

      if (format === 'csv') {
        const csv = generateCSV(data);
        downloadFile(csv, getExportFilename(prefix, 'csv', dateRange.dateFrom), 'text/csv;charset=utf-8');
      } else {
        const html = generatePDFHtml(data);
        const pdfFilename = getExportFilename(prefix, 'pdf', dateRange.dateFrom);
        downloadPDFHtmlAsFile(html, pdfFilename);
      }

      showToast(`Data berhasil diexport sebagai ${format.toUpperCase()}`, 'success');
    } catch {
      showToast('Gagal mengexport data', 'error');
    }
    setExporting(false);
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/more')} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Export Data</h1>
      </div>

      <div className="rounded-xl bg-white p-4 dark:bg-neutral-800">
        <label className="mb-2 text-xs font-medium text-neutral-500">Format</label>
        <div className="flex gap-2">
          {(['csv', 'pdf'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
                format === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300',
              )}
            >
              {f === 'csv' ? <FileSpreadsheet className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 dark:bg-neutral-800">
        <label className="mb-2 text-xs font-medium text-neutral-500">Rentang Waktu</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                preset === p.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="mt-3 flex gap-3">
            <div className="flex-1">
              <label className="mb-1 text-[10px] font-medium text-neutral-400">Dari</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-9 w-full rounded-lg border border-neutral-100 bg-white px-3 text-xs dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 text-[10px] font-medium text-neutral-400">Sampai</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-9 w-full rounded-lg border border-neutral-100 bg-white px-3 text-xs dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-neutral-500">Preview</p>
          <button
            onClick={loadPreview}
            disabled={exporting}
            className="flex items-center gap-1 text-xs font-medium text-primary-500"
          >
            <ChevronDown className="h-3 w-3" />
            {preview ? 'Refresh' : 'Lihat'}
          </button>
        </div>

        {preview ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-neutral-400">{preview.periodLabel} &middot; {preview.transactionCount} transaksi</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] font-medium uppercase text-neutral-400">Pemasukan</p>
                <p className="text-sm font-bold text-accent-500">{formatCurrency(preview.totalIncome)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-neutral-400">Pengeluaran</p>
                <p className="text-sm font-bold text-danger-500">{formatCurrency(preview.totalExpense)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-neutral-400">Tap "Lihat" untuk menampilkan ringkasan</p>
        )}
      </div>

      <Button
        onClick={handleExport}
        disabled={exporting}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" />
        {exporting ? 'Mengexport...' : `Export ${format.toUpperCase()}`}
      </Button>
    </div>
  );
}
