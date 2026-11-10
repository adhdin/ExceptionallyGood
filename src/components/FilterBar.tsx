import { SlidersHorizontal, Star, X } from 'lucide-react';
import type { ErrorFilters, SortOption } from '../types/error';
import { sortLabels } from '../lib/search';
import { useFilterOptions } from '../hooks/useFilterOptions';

interface Props {
  filters: ErrorFilters;
  onChange: (patch: Partial<ErrorFilters>) => void;
  onReset: () => void;
  hideFavoriteToggle?: boolean;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`input py-1.5 ${value ? 'border-accent-500/60' : ''}`}>
        <option value="">Alle</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export function FilterBar({ filters, onChange, onReset, hideFavoriteToggle }: Props) {
  const opts = useFilterOptions();
  const active =
    !!(filters.projectName || filters.language || filters.framework || filters.category) ||
    (!hideFavoriteToggle && filters.favoritesOnly);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="h-4 w-4 text-ink-400" /> Filter & Sortierung
        </span>
        {active && (
          <button onClick={onReset} className="flex items-center gap-1 text-xs text-ink-500 hover:text-rose-500">
            <X className="h-3.5 w-3.5" /> Filter zurücksetzen
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Select label="Projektname" value={filters.projectName} options={opts.projects} onChange={(v) => onChange({ projectName: v })} />
        <Select label="Sprache" value={filters.language} options={opts.languages} onChange={(v) => onChange({ language: v })} />
        <Select label="Framework" value={filters.framework} options={opts.frameworks} onChange={(v) => onChange({ framework: v })} />
        <Select label="Kategorie" value={filters.category} options={opts.categories} onChange={(v) => onChange({ category: v })} />
        <label className="col-span-2 flex min-w-0 flex-col gap-1 md:col-span-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Sortierung</span>
          <select value={filters.sort} onChange={(e) => onChange({ sort: e.target.value as SortOption })} className="input py-1.5">
            {(Object.keys(sortLabels) as SortOption[]).map((k) => (
              <option key={k} value={k}>{sortLabels[k]}</option>
            ))}
          </select>
        </label>
      </div>
      {!hideFavoriteToggle && (
        <label className="mt-3 inline-flex cursor-pointer select-none items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.favoritesOnly}
            onChange={(e) => onChange({ favoritesOnly: e.target.checked })}
            className="h-4 w-4 rounded border-ink-300 accent-amber-400"
          />
          <Star className="h-4 w-4 text-amber-400" /> Nur Favoriten
        </label>
      )}
    </div>
  );
}
