import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bug, FolderOpen, Layers, Plus, SearchX, Star } from 'lucide-react';
import { useErrorStore } from '../context/ErrorStoreContext';
import { useFilterOptions } from '../hooks/useFilterOptions';
import { applyFilters, defaultFilters, sortEntries } from '../lib/search';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { SearchInput } from '../components/ui/SearchInput';
import { ErrorGrid } from '../components/ErrorGrid';
import { EmptyState } from '../components/ui/EmptyState';

export function DashboardPage() {
  const { entries } = useErrorStore();
  const opts = useFilterOptions();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const recent = useMemo(() => sortEntries(entries, 'newest').slice(0, 4), [entries]);
  const favorites = useMemo(() => sortEntries(entries.filter((e) => e.isFavorite), 'updated'), [entries]);
  const results = useMemo(() => (query.trim() ? applyFilters(entries, { ...defaultFilters, query }) : []), [entries, query]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Dein persönliches Archiv für Exceptions, Stacktraces und hart erkämpfte Lösungen."
        actions={
          <Link to="/errors/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Neuen Fehler hinzufügen
          </Link>
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/errors?q=${encodeURIComponent(query.trim())}`);
        }}
      >
        <SearchInput value={query} onChange={setQuery} large />
      </form>

      {query.trim() ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
              {results.length} {results.length === 1 ? 'Treffer' : 'Treffer'} für „{query.trim()}“
            </h2>
            <Link to={`/errors?q=${encodeURIComponent(query.trim())}`} className="flex items-center gap-1 text-sm text-accent-600 hover:underline dark:text-accent-400">
              Mit Filtern öffnen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {results.length ? (
            <ErrorGrid entries={results.slice(0, 6)} query={query} />
          ) : (
            <EmptyState icon={SearchX} title="Nix gefunden" text="Probier einen anderen Begriff – z. B. eine Exception, ein Tag oder einen Projektnamen." />
          )}
          {results.length > 6 && (
            <div className="mt-4 text-center">
              <Link to={`/errors?q=${encodeURIComponent(query.trim())}`} className="btn-secondary">
                Alle {results.length} Treffer anzeigen
              </Link>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Bug} label="Gespeicherte Fehler" value={entries.length} />
            <StatCard icon={FolderOpen} label="Projektnamen" value={opts.projects.length} hint="unterschiedliche Namen" />
            <StatCard icon={Layers} label="Fehlerkategorien" value={opts.categories.length} />
            <StatCard icon={Star} label="Favoriten" value={favorites.length} />
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Zuletzt hinzugefügt</h2>
              <Link to="/errors" className="flex items-center gap-1 text-sm text-accent-600 hover:underline dark:text-accent-400">
                Alle anzeigen <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {recent.length ? (
              <ErrorGrid entries={recent} cols="compact" />
            ) : (
              <EmptyState
                icon={Bug}
                title="Dein Vault ist noch leer"
                text="Leg deinen ersten Fehler an – Future You wird's dir danken."
                action={<Link to="/errors/new" className="btn-primary"><Plus className="h-4 w-4" /> Ersten Fehler anlegen</Link>}
              />
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Star className="h-5 w-5 text-amber-400" fill="currentColor" /> Favoriten
              </h2>
              {favorites.length > 0 && (
                <Link to="/favorites" className="flex items-center gap-1 text-sm text-accent-600 hover:underline dark:text-accent-400">
                  Alle Favoriten <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            {favorites.length ? (
              <div className="card divide-y divide-ink-100 dark:divide-ink-800">
                {favorites.slice(0, 6).map((e) => (
                  <Link key={e.id} to={`/errors/${e.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-850">
                    <Star className="h-4 w-4 shrink-0 text-amber-400" fill="currentColor" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{e.title}</div>
                      <div className="truncate text-xs text-ink-500">{e.projectName} · {e.category}</div>
                    </div>
                    <span className="hidden shrink-0 text-xs text-ink-400 sm:block">{e.framework || e.language}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-300 dark:text-ink-600" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={Star} title="Noch keine Favoriten" text="Markiere wichtige Fehler mit dem Stern, um sie hier schnell wiederzufinden." />
            )}
          </section>
        </>
      )}
    </div>
  );
}
