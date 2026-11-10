export interface ErrorEntry {
  id: string;
  title: string;
  errorMessage: string;
  /** Freitext – bewusst keine Referenz auf eine Projekt-Entität. */
  projectName: string;
  language: string;
  framework: string;
  category: string;
  cause: string;
  solution: string;
  codeSnippet: string;
  notes: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Felder, die der Nutzer im Formular bearbeitet. */
export type ErrorDraft = Omit<ErrorEntry, 'id' | 'createdAt' | 'updatedAt'>;

export type SortOption = 'newest' | 'oldest' | 'title' | 'updated';

export interface ErrorFilters {
  query: string;
  projectName: string;
  language: string;
  framework: string;
  category: string;
  favoritesOnly: boolean;
  sort: SortOption;
}

export const emptyDraft: ErrorDraft = {
  title: '',
  errorMessage: '',
  projectName: '',
  language: '',
  framework: '',
  category: '',
  cause: '',
  solution: '',
  codeSnippet: '',
  notes: '',
  tags: [],
  isFavorite: false,
};
