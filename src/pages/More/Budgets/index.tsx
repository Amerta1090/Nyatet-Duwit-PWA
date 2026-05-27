import { useEffect, useState } from 'react';
import { budgetRepo, type BudgetSummary } from '@/db/repositories/budgetRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import type { Category } from '@/types';
import { formatCurrency } from '@/utils/format';
import { getCategoryIcon } from '@/utils/icons';
import { useUIStore } from '@/stores/uiStore';
import { EmptyState, BottomSheet, Badge } from '@/components/ui';
import { Landmark, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<BudgetSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useUIStore();

  async function loadBudgets() {
    setLoading(true);
    const [b, cats] = await Promise.all([
      budgetRepo.getAll(),
      categoryRepo.getByType('expense'),
    ]);
    setBudgets(b);
    setCategories(cats);
    setLoading(false);
  }

  useEffect(() => {
    loadBudgets();
  }, []);

  const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));
  const availableCategories = categories.filter((c) => !budgetedCategoryIds.has(c.id!));

  function openAddForm() {
    setEditBudget(null);
    setSelectedCategory(availableCategories[0]?.id ?? '');
    setBudgetAmount('');
    setFormOpen(true);
  }

  function openEditForm(budget: BudgetSummary) {
    setEditBudget(budget);
    setSelectedCategory(budget.categoryId);
    setBudgetAmount(String(budget.limit));
    setFormOpen(true);
  }

  async function handleSave() {
    if (!selectedCategory || !budgetAmount || Number(budgetAmount) <= 0) return;
    setSaving(true);
    await budgetRepo.setBudget(selectedCategory, Number(budgetAmount));
    if (editBudget && editBudget.categoryId !== selectedCategory) {
      await budgetRepo.removeBudget(editBudget.categoryId);
    }
    showToast('Budget tersimpan', 'success');
    setFormOpen(false);
    setSaving(false);
    loadBudgets();
  }

  async function handleDelete(categoryId: string) {
    await budgetRepo.removeBudget(categoryId);
    showToast('Budget dihapus', 'info');
    loadBudgets();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-neutral-400">Memuat...</p>
      </div>
    );
  }

  const total = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overLimit = budgets.filter((b) => b.status === 'danger');

  return (
    <div className="flex flex-col gap-4 py-4">
      {budgets.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Total Anggaran</span>
            <span className="text-xs text-neutral-400">{formatCurrency(totalSpent)} / {formatCurrency(total)}</span>
          </div>
          <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                budgets.some((b) => b.status === 'danger') ? 'bg-danger-500' : total > 0 && totalSpent / total > 0.75 ? 'bg-amber-500' : 'bg-accent-500',
              )}
              style={{ width: `${total > 0 ? Math.min((totalSpent / total) * 100, 100) : 0}%` }}
            />
          </div>
          {overLimit.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-danger-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-danger-500" />
              {overLimit.length} kategori melebihi batas
            </div>
          )}
        </div>
      )}

      {budgets.length === 0 ? (
        <EmptyState
          icon={<Landmark className="h-12 w-12" />}
          title="Belum ada budget"
          description="Atur budget bulanan untuk setiap kategori pengeluaran"
          action={<button onClick={openAddForm} className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Tambah Budget</button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {budgets.map((budget) => {
            const Icon = getCategoryIcon(budget.categoryIcon);
            return (
              <div key={budget.categoryId} className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: budget.categoryColor + '20' }}
                    >
                      <Icon className="h-4 w-4" style={{ color: budget.categoryColor }} />
                    </div>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{budget.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {budget.status === 'danger' && <Badge label="Melebihi" variant="danger" />}
                    {budget.status === 'warning' && <Badge label="Hampir" variant="warning" />}
                    <button
                      onClick={() => openEditForm(budget)}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.categoryId)}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      budget.status === 'danger' ? 'bg-danger-500' : budget.status === 'warning' ? 'bg-amber-500' : 'bg-accent-500',
                    )}
                    style={{ width: `${Math.min(budget.percent, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{formatCurrency(budget.spent)}</span>
                  <span>{budget.percent}% dari {formatCurrency(budget.limit)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={openAddForm}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700"
      >
        <Plus className="h-5 w-5" />
        Tambah Budget
      </button>

      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title={editBudget ? 'Edit Budget' : 'Tambah Budget'}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 text-xs font-medium text-neutral-500">Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
            >
              {editBudget && (
                <option value={editBudget.categoryId}>{editBudget.categoryName}</option>
              )}
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id!}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 text-xs font-medium text-neutral-500">Batas Bulanan (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={budgetAmount ? Number(budgetAmount).toLocaleString('id-ID') : ''}
              onChange={(e) => setBudgetAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm placeholder:text-neutral-300 focus:border-primary-500 focus:outline-none dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={!selectedCategory || !budgetAmount || Number(budgetAmount) <= 0 || saving}
            className={cn(
              'flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold transition-all',
              selectedCategory && budgetAmount && Number(budgetAmount) > 0 && !saving
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-neutral-100 text-neutral-300 dark:bg-neutral-700 dark:text-neutral-500',
            )}
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}