import { useState, useEffect, useCallback } from 'react';
import { BottomSheet, Input, Button } from '@/components/ui';
import { ColorPicker } from './ColorPicker';
import { IconPicker } from './IconPicker';
import type { Goal } from '@/types';
import { goalRepo } from '@/db/repositories/goalRepository';

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  editGoal?: Goal | null;
  onSaved: () => void;
}

const DEFAULT_ICON = 'piggybank';
const DEFAULT_COLOR = '#3B82F6';

export function GoalForm({ open, onClose, editGoal, onSaved }: GoalFormProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editGoal) {
        setName(editGoal.name);
        setTargetAmount(String(editGoal.targetAmount));
        setIcon(editGoal.icon);
        setColor(editGoal.color);
        setDeadline(editGoal.deadline ? new Date(editGoal.deadline).toISOString().slice(0, 10) : '');
      } else {
        setName('');
        setTargetAmount('');
        setIcon(DEFAULT_ICON);
        setColor(DEFAULT_COLOR);
        setDeadline('');
      }
    }
  }, [open, editGoal]);

  const handleSave = useCallback(async () => {
    const amount = Number(targetAmount.replace(/\./g, ''));
    if (!name.trim() || !amount || amount <= 0) return;
    setSaving(true);
    try {
      const deadlineTs = deadline ? new Date(deadline).getTime() : undefined;
      if (editGoal) {
        await goalRepo.update(editGoal.id, {
          name: name.trim(),
          targetAmount: amount,
          icon,
          color,
          deadline: deadlineTs,
        });
      } else {
        await goalRepo.create({
          name: name.trim(),
          targetAmount: amount,
          icon,
          color,
          deadline: deadlineTs,
        });
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }, [name, targetAmount, icon, color, deadline, editGoal, onSaved, onClose]);

  const isValid = name.trim().length > 0 && Number(targetAmount.replace(/\./g, '')) > 0;

  return (
    <BottomSheet open={open} onClose={onClose} title={editGoal ? 'Edit Goal' : 'Tambah Goal'}>
      <div className="flex flex-col gap-4">
        <Input
          label="Nama Goal"
          placeholder="Contoh: Liburan Bali"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Target Nominal"
          type="number"
          inputMode="numeric"
          placeholder="Rp 5.000.000"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-100">Deadline (opsional)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-50"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-100">Ikon</label>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-100">Warna</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <Button variant="primary" onClick={handleSave} disabled={!isValid} loading={saving}>
          {editGoal ? 'Simpan Perubahan' : 'Buat Goal'}
        </Button>
      </div>
    </BottomSheet>
  );
}
