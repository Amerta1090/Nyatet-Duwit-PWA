import { useEffect, useState } from 'react';
import { useFilterStore, type DateFilterPreset } from '@/stores/filterStore';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { accountRepo } from '@/db/repositories/accountRepository';
import { tagRepo } from '@/db/repositories/tagRepository';
import type { Category, Account, Tag } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

const datePresets: { key: DateFilterPreset; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'today', label: 'Hari Ini' },
  { key: 'week', label: 'Minggu Ini' },
  { key: 'month', label: 'Bulan Ini' },
  { key: 'custom', label: 'Kustom' },
];

const typeOptions = [
  { key: 'all', label: 'Semua' },
  { key: 'income', label: 'Pemasukan' },
  { key: 'expense', label: 'Pengeluaran' },
  { key: 'transfer', label: 'Transfer' },
];

export function FilterModal() {
  const store = useFilterStore();
  const { showFilterModal, setShowFilterModal, clearFilters } = store;

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [localDatePreset, setLocalDatePreset] = useState<DateFilterPreset>(store.datePreset);
  const [localType, setLocalType] = useState(store.type);
  const [localCategoryId, setLocalCategoryId] = useState<string | undefined>(store.categoryId);
  const [localAccountId, setLocalAccountId] = useState<string | undefined>(store.accountId);
  const [localTagIds, setLocalTagIds] = useState<string[]>(store.tagIds);

  useEffect(() => {
    if (!showFilterModal) return;
    setLocalDatePreset(store.datePreset);
    setLocalType(store.type);
    setLocalCategoryId(store.categoryId);
    setLocalAccountId(store.accountId);
    setLocalTagIds(store.tagIds);
    categoryRepo.getAll().then(setCategories);
    accountRepo.getAll(true).then(setAccounts);
    tagRepo.getAll().then(setTags);
  }, [showFilterModal]);

  if (!showFilterModal) return null;

  function handleApply() {
    store.setDatePreset(localDatePreset);
    store.setType(localType);
    store.setCategoryId(localCategoryId);
    store.setAccountId(localAccountId);
    store.setTagIds(localTagIds);
    setShowFilterModal(false);
  }

  function handleClear() {
    clearFilters();
    setShowFilterModal(false);
  }

  function toggleTag(tagId: string) {
    setLocalTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => setShowFilterModal(false)} />
      <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 pb-8 dark:bg-neutral-900">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-neutral-200 dark:bg-neutral-600" />
        <h2 className="mb-5 text-lg font-semibold text-neutral-900 dark:text-neutral-50">Filter</h2>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-medium text-neutral-500">Rentang Waktu</label>
          <div className="flex flex-wrap gap-2">
            {datePresets.map((p) => (
              <button
                key={p.key}
                onClick={() => setLocalDatePreset(p.key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                  localDatePreset === p.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-medium text-neutral-500">Tipe</label>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((o) => (
              <button
                key={o.key}
                onClick={() => setLocalType(o.key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                  localType === o.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-medium text-neutral-500">Kategori</label>
          <select
            value={localCategoryId ?? ''}
            onChange={(e) => setLocalCategoryId(e.target.value || undefined)}
            className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-xs font-medium text-neutral-500">Akun</label>
          <select
            value={localAccountId ?? ''}
            onChange={(e) => setLocalAccountId(e.target.value || undefined)}
            className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
          >
            <option value="">Semua Akun</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        {tags.length > 0 && (
          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium text-neutral-500">Tag</label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const selected = localTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                      selected
                        ? 'text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300',
                    )}
                    style={selected ? { backgroundColor: tag.color } : undefined}
                  >
                    {tag.name}
                    {selected && <X className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={handleClear}>
            Hapus Filter
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Terapkan
          </Button>
        </div>
      </div>
    </div>
  );
}
