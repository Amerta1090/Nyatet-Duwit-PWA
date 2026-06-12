import { useState, useEffect, useCallback } from 'react';
import { BottomSheet, Input, Button } from '@/components/ui';
import type { Debt } from '@/types';
import { debtRepo } from '@/db/repositories/debtRepository';

interface DebtFormProps {
  open: boolean;
  onClose: () => void;
  editDebt?: Debt | null;
  onSaved: () => void;
}

export function DebtForm({ open, onClose, editDebt, onSaved }: DebtFormProps) {
  const [type, setType] = useState<'owed' | 'owing'>('owed');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editDebt) {
        setType(editDebt.type);
        setPersonName(editDebt.personName);
        setAmount(String(editDebt.amount));
        setDueDate(editDebt.dueDate ? new Date(editDebt.dueDate).toISOString().slice(0, 10) : '');
        setNotes(editDebt.notes ?? '');
      } else {
        setType('owed');
        setPersonName('');
        setAmount('');
        setDueDate('');
        setNotes('');
      }
    }
  }, [open, editDebt]);

  const handleSave = useCallback(async () => {
    const numAmount = Number(amount.replace(/\./g, ''));
    if (!personName.trim() || !numAmount || numAmount <= 0) return;
    setSaving(true);
    try {
      const dueTs = dueDate ? new Date(dueDate).getTime() : undefined;
      if (editDebt) {
        await debtRepo.update(editDebt.id, {
          type,
          personName: personName.trim(),
          amount: numAmount,
          paidAmount: editDebt.paidAmount,
          dueDate: dueTs,
          notes: notes.trim() || undefined,
        });
      } else {
        await debtRepo.create({
          type,
          personName: personName.trim(),
          amount: numAmount,
          dueDate: dueTs,
          notes: notes.trim() || undefined,
        });
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }, [type, personName, amount, dueDate, notes, editDebt, onSaved, onClose]);

  const isValid = personName.trim().length > 0 && Number(amount.replace(/\./g, '')) > 0;

  return (
    <BottomSheet open={open} onClose={onClose} title={editDebt ? 'Edit Utang/Piutang' : 'Tambah Utang/Piutang'}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setType('owed')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
              type === 'owed'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
            }`}
          >
            Piutang (dipinjamkan)
          </button>
          <button
            onClick={() => setType('owing')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
              type === 'owing'
                ? 'bg-amber-500 text-white'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
            }`}
          >
            Utang (dipinjam)
          </button>
        </div>

        <Input
          label="Nama Orang"
          placeholder="Contoh: Andi"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
        />
        <Input
          label="Jumlah"
          type="number"
          inputMode="numeric"
          placeholder="Rp 1.000.000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-100">
            Jatuh Tempo (opsional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-50"
          />
        </div>
        <Input
          label="Catatan (opsional)"
          placeholder="Catatan tambahan..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button variant="primary" onClick={handleSave} disabled={!isValid} loading={saving}>
          {editDebt ? 'Simpan Perubahan' : 'Tambah'}
        </Button>
      </div>
    </BottomSheet>
  );
}
