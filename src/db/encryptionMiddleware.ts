import { useEncryptionStore } from '@/stores/encryptionStore';
import type { Transaction, Debt } from '@/types';
import { encryptNumber, decryptNumber, encryptString, decryptString } from '@/utils/encryption';

function getKey(): CryptoKey | null {
  return useEncryptionStore.getState().key;
}

function isEnabled(): boolean {
  return useEncryptionStore.getState().enabled;
}

export async function encryptTransaction(tx: Partial<Transaction>): Promise<Partial<Transaction>> {
  if (!isEnabled()) return tx;
  const key = getKey();
  if (!key) return tx;
  const result = { ...tx };
  if (tx.amount !== undefined) {
    result._encAmount = await encryptNumber(tx.amount, key);
    result.amount = 0;
  }
  if (tx.notes !== undefined) {
    result._encNotes = await encryptString(tx.notes || '', key);
    result.notes = '';
  }
  return result;
}

export async function decryptTransaction(tx: Transaction): Promise<Transaction> {
  if (!isEnabled()) return tx;
  const key = getKey();
  if (!key) return tx;
  if (!tx._encAmount && !tx._encNotes) return tx;
  const result = { ...tx };
  if (tx._encAmount) {
    result.amount = await decryptNumber(tx._encAmount, key);
  }
  if (tx._encNotes) {
    result.notes = await decryptString(tx._encNotes, key);
  }
  return result;
}

export async function decryptTransactions(txs: Transaction[]): Promise<Transaction[]> {
  if (!isEnabled() || txs.length === 0) return txs;
  const key = getKey();
  if (!key) return txs;
  return Promise.all(txs.map((tx) => decryptTransaction(tx)));
}

export async function encryptDebt(debt: Partial<Debt>): Promise<Partial<Debt>> {
  if (!isEnabled()) return debt;
  const key = getKey();
  if (!key) return debt;
  const result = { ...debt };
  if (debt.personName !== undefined) {
    result._encPersonName = await encryptString(debt.personName || '', key);
    result.personName = '';
  }
  if (debt.notes !== undefined) {
    result._encNotes = await encryptString(debt.notes || '', key);
    result.notes = '';
  }
  return result;
}

export async function decryptDebt(debt: Debt): Promise<Debt> {
  if (!isEnabled()) return debt;
  const key = getKey();
  if (!key) return debt;
  if (!debt._encPersonName && !debt._encNotes) return debt;
  const result = { ...debt };
  if (debt._encPersonName) {
    result.personName = await decryptString(debt._encPersonName, key);
  }
  if (debt._encNotes) {
    result.notes = await decryptString(debt._encNotes, key);
  }
  return result;
}

export async function decryptDebts(debts: Debt[]): Promise<Debt[]> {
  if (!isEnabled() || debts.length === 0) return debts;
  const key = getKey();
  if (!key) return debts;
  return Promise.all(debts.map((d) => decryptDebt(d)));
}
