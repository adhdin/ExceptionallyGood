import type { ErrorEntry } from '../types/error';
import { validateImport, type ImportResult } from './validation';

export function exportToJson(entries: ErrorEntry[]): void {
  const payload = {
    app: 'ErrorVault',
    version: 1,
    exportedAt: new Date().toISOString(),
    count: entries.length,
    errors: entries,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `errorvault-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function parseImportFile(file: File): Promise<ImportResult> {
  if (file.size > 20 * 1024 * 1024) return { valid: [], issues: ['Datei ist größer als 20 MB.'] };
  let raw: unknown;
  try {
    raw = JSON.parse(await file.text());
  } catch {
    return { valid: [], issues: ['Die Datei ist kein gültiges JSON.'] };
  }
  return validateImport(raw);
}
