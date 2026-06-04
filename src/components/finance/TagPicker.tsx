import { useEffect, useState } from 'react';
import { tagRepo } from '@/db/repositories/tagRepository';
import type { Tag } from '@/types';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TagPickerProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagPicker({ value, onChange }: TagPickerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    tagRepo.getAll().then(setTags);
  }, []);

  const selectedTags = tags.filter((t) => value.includes(t.id));
  const availableTags = tags.filter((t) => !value.includes(t.id));

  function toggleTag(tagId: string) {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  }

  if (tags.length === 0) return null;

  return (
    <div>
      <label className="mb-1.5 text-xs font-medium text-neutral-500">Tag (opsional)</label>
      <div className="flex flex-wrap gap-1.5">
        {selectedTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <X className="h-3 w-3" />
          </button>
        ))}
        {availableTags.length > 0 && (showAll || selectedTags.length === 0) && (
          availableTags.slice(0, showAll ? undefined : 6).map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300',
              )}
            >
              {tag.name}
            </button>
          ))
        )}
        {availableTags.length > 6 && !showAll && selectedTags.length > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400"
          >
            +{availableTags.length - 6} lainnya
          </button>
        )}
        {availableTags.length > 6 && showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400"
          >
            Sembunyikan
          </button>
        )}
      </div>
    </div>
  );
}
