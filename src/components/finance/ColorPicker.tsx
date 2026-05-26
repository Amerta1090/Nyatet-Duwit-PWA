import { cn } from '@/utils/cn';

const COLORS = [
  '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#10B981', '#14B8A6', '#6366F1', '#84CC16', '#06B6D4',
  '#F97316', '#64748B', '#1E40AF', '#7C3AED', '#DB2777',
  '#059669', '#0D9488', '#2563EB', '#65A30D', '#0891B2',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            'h-8 w-8 rounded-full transition-all',
            value === c && 'ring-2 ring-offset-2 ring-neutral-400 dark:ring-offset-neutral-800',
          )}
          style={{ backgroundColor: c }}
          aria-label={c}
        />
      ))}
    </div>
  );
}
