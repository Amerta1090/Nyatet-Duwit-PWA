import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Transaction, Category, Account } from '@/types';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { accountRepo } from '@/db/repositories/accountRepository';
import { TransactionList } from '@/components/finance/TransactionList';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { useUIStore } from '@/stores/uiStore';

export default function TransactionsPage() {
  const { fabSignal } = useOutletContext<{ fabSignal: number }>();
  const { showToast } = useUIStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  async function loadData() {
    setLoading(true);
    const [txs, cats, accs] = await Promise.all([
      transactionRepo.getAll({ limit: 100 }),
      categoryRepo.getAll(),
      accountRepo.getAll(true),
    ]);
    setTransactions(txs);
    setCategories(cats);
    setAccounts(accs);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (fabSignal > 0) setFormOpen(true);
  }, [fabSignal]);

  async function handleDelete(tx: Transaction) {
    await transactionRepo.delete(tx.id);
    showToast('Transaksi dihapus', 'info', async () => {
      const input = {
        type: tx.type,
        amount: tx.amount,
        categoryId: tx.categoryId,
        accountId: tx.accountId,
        toAccountId: tx.toAccountId,
        date: tx.date,
        notes: tx.notes,
      };
      await transactionRepo.create(input);
      showToast('Transaksi dipulihkan', 'success');
      loadData();
    });
    loadData();
  }

  function handleEdit(tx: Transaction) {
    setEditTx(tx);
    setFormOpen(true);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditTx(null);
    loadData();
  }

  return (
    <div>
      <TransactionList
        transactions={transactions}
        categories={categories}
        accounts={accounts}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <TransactionForm
        open={formOpen}
        onClose={handleFormClose}
        editId={editTx?.id}
        prefill={editTx ? {
          type: editTx.type,
          amount: editTx.amount,
          categoryId: editTx.categoryId,
          accountId: editTx.accountId,
          date: editTx.date,
          notes: editTx.notes,
        } : undefined}
      />
    </div>
  );
}
