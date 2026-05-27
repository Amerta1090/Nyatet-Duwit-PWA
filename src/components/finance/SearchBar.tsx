import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

const RECENT_KEY = 'nd-search-history';
const MAX_HISTORY = 5;

function getHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function addToHistory(query: string) {
  const history = getHistory().filter((h) => h !== query);
  history.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Cari transaksi...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<string[]>(getHistory());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value);
      if (value.trim()) addToHistory(value);
    }, 300);
  }

  function handleClear() {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  }

  function handleHistoryClick(h: string) {
    setQuery(h);
    onSearch(h);
  }

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border bg-white px-3 py-2 transition-all dark:bg-neutral-800',
          focused ? 'border-primary-500' : 'border-neutral-100 dark:border-neutral-600',
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-50"
        />
        {query && (
          <button onClick={handleClear} className="shrink-0 text-neutral-400 hover:text-neutral-600" aria-label="Hapus pencarian">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!query && focused && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-neutral-100 bg-white p-2 shadow-lg dark:border-neutral-600 dark:bg-neutral-800">
          <p className="mb-1 px-2 text-[10px] font-medium uppercase text-neutral-400">Pencarian Terakhir</p>
          {history.map((h) => (
            <button
              key={h}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleHistoryClick(h)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-700"
            >
              <Clock className="h-3.5 w-3.5 text-neutral-400" />
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
