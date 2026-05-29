import { useState, useCallback } from 'react';
import { BottomSheet, Input, Button } from '@/components/ui';
import type { Goal } from '@/types';
import { goalRepo } from '@/db/repositories/goalRepository';
import { formatCurrency } from '@/utils/format';

interface GoalProgressFormProps {
  open: boolean;
  onClose: () => void;
  goal: Goal;
  onSaved: () => void;
}

export function GoalProgressForm({ open, onClose, goal, onSaved }: GoalProgressFormProps) {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const val = Number(amount.replace(/\./g, ''));
    if (!val || val <= 0) return;
    setSaving(true);
    try {
      await goalRepo.addProgress(goal.id, val);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }, [amount, goal.id, onSaved, onClose]);

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isValid = Number(amount.replace(/\./g, '')) > 0;

  return (
    <BottomSheet open={open} onClose={onClose} title="Tambah Dana ke Goal">
      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{goal.name}</p>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
          </p>
          <p className="text-xs text-neutral-400">
            Sisa: {formatCurrency(remaining)}
          </p>
        </div>

        <Input
          label="Jumlah Tambahan"
          type="number"
          inputMode="numeric"
          placeholder="Rp 100.000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Button variant="primary" onClick={handleSave} disabled={!isValid} loading={saving}>
          Tambahkan
        </Button>
      </div>
    </BottomSheet>
  );
}
