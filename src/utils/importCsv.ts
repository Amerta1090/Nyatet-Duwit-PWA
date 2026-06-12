export interface CsvRow {
  [key: string]: string;
}

export interface ImportMapping {
  date: string;
  type: string;
  amount: string;
  category: string;
  account: string;
  notes: string;
  tags: string;
}

export interface ImportedTransaction {
  date: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryName: string;
  accountName: string;
  notes: string;
  tags: string[];
}

export interface ImportResult {
  rows: ImportedTransaction[];
  errors: { row: number; message: string }[];
  duplicates: { row: number; tx: ImportedTransaction }[];
  unmatchedCategories: string[];
  unmatchedAccounts: string[];
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0) continue;
    if (values.every((v) => !v.trim())) continue;
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx]?.trim() ?? '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

export function parseDate(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // DD/MM/YYYY
  const dmy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const d = parseInt(dmy[1], 10);
    const m = parseInt(dmy[2], 10) - 1;
    const y = parseInt(dmy[3], 10);
    const date = new Date(y, m, d);
    if (date.getDate() === d) return date.getTime();
  }

  // MM/DD/YYYY
  const mdy = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (mdy) {
    const m = parseInt(mdy[1], 10) - 1;
    const d = parseInt(mdy[2], 10);
    const y = parseInt(mdy[3], 10);
    const date = new Date(y, m, d);
    if (date.getDate() === d) return date.getTime();
  }

  // YYYY-MM-DD
  const ymd = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10) - 1;
    const d = parseInt(ymd[3], 10);
    const date = new Date(y, m, d);
    if (date.getDate() === d) return date.getTime();
  }

  // ISO
  const ts = Date.parse(trimmed);
  if (!isNaN(ts)) return ts;

  return null;
}

export function parseAmount(value: string): number | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;

  let cleaned = trimmed;
  // Remove currency symbols and Rp prefix
  cleaned = cleaned.replace(/^(rp\s*|idr\s*|\$\s*|€\s*|£\s*)/, '');
  // Remove dots used as thousand separators (Indonesia format: Rp 1.000)
  // But keep dots that are decimal separators (rare)
  // Heuristic: if a dot is followed by exactly 3 digits, it's a thousand separator
  cleaned = cleaned.replace(/\.(?=\d{3})/g, '');
  // Replace comma as decimal separator with dot
  cleaned = cleaned.replace(/,(\d+)$/, '.$1');
  // Remove all non-numeric except dot and minus
  cleaned = cleaned.replace(/[^0-9.\-]/g, '');

  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return Math.abs(num);
}

export function parseType(value: string): 'income' | 'expense' | 'transfer' | null {
  const v = value.trim().toLowerCase();
  if (/^pemasukan|income|masuk|kredit|debit$/i.test(v)) return 'income';
  if (/^pengeluaran|expense|keluar|belanja$/i.test(v)) return 'expense';
  if (/^transfer$/i.test(v)) return 'transfer';
  return null;
}

export function detectColumnMapping(headers: string[]): ImportMapping {
  const h = headers.map((h) => h.toLowerCase().trim());

  const find = (patterns: string[]): string | null => {
    for (const p of patterns) {
      const idx = h.findIndex((x) => x.includes(p));
      if (idx >= 0) return headers[idx];
    }
    return null;
  };

  return {
    date: find(['tanggal', 'date', 'tgl', 'waktu', 'time']) ?? '',
    type: find(['tipe', 'type', 'jenis', 'kategori transaksi']) ?? '',
    amount: find(['jumlah', 'amount', 'nominal', 'nilai', 'total', 'value']) ?? '',
    category: find(['kategori', 'category', 'cat']) ?? '',
    account: find(['akun', 'account', 'rekening', 'dompet', 'wallet']) ?? '',
    notes: find(['catatan', 'notes', 'note', 'keterangan', 'description', 'desc']) ?? '',
    tags: find(['tag', 'tags', 'label', 'labels']) ?? '',
  };
}

export async function processImport(
  rows: CsvRow[],
  mapping: ImportMapping,
  existingCategories: { id: string; name: string; type: 'income' | 'expense' }[],
  existingAccounts: { id: string; name: string }[],
): Promise<ImportResult> {
  const result: ImportResult = {
    rows: [],
    errors: [],
    duplicates: [],
    unmatchedCategories: [],
    unmatchedAccounts: [],
  };

  const catNameMap = new Map<string, string>();
  for (const c of existingCategories) {
    catNameMap.set(c.name.toLowerCase(), c.id);
  }

  const accNameMap = new Map<string, string>();
  for (const a of existingAccounts) {
    accNameMap.set(a.name.toLowerCase(), a.id);
  }

  const seen = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNum = i + 2;

    const dateVal = mapping.date ? parseDate(r[mapping.date]) : null;
    if (dateVal === null) {
      result.errors.push({ row: rowNum, message: 'Tanggal tidak valid' });
      continue;
    }

    const typeVal = mapping.type ? parseType(r[mapping.type]) : null;
    if (typeVal === null) {
      result.errors.push({ row: rowNum, message: 'Tipe transaksi tidak valid' });
      continue;
    }

    const amountVal = mapping.amount ? parseAmount(r[mapping.amount]) : null;
    if (amountVal === null || amountVal <= 0) {
      result.errors.push({ row: rowNum, message: 'Jumlah tidak valid' });
      continue;
    }

    const categoryName = mapping.category ? (r[mapping.category] || '-').trim() : '-';
    const accountName = mapping.account ? (r[mapping.account] || '-').trim() : '-';
    const notes = mapping.notes ? (r[mapping.notes] || '').trim() : '';
    const tagsStr = mapping.tags ? (r[mapping.tags] || '').trim() : '';

    if (!catNameMap.has(categoryName.toLowerCase()) && categoryName !== '-') {
      if (!result.unmatchedCategories.includes(categoryName)) {
        result.unmatchedCategories.push(categoryName);
      }
    }

    if (!accNameMap.has(accountName.toLowerCase()) && accountName !== '-') {
      if (!result.unmatchedAccounts.includes(accountName)) {
        result.unmatchedAccounts.push(accountName);
      }
    }

    const tags = tagsStr
      ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const tx: ImportedTransaction = {
      date: dateVal,
      type: typeVal,
      amount: amountVal,
      categoryName,
      accountName,
      notes,
      tags,
    };

    // Duplicate detection: same amount + same date + same notes (if present)
    const dupKey = `${amountVal}-${dateVal}-${notes.toLowerCase()}`;
    if (seen.has(dupKey)) {
      result.duplicates.push({ row: rowNum, tx });
      continue;
    }
    seen.add(dupKey);

    result.rows.push(tx);
  }

  return result;
}
