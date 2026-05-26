import { useEffect, useState, createElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import type { Category } from '@/types';
import { useUIStore } from '@/stores/uiStore';
import { getCategoryIcon } from '@/utils/icons';
import { IconPicker } from '@/components/finance/IconPicker';
import { ColorPicker } from '@/components/finance/ColorPicker';
import {
  Plus, Pencil, Trash2, ArrowUp, ArrowDown, Lock,
  ArrowLeft,
} from 'lucide-react';
import { Skeleton, BottomSheet } from '@/components/ui';
import { cn } from '@/utils/cn';
import { DEFAULT_CATEGORIES } from '@/constants/defaultCategories';

const defaultCategoryIds = new Set(DEFAULT_CATEGORIES.map((c) => c.id));

export default function CategoriesPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  async function loadCategories() {
    setLoading(true);
    const cats = await categoryRepo.getAll();
    setCategories(cats);
    setLoading(false);
  }

  useEffect(() => { loadCategories(); }, []);

  const expenseCats = categories.filter((c) => c.type === 'expense').sort((a, b) => a.order - b.order);
  const incomeCats = categories.filter((c) => c.type === 'income').sort((a, b) => a.order - b.order);

  return (
    <div className="py-4">
      <button
        onClick={() => navigate('/more')}
        className="mb-4 flex items-center gap-1 text-sm text-neutral-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">
          Kategori ({categories.length})
        </h3>
        <button
          onClick={() => { setEditCategory(null); setFormOpen(true); }}
          className="flex items-center gap-1 rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Tambah
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} height="56px" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <CategoryGroup
            title="Pengeluaran"
            categories={expenseCats}
            defaultIds={defaultCategoryIds}
            onEdit={(cat) => { setEditCategory(cat); setFormOpen(true); }}
            onReorder={async (id, direction) => {
              const idx = expenseCats.findIndex((c) => c.id === id);
              if (idx === -1) return;
              const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
              if (targetIdx < 0 || targetIdx >= expenseCats.length) return;
              const current = expenseCats[idx]!;
              const target = expenseCats[targetIdx]!;
              await categoryRepo.update(current.id, { order: target.order });
              await categoryRepo.update(target.id, { order: current.order });
              loadCategories();
            }}
            onRefresh={loadCategories}
          />
          <CategoryGroup
            title="Pemasukan"
            categories={incomeCats}
            defaultIds={defaultCategoryIds}
            onEdit={(cat) => { setEditCategory(cat); setFormOpen(true); }}
            onReorder={async (id, direction) => {
              const idx = incomeCats.findIndex((c) => c.id === id);
              if (idx === -1) return;
              const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
              if (targetIdx < 0 || targetIdx >= incomeCats.length) return;
              const current = incomeCats[idx]!;
              const target = incomeCats[targetIdx]!;
              await categoryRepo.update(current.id, { order: target.order });
              await categoryRepo.update(target.id, { order: current.order });
              loadCategories();
            }}
            onRefresh={loadCategories}
          />
        </div>
      )}

      <CategoryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditCategory(null); }}
        editCategory={editCategory}
        onSaved={loadCategories}
      />
    </div>
  );
}

interface CategoryGroupProps {
  title: string;
  categories: Category[];
  defaultIds: Set<string>;
  onEdit: (cat: Category) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onRefresh: () => void;
}

function CategoryGroup({ title, categories, defaultIds, onEdit, onReorder, onRefresh }: CategoryGroupProps) {
  const { showToast } = useUIStore();

  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">{title}</h4>
      <div className="flex flex-col gap-1">
        {categories.map((cat, idx) => {
          const Icon = createElement(getCategoryIcon(cat.icon), { className: 'h-5 w-5' });
          const isDefault = defaultIds.has(cat.id);
          const isFirst = idx === 0;
          const isLast = idx === categories.length - 1;

          return (
            <div
              key={cat.id}
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 dark:bg-neutral-800"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                <span style={{ color: cat.color }}>{Icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{cat.name}</span>
                {isDefault && (
                  <Lock className="ml-1.5 inline h-3 w-3 text-neutral-300" />
                )}
              </div>

              <div className="flex items-center gap-1">
                {!isFirst && (
                  <button
                    onClick={() => onReorder(cat.id, 'up')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                )}
                {!isLast && (
                  <button
                    onClick={() => onReorder(cat.id, 'down')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => onEdit(cat)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => {
                    if (isDefault) {
                      showToast('Kategori default tidak bisa dihapus', 'error');
                      return;
                    }
                    const txs = await transactionRepo.getAll({ categoryId: cat.id, limit: 1 });
                    if (txs.length > 0) {
                      showToast('Kategori memiliki transaksi, tidak bisa dihapus', 'error');
                      return;
                    }
                    await categoryRepo.delete(cat.id);
                    showToast('Kategori dihapus', 'info');
                    onRefresh();
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-danger-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {categories.length === 0 && (
          <p className="py-4 text-center text-sm text-neutral-400">Belum ada kategori</p>
        )}
      </div>
    </div>
  );
}

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  editCategory: Category | null;
  onSaved: () => void;
}

function CategoryForm({ open, onClose, editCategory, onSaved }: CategoryFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [icon, setIcon] = useState('ellipsis');
  const [color, setColor] = useState('#64748B');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setType(editCategory.type);
      setIcon(editCategory.icon);
      setColor(editCategory.color);
    } else {
      setName('');
      setType('expense');
      setIcon('ellipsis');
      setColor('#64748B');
    }
  }, [editCategory, open]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editCategory) {
        await categoryRepo.update(editCategory.id, {
          name: name.trim(),
          icon,
          color,
        });
      } else {
        const all = await categoryRepo.getAll();
        const sameType = all.filter((c) => c.type === type);
        const maxOrder = sameType.reduce((max, c) => Math.max(max, c.order), 0);
        await categoryRepo.create({
          name: name.trim(),
          type,
          icon,
          color,
          isDefault: false,
          order: maxOrder + 1,
        });
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const isValid = name.trim().length > 0;

  return (
    <BottomSheet open={open} onClose={onClose} title={editCategory ? 'Edit Kategori' : 'Tambah Kategori'}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 text-xs font-medium text-neutral-500">Nama Kategori</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kategori"
            className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
          />
        </div>

        {!editCategory && (
          <div>
            <label className="mb-1 text-xs font-medium text-neutral-500">Tipe</label>
            <div className="flex gap-2">
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                    type === t
                      ? t === 'expense' ? 'bg-danger-500 text-white' : 'bg-accent-500 text-white'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700',
                  )}
                >
                  {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 text-xs font-medium text-neutral-500">Ikon</label>
          <div className="max-h-48 overflow-y-auto">
            <IconPicker value={icon} onChange={setIcon} />
          </div>
        </div>

        <div>
          <label className="mb-2 text-xs font-medium text-neutral-500">Warna</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className={cn(
            'flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold transition-all',
            isValid && !saving
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-neutral-100 text-neutral-300 dark:bg-neutral-700 dark:text-neutral-500',
          )}
        >
          {saving ? 'Menyimpan...' : editCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
        </button>
      </div>
    </BottomSheet>
  );
}
