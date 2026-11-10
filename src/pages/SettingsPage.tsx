import { useRef, useState } from 'react';
import { AlertTriangle, Database, Download, FileJson, Moon, RotateCcw, Sun, Trash2, Upload } from 'lucide-react';
import { useErrorStore } from '../context/ErrorStoreContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { exportToJson, parseImportFile } from '../lib/importExport';
import type { ImportResult } from '../lib/validation';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

type Pending = 'reset' | 'clear' | 'replace' | null;

export function SettingsPage() {
  const { entries, importEntries, resetToSamples, clearAll } = useErrorStore();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<(ImportResult & { fileName: string }) | null>(null);
  const [pending, setPending] = useState<Pending>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    const result = await parseImportFile(file);
    setPreview({ ...result, fileName: file.name });
    if (fileRef.current) fileRef.current.value = '';
  };

  const doImport = async (mode: 'merge' | 'replace') => {
    if (!preview?.valid.length) return;
    try {
      await importEntries(preview.valid, mode);
      toast(`${preview.valid.length} Einträge importiert`);
      setPreview(null);
    } catch {
      toast('Import fehlgeschlagen', 'error');
    }
  };

  const confirm = async () => {
    const action = pending;
    setPending(null);
    if (action === 'reset') {
      await resetToSamples();
      toast('Beispieldaten wiederhergestellt');
    } else if (action === 'clear') {
      await clearAll();
      toast('Alle Einträge gelöscht');
    } else if (action === 'replace') {
      await doImport('replace');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Einstellungen" subtitle="Darstellung, Backup und Datenverwaltung." />

      <section className="card p-5 sm:p-6">
        <h2 className="font-semibold">Darstellung</h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Dark Mode ist Standard. Die Auswahl wird lokal gespeichert.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-sm">
          {(['dark', 'light'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                theme === t ? 'border-accent-500 bg-accent-500/10 text-accent-700 dark:text-accent-300' : 'border-ink-200 hover:bg-ink-100 dark:border-ink-700 dark:hover:bg-ink-800'
              }`}
              aria-pressed={theme === t}
            >
              {t === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {t === 'dark' ? 'Dark' : 'Light'}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-semibold"><FileJson className="h-4 w-4" /> Backup (JSON)</h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Exportiere alle {entries.length} Einträge als JSON oder importiere ein Backup. Beim Import wird jeder Eintrag validiert.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => { exportToJson(entries); toast('Export gestartet'); }} disabled={!entries.length}>
            <Download className="h-4 w-4" /> JSON exportieren
          </button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> JSON importieren
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>

        {preview && (
          <div className="mt-5 animate-fade-in rounded-lg border border-ink-200 p-4 dark:border-ink-700">
            <div className="text-sm">
              <span className="font-medium">{preview.fileName}</span>:{' '}
              <span className="text-accent-600 dark:text-accent-400">{preview.valid.length} gültig</span>
              {preview.issues.length > 0 && <span className="text-rose-500"> · {preview.issues.length} Problem(e)</span>}
            </div>
            {preview.issues.length > 0 && (
              <ul className="mt-3 max-h-40 space-y-1 overflow-auto rounded-md bg-rose-500/5 p-3 text-xs text-rose-600 dark:text-rose-400">
                {preview.issues.map((i, idx) => (
                  <li key={idx} className="flex gap-2"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {i}</li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-primary" disabled={!preview.valid.length} onClick={() => doImport('merge')}>
                Zusammenführen
              </button>
              <button className="btn-secondary" disabled={!preview.valid.length} onClick={() => setPending('replace')}>
                Bestehende ersetzen
              </button>
              <button className="btn-ghost" onClick={() => setPreview(null)}>Abbrechen</button>
            </div>
            <p className="mt-2 text-xs text-ink-400">Zusammenführen: Einträge mit gleicher ID werden überschrieben, neue hinzugefügt.</p>
          </div>
        )}
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-semibold"><Database className="h-4 w-4" /> Daten</h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Gespeichert in IndexedDB („errorvault“) – bleibt auch nach Browser-Neustart erhalten.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => setPending('reset')}>
            <RotateCcw className="h-4 w-4" /> Beispieldaten wiederherstellen
          </button>
          <button className="btn-secondary hover:!border-rose-500/50 hover:!text-rose-500" onClick={() => setPending('clear')} disabled={!entries.length}>
            <Trash2 className="h-4 w-4" /> Alle Einträge löschen
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={pending !== null}
        title={
          pending === 'reset' ? 'Beispieldaten wiederherstellen?' : pending === 'clear' ? 'Alle Einträge löschen?' : 'Bestehende Einträge ersetzen?'
        }
        description={
          pending === 'reset'
            ? 'Alle aktuellen Einträge werden durch die mitgelieferten Beispieldaten ersetzt. Exportiere vorher ein Backup, falls nötig.'
            : pending === 'clear'
              ? `Alle ${entries.length} Einträge werden dauerhaft gelöscht. Das kann nicht rückgängig gemacht werden.`
              : `Alle ${entries.length} vorhandenen Einträge werden gelöscht und durch ${preview?.valid.length ?? 0} importierte ersetzt.`
        }
        confirmLabel={pending === 'reset' ? 'Wiederherstellen' : pending === 'clear' ? 'Alles löschen' : 'Ersetzen'}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
