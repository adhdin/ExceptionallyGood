import type { ErrorEntry } from '../types/error';
import { useErrorActions } from '../hooks/useErrorActions';
import { ErrorCard } from './ErrorCard';

export function ErrorGrid({ entries, query, cols = 'default' }: { entries: ErrorEntry[]; query?: string; cols?: 'default' | 'compact' }) {
  const actions = useErrorActions();
  return (
    <>
      <div className={`grid gap-4 ${cols === 'compact' ? 'md:grid-cols-2' : 'md:grid-cols-2 2xl:grid-cols-3'}`}>
        {entries.map((e) => (
          <ErrorCard key={e.id} entry={e} query={query} {...actions} />
        ))}
      </div>
      {actions.dialog}
    </>
  );
}
