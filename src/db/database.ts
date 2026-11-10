import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ErrorEntry } from '../types/error';

const DB_NAME = 'errorvault';
const DB_VERSION = 1;

interface VaultSchema extends DBSchema {
  errors: {
    key: string;
    value: ErrorEntry;
    indexes: { createdAt: string; updatedAt: string };
  };
  meta: {
    key: string;
    value: { key: string; value: unknown };
  };
}

let dbPromise: Promise<IDBPDatabase<VaultSchema>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<VaultSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('errors')) {
          const store = db.createObjectStore('errors', { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('updatedAt', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

/** Datenzugriffsschicht – die UI spricht nie direkt mit IndexedDB. */
export const errorRepository = {
  async getAll(): Promise<ErrorEntry[]> {
    return (await getDb()).getAll('errors');
  },

  async put(entry: ErrorEntry): Promise<void> {
    await (await getDb()).put('errors', entry);
  },

  async putMany(entries: ErrorEntry[]): Promise<void> {
    const db = await getDb();
    const tx = db.transaction('errors', 'readwrite');
    await Promise.all([...entries.map((e) => tx.store.put(e)), tx.done]);
  },

  async delete(id: string): Promise<void> {
    await (await getDb()).delete('errors', id);
  },

  async replaceAll(entries: ErrorEntry[]): Promise<void> {
    const db = await getDb();
    const tx = db.transaction('errors', 'readwrite');
    await tx.store.clear();
    await Promise.all([...entries.map((e) => tx.store.put(e)), tx.done]);
  },

  async getMeta<T>(key: string): Promise<T | undefined> {
    const row = await (await getDb()).get('meta', key);
    return row?.value as T | undefined;
  },

  async setMeta(key: string, value: unknown): Promise<void> {
    await (await getDb()).put('meta', { key, value });
  },
};
