import type { ErrorEntry, ErrorFilters, SortOption } from '../types/error';
import { extractExceptionNames } from './format';

export const defaultFilters: ErrorFilters = {
  query: '',
  projectName: '',
  language: '',
  framework: '',
  category: '',
  favoritesOnly: false,
  sort: 'newest',
};

export const sortLabels: Record<SortOption, string> = {
  newest: 'Neueste zuerst',
  oldest: 'Älteste zuerst',
  title: 'Alphabetisch (Titel)',
  updated: 'Zuletzt bearbeitet',
};

function haystack(e: ErrorEntry): string {
  return [
    e.title,
    e.errorMessage,
    extractExceptionNames(e.errorMessage).join(' '),
    e.projectName,
    e.language,
    e.framework,
    e.category,
    e.tags.join(' '),
    e.cause,
    e.solution,
  ]
    .join('\n')
    .toLowerCase();
}

/** Alle Suchbegriffe (durch Leerzeichen getrennt) müssen vorkommen. */
export function matchesQuery(entry: ErrorEntry, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const text = haystack(entry);
  return terms.every((t) => text.includes(t));
}

const eq = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function applyFilters(entries: ErrorEntry[], f: ErrorFilters): ErrorEntry[] {
  const result = entries.filter(
    (e) =>
      (!f.projectName || eq(e.projectName, f.projectName)) &&
      (!f.language || eq(e.language, f.language)) &&
      (!f.framework || eq(e.framework, f.framework)) &&
      (!f.category || eq(e.category, f.category)) &&
      (!f.favoritesOnly || e.isFavorite) &&
      matchesQuery(e, f.query),
  );
  return sortEntries(result, f.sort);
}

export function sortEntries(entries: ErrorEntry[], sort: SortOption): ErrorEntry[] {
  const copy = [...entries];
  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'oldest':
      return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'de', { sensitivity: 'base' }));
    case 'updated':
      return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}
