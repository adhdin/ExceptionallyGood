import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  large?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, Props>(function SearchInput(
  { value, onChange, placeholder = 'Fehler, Exception, Projekt, Tag … suchen', autoFocus, large },
  ref,
) {
  return (
    <div className="relative">
      <Search className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 ${large ? 'h-5 w-5' : 'h-4 w-4'}`} />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Suche"
        className={`input pr-10 [&::-webkit-search-cancel-button]:hidden ${large ? 'h-12 pl-11 text-base' : 'pl-10'}`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
          aria-label="Suche leeren"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
