import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ErrorFilters, SortOption } from '../types/error';
import { defaultFilters, sortLabels } from '../lib/search';

const keys: Record<keyof Omit<ErrorFilters, 'favoritesOnly' | 'sort'>, string> = {
  query: 'q',
  projectName: 'project',
  language: 'lang',
  framework: 'fw',
  category: 'cat',
};

/** Filterzustand lebt in der URL → teilbar, bleibt beim Zurück-Navigieren erhalten. */
export function useUrlFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<ErrorFilters>(() => {
    const sort = params.get('sort') as SortOption | null;
    return {
      query: params.get(keys.query) ?? '',
      projectName: params.get(keys.projectName) ?? '',
      language: params.get(keys.language) ?? '',
      framework: params.get(keys.framework) ?? '',
      category: params.get(keys.category) ?? '',
      favoritesOnly: params.get('fav') === '1',
      sort: sort && sort in sortLabels ? sort : defaultFilters.sort,
    };
  }, [params]);

  const update = useCallback(
    (patch: Partial<ErrorFilters>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch) as [keyof ErrorFilters, unknown][]) {
            if (k === 'favoritesOnly') v ? next.set('fav', '1') : next.delete('fav');
            else if (k === 'sort') v && v !== defaultFilters.sort ? next.set('sort', String(v)) : next.delete('sort');
            else {
              const key = keys[k];
              v ? next.set(key, String(v)) : next.delete(key);
            }
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  /** Setzt Filter zurück; die Suchanfrage bleibt erhalten, außer clearQuery ist gesetzt. */
  const reset = useCallback(
    (clearQuery = false) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams();
          const q = prev.get('q');
          if (q && !clearQuery) next.set('q', q);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return { filters, update, reset };
}
