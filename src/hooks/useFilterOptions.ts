import { useMemo } from 'react';
import { useErrorStore } from '../context/ErrorStoreContext';
import { uniqueSorted } from '../lib/format';

/** Abgeleitete Werte für Filter-Dropdowns und Autocomplete. */
export function useFilterOptions() {
  const { entries } = useErrorStore();
  return useMemo(
    () => ({
      projects: uniqueSorted(entries.map((e) => e.projectName)),
      languages: uniqueSorted(entries.map((e) => e.language)),
      frameworks: uniqueSorted(entries.map((e) => e.framework)),
      categories: uniqueSorted(entries.map((e) => e.category)),
      tags: uniqueSorted(entries.flatMap((e) => e.tags)),
    }),
    [entries],
  );
}
