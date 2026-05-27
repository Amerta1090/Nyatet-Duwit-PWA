import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backupRepo } from '@/db/repositories/backupRepository';
import { useUIStore } from '@/stores/uiStore';
import { useDatabase } from '@/hooks/useDatabase';
import { Button, Modal } from '@/components/ui';
import { Download, Upload, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function BackupRestorePage() {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const { ready } = useDatabase();
  const [importing, setImporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const data = await backupRepo.exportData();
      backupRepo.downloadBackup(data);
      showToast('Data berhasil diexport', 'success');
    } catch {
      showToast('Gagal mengexport data', 'error');
    }
    setExporting(false);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await backupRepo.importData(data);
      if (result.success) {
        showToast('Data berhasil diimport. Memuat ulang...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast(result.error || 'Gagal mengimport data', 'error');
      }
    } catch {
      showToast('File tidak valid', 'error');
    }
    setImporting(false);
    e.target.value = '';
  }

  async function handleDeleteAll() {
    setDeleting(true);
    try {
      await backupRepo.clearAllData();
      showToast('Semua data dihapus. Memuat ulang...', 'info');
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      showToast('Gagal menghapus data', 'error');
    }
    setDeleting(false);
    setDeleteConfirm(false);
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/more')} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Backup & Restore</h1>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <h2 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Export Data</h2>
        <p className="mb-3 text-xs text-neutral-400">Download semua data ke file JSON. Gunakan untuk backup atau pindah perangkat.</p>
        <Button onClick={handleExport} disabled={!ready || exporting} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          {exporting ? 'Mengexport...' : 'Export Data'}
        </Button>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <h2 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Import Data</h2>
        <p className="mb-3 text-xs text-neutral-400">Pilih file backup JSON untuk mengembalikan data. Data yang ada akan diganti.</p>
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={!ready || importing}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <Button variant="secondary" disabled={!ready || importing} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            {importing ? 'Mengimport...' : 'Pilih File & Import'}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 dark:border-danger-800 dark:bg-danger-900/20">
        <h2 className="mb-1 text-sm font-semibold text-danger-600 dark:text-danger-400">Hapus Semua Data</h2>
        <p className="mb-3 text-xs text-neutral-500">Tindakan ini tidak bisa dibatalkan. Export data terlebih dahulu jika perlu.</p>
        <Button variant="danger" onClick={() => setDeleteConfirm(true)} disabled={deleting}>
          <Trash2 className="mr-2 h-4 w-4" />
          {deleting ? 'Menghapus...' : 'Hapus Semua Data'}
        </Button>
      </div>

      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Hapus Semua Data?">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 shrink-0 text-danger-500" />
            <div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                Semua data termasuk akun, transaksi, kategori, dan pengaturan akan dihapus permanen.
              </p>
              <p className="mt-1 text-sm font-semibold text-danger-500">Tindakan ini tidak bisa dibatalkan.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(false)} className="flex-1">Batal</Button>
            <Button variant="danger" onClick={handleDeleteAll} className="flex-1">Ya, Hapus Semua</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
