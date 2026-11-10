import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, SearchX, Star } from 'lucide-react';
import { useErrorStore } from '../context/ErrorStoreContext';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { applyFilters } from '../lib/search';
import { PageHeader } from '../components/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterBar } from '../components/FilterBar';
import { ErrorGrid } from '../components/ErrorGrid';
import { EmptyState } from '../components/ui/EmptyState';

/** Wird für „Alle Fehler“ und „Favoriten“ verwendet. */
export function ErrorListPage({ favoritesView = false }: { favoritesView?: boolean }) {
  const { entries } = useErrorStore();
  const { filters, update, reset } = useUrlFilters();

  const results = useMemo(
    () => applyFilters(entries, favoritesView ? { ...filters, favoritesOnly: true } : filters),
    [entries, filters, favoritesView],
  );
  const base = favoritesView ? entries.filter((e) => e.isFavorite).length : entries.length;

  return (
    <div className="space-y-5">
      <PageHeader
        title={favoritesView ? (<span className="flex items-center gap-2"><Star className="h-7 w-7 text-amber-400" fill="currentColor" /> Favoriten</span>) : 'Alle Fehler'}
        subtitle={`${results.length} von ${base} ${favoritesView ? 'Favoriten' : 'Einträgen'}`}
        actions={
          <Link to="/errors/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Neuer Fehler
          </Link>
        }
      />

      <SearchInput value={filters.query} onChange={(q) => update({ query: q })} autoFocus={!favoritesView && !!filters.query} />
      <FilterBar filters={filters} onChange={update} onReset={() => reset()} hideFavoriteToggle={favoritesView} />

      {results.length ? (
        <ErrorGrid entries={results} query={filters.query} />
      ) : base === 0 ? (
        <EmptyState
          icon={favoritesView ? Star : Plus}
          title={favoritesView ? 'Noch keine Favoriten' : 'Noch keine Fehler gespeichert'}
          text={favoritesView ? 'Klick bei einem Fehler auf den Stern, um ihn hier zu sammeln.' : 'Leg los und dokumentier deinen ersten Fehler.'}
          action={!favoritesView && <Link to="/errors/new" className="btn-primary"><Plus className="h-4 w-4" /> Fehler anlegen</Link>}
        />
      ) : (
        <EmptyState
          icon={SearchX}
          title="Keine Treffer"
          text="Für diese Suche bzw. Filterkombination gibt es keine Einträge."
          action={<button className="btn-secondary" onClick={() => reset(true)}>Suche & Filter zurücksetzen</button>}
        />
      )}
    </div>
  );
}
