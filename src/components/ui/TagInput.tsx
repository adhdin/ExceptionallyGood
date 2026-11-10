import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { normalizeTag } from '../../lib/validation';

interface Props {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  invalid?: boolean;
}

export function TagInput({ id, value, onChange, suggestions = [], invalid }: Props) {
  const [text, setText] = useState('');

  const add = (raw: string) => {
    const parts = raw.split(',').map(normalizeTag).filter(Boolean);
    const next = [...value];
    for (const p of parts) if (!next.includes(p)) next.push(p);
    if (next.length !== value.length) onChange(next);
    setText('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (text.trim()) add(text);
    } else if (e.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const open = suggestions.filter((s) => !value.includes(s) && (!text || s.includes(text.toLowerCase()))).slice(0, 8);

  return (
    <div>
      <div className={`input flex min-h-[42px] flex-wrap items-center gap-1.5 ${invalid ? 'input-error' : ''}`}>
        {value.map((t) => (
          <span key={t} className="chip bg-accent-500/15 text-accent-700 dark:text-accent-300">
            #{t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Tag ${t} entfernen`} className="hover:text-rose-500">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => text.trim() && add(text)}
          placeholder={value.length ? '' : 'Tag eingeben, Enter drücken …'}
          className="min-w-[8rem] flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-ink-400 dark:placeholder:text-ink-500"
        />
      </div>
      {open.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-ink-400">Vorschläge:</span>
          {open.map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="chip bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700">
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
