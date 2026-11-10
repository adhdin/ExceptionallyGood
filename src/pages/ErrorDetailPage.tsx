import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CalendarPlus, CheckCircle2, Copy, FileQuestion, FolderOpen, Lightbulb, NotebookPen, Pencil, Star, Terminal, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useErrorStore } from '../context/ErrorStoreContext';
import { useErrorActions } from '../hooks/useErrorActions';
import { extractExceptionNames, formatDateTime } from '../lib/format';
import { CodeBlock } from '../components/ui/CodeBlock';
import { CopyButton } from '../components/ui/CopyButton';
import { EmptyState } from '../components/ui/EmptyState';

function Section({ icon: Icon, title, children, actions }: { icon: typeof Terminal; title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
          <Icon className="h-4 w-4" /> {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="shrink-0 text-ink-500 dark:text-ink-400">{label}</dt>
      <dd className="min-w-0 text-right font-medium">{children}</dd>
    </div>
  );
}

export function ErrorDetailPage() {
  const { id = '' } = useParams();
  const { getById } = useErrorStore();
  const navigate = useNavigate();
  const { onToggleFavorite, onDuplicate, onDelete, dialog } = useErrorActions({ afterDelete: '/errors' });
  const entry = getById(id);

  if (!entry) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Eintrag nicht gefunden"
        text="Dieser Fehler existiert nicht (mehr). Vielleicht wurde er gelöscht."
        action={<Link to="/errors" className="btn-primary">Zur Übersicht</Link>}
      />
    );
  }

  const exceptions = extractExceptionNames(entry.errorMessage);
  const filterLink = (key: string, value: string) => `/errors?${key}=${encodeURIComponent(value)}`;

  return (
    <div className="animate-fade-in">
      <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/errors'))} className="btn-ghost -ml-3 mb-4">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>

      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <Link to={filterLink('cat', entry.category)} className="chip bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400">{entry.category}</Link>
          <Link to={filterLink('lang', entry.language)} className="chip bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700">{entry.language}</Link>
          {entry.framework && (
            <Link to={filterLink('fw', entry.framework)} className="chip bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700">{entry.framework}</Link>
          )}
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{entry.title}</h1>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button onClick={() => onToggleFavorite(entry)} className="btn-secondary" aria-pressed={entry.isFavorite}>
              <Star className={`h-4 w-4 ${entry.isFavorite ? 'text-amber-400' : ''}`} fill={entry.isFavorite ? 'currentColor' : 'none'} />
              {entry.isFavorite ? 'Favorit' : 'Favorisieren'}
            </button>
            <Link to={`/errors/${entry.id}/edit`} className="btn-secondary"><Pencil className="h-4 w-4" /> Bearbeiten</Link>
            <button onClick={() => onDuplicate(entry)} className="btn-secondary"><Copy className="h-4 w-4" /> Duplizieren</button>
            <button onClick={() => onDelete(entry)} className="btn-secondary hover:!border-rose-500/50 hover:!text-rose-500"><Trash2 className="h-4 w-4" /> Löschen</button>
          </div>
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-8">
          <Section icon={Terminal} title="Originale Fehlermeldung" actions={<CopyButton text={entry.errorMessage} label="Kopieren" className="btn-ghost px-2 py-1 text-xs" />}>
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-rose-500/25 bg-rose-50/60 p-4 font-mono text-[13px] leading-6 text-rose-900 dark:border-rose-500/20 dark:bg-rose-950/20 dark:text-rose-200">
              {entry.errorMessage}
            </pre>
          </Section>

          {entry.cause && (
            <Section icon={Lightbulb} title="Ursache">
              <p className="whitespace-pre-wrap leading-relaxed text-ink-700 dark:text-ink-300">{entry.cause}</p>
            </Section>
          )}

          <section className="rounded-xl border border-accent-500/40 bg-accent-50 p-5 shadow-[0_0_0_4px_rgba(16,185,138,0.06)] dark:bg-accent-500/[0.07]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-semibold text-accent-700 dark:text-accent-300">
                <CheckCircle2 className="h-5 w-5" /> Lösung
              </h2>
              <CopyButton text={entry.solution} label="Lösung kopieren" />
            </div>
            <p className="whitespace-pre-wrap leading-relaxed text-ink-800 dark:text-ink-100">{entry.solution}</p>
          </section>

          {entry.codeSnippet && (
            <Section icon={Terminal} title="Code-Snippet">
              <CodeBlock
                code={entry.codeSnippet}
                languageHint={entry.language}
                header={<CopyButton text={entry.codeSnippet} label="Code kopieren" className="btn-ghost px-2 py-1 text-xs" />}
              />
            </Section>
          )}

          {entry.notes && (
            <Section icon={NotebookPen} title="Notizen">
              <p className="whitespace-pre-wrap rounded-xl border border-dashed border-ink-200 p-4 leading-relaxed text-ink-700 dark:border-ink-700 dark:text-ink-300">{entry.notes}</p>
            </Section>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-10 xl:self-start">
          <div className="card px-4 py-1.5">
            <dl className="divide-y divide-ink-100 dark:divide-ink-800">
              <MetaRow label="Projektname">
                <Link to={filterLink('project', entry.projectName)} className="inline-flex items-center gap-1.5 hover:text-accent-600 dark:hover:text-accent-400" title="Alle Fehler mit diesem Projektnamen">
                  <FolderOpen className="h-3.5 w-3.5" /> {entry.projectName}
                </Link>
              </MetaRow>
              <MetaRow label="Sprache">{entry.language}</MetaRow>
              <MetaRow label="Framework">{entry.framework || '–'}</MetaRow>
              <MetaRow label="Kategorie">{entry.category}</MetaRow>
              {exceptions.length > 0 && (
                <MetaRow label="Exceptions">
                  <span className="flex flex-col items-end gap-0.5 font-mono text-xs">
                    {exceptions.map((x) => <span key={x} className="break-all">{x}</span>)}
                  </span>
                </MetaRow>
              )}
            </dl>
          </div>

          {entry.tags.length > 0 && (
            <div className="card p-4">
              <div className="label">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((t) => (
                  <Link key={t} to={`/errors?q=${encodeURIComponent(t)}`} className="chip bg-accent-500/10 text-accent-700 hover:bg-accent-500/20 dark:text-accent-300">#{t}</Link>
                ))}
              </div>
            </div>
          )}

          <div className="card space-y-2 p-4 text-xs text-ink-500 dark:text-ink-400">
            <div className="flex items-center gap-2"><CalendarPlus className="h-3.5 w-3.5" /> Erstellt: {formatDateTime(entry.createdAt)}</div>
            <div className="flex items-center gap-2"><CalendarClock className="h-3.5 w-3.5" /> Geändert: {formatDateTime(entry.updatedAt)}</div>
          </div>
        </aside>
      </div>
      {dialog}
    </div>
  );
}
