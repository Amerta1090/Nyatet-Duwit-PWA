import { transactionRepo } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { accountRepo } from '@/db/repositories/accountRepository';
import { formatCurrency, formatDate } from './format';

interface ExportOptions {
  dateFrom: number;
  dateTo: number;
  accountIds?: string[];
}

export interface ExportData {
  transactions: {
    date: string;
    type: string;
    category: string;
    account: string;
    amount: string;
    notes: string;
    tags: string;
  }[];
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  periodLabel: string;
}

export async function collectExportData(options: ExportOptions): Promise<ExportData> {
  const [txs, cats, accs] = await Promise.all([
    transactionRepo.getAll({ dateFrom: options.dateFrom, dateTo: options.dateTo, limit: 5000 }),
    categoryRepo.getAll(),
    accountRepo.getAll(true),
  ]);

  const catMap = Object.fromEntries(cats.map((c) => [c.id, c]));
  const accMap = Object.fromEntries(accs.map((a) => [a.id, a]));

  let filtered = txs;
  if (options.accountIds && options.accountIds.length > 0) {
    const ids = new Set(options.accountIds);
    filtered = txs.filter((t) => ids.has(t.accountId));
  }

  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const fromLabel = formatDate(options.dateFrom, 'dd MMM yyyy');
  const toLabel = formatDate(options.dateTo, 'dd MMM yyyy');

  return {
    transactions: filtered
      .sort((a, b) => b.date - a.date)
      .map((tx) => ({
        date: formatDate(tx.date, 'dd/MM/yyyy'),
        type: tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer',
        category: catMap[tx.categoryId]?.name ?? '-',
        account: accMap[tx.accountId]?.name ?? '-',
        amount: tx.type === 'expense' ? `-${formatCurrency(tx.amount)}` : formatCurrency(tx.amount),
        notes: tx.notes ?? '',
        tags: tx.tags?.length ? tx.tags.join(', ') : '',
      })),
    totalIncome: income,
    totalExpense: expense,
    transactionCount: filtered.length,
    periodLabel: `${fromLabel} - ${toLabel}`,
  };
}

export function generateCSV(data: ExportData): string {
  const header = 'Tanggal,Tipe,Kategori,Akun,Jumlah,Catatan,Tag';
  const rows = data.transactions.map((tx) => {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    return [
      escape(tx.date),
      escape(tx.type),
      escape(tx.category),
      escape(tx.account),
      escape(tx.amount),
      escape(tx.notes),
      escape(tx.tags),
    ].join(',');
  });

  const summary = [
    '',
    '# Ringkasan',
    `Periode,${data.periodLabel}`,
    `Pemasukan,${formatCurrency(data.totalIncome)}`,
    `Pengeluaran,${formatCurrency(data.totalExpense)}`,
    `Sisa,${formatCurrency(data.totalIncome - data.totalExpense)}`,
    `Total Transaksi,${data.transactionCount}`,
  ];

  return '\uFEFF' + [header, ...rows, ...summary].join('\n');
}

export function generatePDFHtml(data: ExportData): string {
  const rows = data.transactions.map((tx) => `
    <tr>
      <td>${tx.date}</td>
      <td>${tx.type}</td>
      <td>${tx.category}</td>
      <td>${tx.account}</td>
      <td style="text-align:right">${tx.amount}</td>
      <td>${tx.notes}</td>
      <td>${tx.tags}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Laporan Keuangan</title>
<style>
  @page { margin: 20mm; size: A4; }
  body { font-family: -apple-system, 'Segoe UI', sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 20px; }
  h1 { font-size: 18px; margin: 0 0 4px; color: #1e40af; }
  .period { font-size: 13px; color: #64748b; margin-bottom: 16px; }
  .summary { display: flex; gap: 16px; margin-bottom: 20px; }
  .summary-card { flex: 1; padding: 12px; border-radius: 8px; background: #f8fafc; }
  .summary-card .label { font-size: 10px; text-transform: uppercase; color: #64748b; }
  .summary-card .value { font-size: 16px; font-weight: 700; margin-top: 2px; }
  .summary-card.income .value { color: #10b981; }
  .summary-card.expense .value { color: #ef4444; }
  .summary-card.net .value { color: #1e40af; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th { background: #1e40af; color: white; padding: 8px 6px; text-align: left; font-weight: 600; }
  th:last-child { text-align: left; }
  td { padding: 6px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  .footer { margin-top: 20px; font-size: 10px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
  <h1>Laporan Keuangan</h1>
  <p class="period">Periode: ${data.periodLabel}</p>
  <div class="summary">
    <div class="summary-card income">
      <div class="label">Pemasukan</div>
      <div class="value">${formatCurrency(data.totalIncome)}</div>
    </div>
    <div class="summary-card expense">
      <div class="label">Pengeluaran</div>
      <div class="value">${formatCurrency(data.totalExpense)}</div>
    </div>
    <div class="summary-card net">
      <div class="label">Sisa</div>
      <div class="value">${formatCurrency(data.totalIncome - data.totalExpense)}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Akun</th><th style="text-align:right">Jumlah</th><th>Catatan</th><th>Tag</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Dibuat oleh NyatetDuwit &mdash; ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
</body>
</html>`;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPDFHtmlAsFile(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '0';
  iframe.style.height = '0';
  document.body.appendChild(iframe);

  iframe.src = url;

  iframe.onload = () => {
    try {
      iframe.contentWindow?.print();
    } catch {
      const fallbackBlob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const fallbackUrl = URL.createObjectURL(fallbackBlob);
      const a = document.createElement('a');
      a.href = fallbackUrl;
      a.download = filename.replace('.pdf', '.html');
      a.click();
      URL.revokeObjectURL(fallbackUrl);
    }
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 1000);
  };
}

export function getExportFilename(prefix: string, format: 'csv' | 'pdf', dateFrom: number): string {
  const d = new Date(dateFrom);
  const month = d.toLocaleDateString('id-ID', { month: 'long' });
  const year = d.getFullYear();
  return `NyatetDuwit_${prefix}_${month}${year}.${format}`;
}
