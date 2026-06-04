import { useState, useEffect } from 'react';
import { tagRepo } from '@/db/repositories/tagRepository';
import { TagForm } from '@/components/finance/TagForm';
import { EmptyState } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { Tag as TagIcon, Pencil, Trash2, Plus } from 'lucide-react';
import type { Tag } from '@/types';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const { showToast } = useUIStore();

  async function loadData() {
    const all = await tagRepo.getAll();
    setTags(all);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleEdit(tag: Tag) {
    setEditTag(tag);
    setFormOpen(true);
  }

  async function handleDelete(tag: Tag) {
    const confirmed = window.confirm(`Hapus tag "${tag.name}"? Tag akan dihapus dari semua transaksi.`);
    if (!confirmed) return;
    await tagRepo.delete(tag.id);
    showToast('Tag dihapus', 'info');
    loadData();
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditTag(null);
    loadData();
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            {tags.length} Tag
          </p>
          <button
            onClick={() => { setEditTag(null); setFormOpen(true); }}
            className="flex items-center gap-1 rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-neutral-400">Memuat...</p>
          </div>
        ) : tags.length === 0 ? (
          <EmptyState
            icon={<TagIcon className="h-10 w-10" />}
            title="Belum ada tag"
            description="Buat tag untuk mengelompokkan transaksi secara custom"
            action={
              <button
                onClick={() => { setEditTag(null); setFormOpen(true); }}
                className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                Buat Tag
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-1">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 dark:bg-neutral-800"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${tag.color}20` }}
                >
                  <TagIcon className="h-4 w-4" style={{ color: tag.color }} />
                </div>
                <span className="flex-1 text-sm font-medium text-neutral-900 dark:text-neutral-50">{tag.name}</span>
                <button
                  onClick={() => handleEdit(tag)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(tag)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-danger-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <TagForm
        open={formOpen}
        onClose={handleFormClose}
        editTag={editTag}
        onSaved={loadData}
      />
    </>
  );
}
