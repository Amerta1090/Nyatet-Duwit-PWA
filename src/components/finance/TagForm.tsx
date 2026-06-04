import { useState, useEffect, useCallback } from 'react';
import { BottomSheet, Button } from '@/components/ui';
import { ColorPicker } from './ColorPicker';
import type { Tag } from '@/types';
import { tagRepo } from '@/db/repositories/tagRepository';

interface TagFormProps {
  open: boolean;
  onClose: () => void;
  editTag?: Tag | null;
  onSaved: () => void;
}

const DEFAULT_COLOR = '#6366F1';

export function TagForm({ open, onClose, editTag, onSaved }: TagFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editTag) {
        setName(editTag.name);
        setColor(editTag.color);
      } else {
        setName('');
        setColor(DEFAULT_COLOR);
      }
    }
  }, [open, editTag]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editTag) {
        await tagRepo.update(editTag.id, { name: name.trim(), color });
      } else {
        await tagRepo.create({ name: name.trim(), color });
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }, [name, color, editTag, onSaved, onClose]);

  const isValid = name.trim().length > 0;

  return (
    <BottomSheet open={open} onClose={onClose} title={editTag ? 'Edit Tag' : 'Tambah Tag'}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 text-xs font-medium text-neutral-500">Nama Tag</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Makan Siang"
            className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
          />
        </div>

        <div>
          <label className="mb-2 text-xs font-medium text-neutral-500">Warna</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <Button variant="primary" onClick={handleSave} disabled={!isValid} loading={saving}>
          {editTag ? 'Simpan Perubahan' : 'Tambah Tag'}
        </Button>
      </div>
    </BottomSheet>
  );
}
