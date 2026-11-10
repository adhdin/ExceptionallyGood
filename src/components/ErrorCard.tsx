import { Link } from 'react-router-dom';
import { Copy, FolderOpen, Pencil, Star, Trash2 } from 'lucide-react';
import type { ErrorEntry } from '../types/error';
import { relativeTime } from '../lib/format';
import { Highlight } from './ui/Highlight';

interface Props {
  entry: ErrorEntry;
  query?: string;
  onToggleFavorite: (e: ErrorEntry) => void;
  onDuplicate: (e: ErrorEntry) => void;
  onDelete: (e: ErrorEntry) => void;
}

export function ErrorCard({ entry, query = '', onToggleFavorite, onDuplicate, onDelete }: Props) {
  const firstLine = entry.errorMessage.split('\n').find((l) => l.trim()) ?? '';

  return (
    <article className="card group relative flex flex-col p-4 transition-colors hover:border-accent-500/40 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="chip bg-rose-500/10 text-rose-600 dark:text-rose-400">{entry.category}</span>
            <span className="chip bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">{entry.language}</span>
            {entry.framework && (
              <span className="chip bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">{entry.framework}</span>
            )}
          </div>
          <h3 className="font-semibold leading-snug">
            <Link to={`/errors/${entry.id}`} className="after:absolute after:inset-0 hover:text-accent-600 focus:outline-none dark:hover:text-accent-400">
              <Highlight text={entry.title} query={query} />
            </Link>
          </h3>
        </div>
        <button
          onClick={() => onToggleFavorite(entry)}
          className={`relative z-10 -mr-1 -mt-1 rounded-lg p-1.5 transition-colors ${entry.isFavorite ? 'text-amber-400' : 'text-ink-300 hover:text-amber-400 dark:text-ink-600'}`}
          aria-label={entry.isFavorite ? 'Aus Favoriten entfernen' : 'Als Favorit markieren'}
          aria-pressed={entry.isFavorite}
        >
          <Star className="h-5 w-5" fill={entry.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mt-3 rounded-md bg-ink-50 px-3 py-2 font-mono text-xs text-ink-600 dark:bg-ink-950 dark:text-ink-300">
        <p className="line-clamp-2 break-words [overflow-wrap:anywhere]">
          <Highlight text={firstLine} query={query} />
        </p>
      </div>

      {entry.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.tags.slice(0, 5).map((t) => (
            <span key={t} className="text-xs text-accent-700 dark:text-accent-400">#{t}</span>
          ))}
          {entry.tags.length > 5 && <span className="text-xs text-ink-400">+{entry.tags.length - 5}</span>}
        </div>
      )}

      <div className="min-h-4 flex-1" />
      <div className="flex items-center justify-between gap-2 border-t border-ink-100 pt-3 text-xs text-ink-500 dark:border-ink-800 dark:text-ink-400">
        <span className="flex min-w-0 items-center gap-1.5" title="Projektname">
          <FolderOpen className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate"><Highlight text={entry.projectName} query={query} /></span>
          <span className="shrink-0 text-ink-300 dark:text-ink-600">·</span>
          <span className="shrink-0" title={`Erstellt: ${entry.createdAt}`}>{relativeTime(entry.createdAt)}</span>
        </span>
        <span className="relative z-10 flex shrink-0 gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          <Link to={`/errors/${entry.id}/edit`} className="rounded p-1.5 hover:bg-ink-100 hover:text-ink-800 dark:hover:bg-ink-800 dark:hover:text-ink-100" aria-label="Bearbeiten" title="Bearbeiten">
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <button onClick={() => onDuplicate(entry)} className="rounded p-1.5 hover:bg-ink-100 hover:text-ink-800 dark:hover:bg-ink-800 dark:hover:text-ink-100" aria-label="Duplizieren" title="Duplizieren">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(entry)} className="rounded p-1.5 hover:bg-rose-500/10 hover:text-rose-500" aria-label="Löschen" title="Löschen">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>
    </article>
  );
}
