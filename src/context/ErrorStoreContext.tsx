import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { errorRepository } from '../db/database';
import { getSeedEntries } from '../db/seed';
import { createId } from '../lib/id';
import { normalizeDraft } from '../lib/validation';
import type { ErrorDraft, ErrorEntry } from '../types/error';

const SEEDED_KEY = 'seeded';

interface ErrorStore {
  entries: ErrorEntry[];
  loading: boolean;
  error: string | null;
  getById: (id: string) => ErrorEntry | undefined;
  create: (draft: ErrorDraft) => Promise<ErrorEntry>;
  update: (id: string, draft: ErrorDraft) => Promise<ErrorEntry>;
  remove: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<ErrorEntry>;
  toggleFavorite: (id: string) => Promise<void>;
  importEntries: (entries: ErrorEntry[], mode: 'merge' | 'replace') => Promise<void>;
  resetToSamples: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const Ctx = createContext<ErrorStore | null>(null);

export function ErrorStoreProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ErrorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const seeded = await errorRepository.getMeta<boolean>(SEEDED_KEY);
        if (!seeded) {
          await errorRepository.putMany(getSeedEntries());
          await errorRepository.setMeta(SEEDED_KEY, true);
        }
        const all = await errorRepository.getAll();
        if (!cancelled) setEntries(all);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('IndexedDB konnte nicht geöffnet werden. Ist der private Modus aktiv?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getById = useCallback((id: string) => entries.find((e) => e.id === id), [entries]);

  const create = useCallback(async (draft: ErrorDraft) => {
    const now = new Date().toISOString();
    const entry: ErrorEntry = { ...normalizeDraft(draft), id: createId(), createdAt: now, updatedAt: now };
    await errorRepository.put(entry);
    setEntries((prev) => [...prev, entry]);
    return entry;
  }, []);

  const update = useCallback(
    async (id: string, draft: ErrorDraft) => {
      const existing = entries.find((e) => e.id === id);
      if (!existing) throw new Error('Eintrag nicht gefunden');
      const entry: ErrorEntry = {
        ...existing,
        ...normalizeDraft(draft),
        id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };
      await errorRepository.put(entry);
      setEntries((prev) => prev.map((e) => (e.id === id ? entry : e)));
      return entry;
    },
    [entries],
  );

  const remove = useCallback(async (id: string) => {
    await errorRepository.delete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const duplicate = useCallback(
    async (id: string) => {
      const src = entries.find((e) => e.id === id);
      if (!src) throw new Error('Eintrag nicht gefunden');
      const now = new Date().toISOString();
      const copy: ErrorEntry = {
        ...src,
        tags: [...src.tags],
        id: createId(),
        title: `${src.title} (Kopie)`.slice(0, 120),
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      };
      await errorRepository.put(copy);
      setEntries((prev) => [...prev, copy]);
      return copy;
    },
    [entries],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const src = entries.find((e) => e.id === id);
      if (!src) return;
      // Favorit-Status ist keine inhaltliche Änderung → updatedAt bleibt.
      const entry = { ...src, isFavorite: !src.isFavorite };
      await errorRepository.put(entry);
      setEntries((prev) => prev.map((e) => (e.id === id ? entry : e)));
    },
    [entries],
  );

  const importEntries = useCallback(async (incoming: ErrorEntry[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') await errorRepository.replaceAll(incoming);
    else await errorRepository.putMany(incoming);
    setEntries(await errorRepository.getAll());
  }, []);

  const resetToSamples = useCallback(async () => {
    await errorRepository.replaceAll(getSeedEntries());
    setEntries(await errorRepository.getAll());
  }, []);

  const clearAll = useCallback(async () => {
    await errorRepository.replaceAll([]);
    setEntries([]);
  }, []);

  const value = useMemo<ErrorStore>(
    () => ({ entries, loading, error, getById, create, update, remove, duplicate, toggleFavorite, importEntries, resetToSamples, clearAll }),
    [entries, loading, error, getById, create, update, remove, duplicate, toggleFavorite, importEntries, resetToSamples, clearAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useErrorStore(): ErrorStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useErrorStore muss innerhalb von ErrorStoreProvider verwendet werden');
  return ctx;
}
