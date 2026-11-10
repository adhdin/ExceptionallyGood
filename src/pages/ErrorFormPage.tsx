import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileQuestion, Save, Star } from 'lucide-react';
import { useErrorStore } from '../context/ErrorStoreContext';
import { useToast } from '../context/ToastContext';
import { useFilterOptions } from '../hooks/useFilterOptions';
import { emptyDraft, type ErrorDraft } from '../types/error';
import { validateDraft, type FieldErrors } from '../lib/validation';
import { uniqueSorted } from '../lib/format';
import { PageHeader } from '../components/PageHeader';
import { Field } from '../components/ui/Field';
import { TagInput } from '../components/ui/TagInput';
import { EmptyState } from '../components/ui/EmptyState';

const DEFAULT_LANGUAGES = ['Java', 'TypeScript', 'JavaScript', 'Kotlin', 'SQL', 'YAML'];
const DEFAULT_FRAMEWORKS = ['Spring Boot', 'Spring Security', 'Spring Data JPA', 'Hibernate', 'React', 'React Router', 'Vite', 'Node.js'];
const DEFAULT_CATEGORIES = ['TypeError', 'SyntaxError', 'ReferenceError', 'Runtime Error', 'NullPointerException', 'CORS Error', 'Validation', 'Configuration', 'Logic Error', 'UI Bug'];

export function ErrorFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const { getById, create, update } = useErrorStore();
  const opts = useFilterOptions();
  const toast = useToast();
  const navigate = useNavigate();
  const existing = id ? getById(id) : undefined;

  const [draft, setDraft] = useState<ErrorDraft>(() => {
    if (!existing) return emptyDraft;
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = existing;
    return { ...rest, tags: [...rest.tags] };
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Live-Validierung nach dem ersten Absendeversuch
  useEffect(() => {
    if (submitted) setErrors(validateDraft(draft));
  }, [draft, submitted]);

  const suggestions = useMemo(
    () => ({
      languages: uniqueSorted([...opts.languages, ...DEFAULT_LANGUAGES]),
      frameworks: uniqueSorted([...opts.frameworks, ...DEFAULT_FRAMEWORKS]),
      categories: uniqueSorted([...opts.categories, ...DEFAULT_CATEGORIES]),
    }),
    [opts],
  );

  if (isEdit && !existing) {
    return <EmptyState icon={FileQuestion} title="Eintrag nicht gefunden" action={<Link to="/errors" className="btn-primary">Zur Übersicht</Link>} />;
  }

  const set = <K extends keyof ErrorDraft>(key: K, value: ErrorDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const v = validateDraft(draft);
    setErrors(v);
    const firstInvalid = Object.keys(v)[0];
    if (firstInvalid) {
      document.getElementById(`f-${firstInvalid}`)?.focus();
      toast('Bitte die markierten Felder prüfen', 'error');
      return;
    }
    setSaving(true);
    try {
      const saved = isEdit ? await update(id!, draft) : await create(draft);
      toast(isEdit ? 'Änderungen gespeichert' : 'Fehler im Vault gespeichert 🔒');
      navigate(`/errors/${saved.id}`, { replace: true });
    } catch {
      toast('Speichern fehlgeschlagen', 'error');
      setSaving(false);
    }
  };

  const input = (key: keyof ErrorDraft) => ({
    id: `f-${key}`,
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `f-${key}-error` : undefined,
    className: `input ${errors[key] ? 'input-error' : ''}`,
  });

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost -ml-3 mb-4">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>
      <PageHeader
        title={isEdit ? 'Fehler bearbeiten' : 'Neuen Fehler hinzufügen'}
        subtitle={isEdit ? 'Änderungsdatum wird beim Speichern automatisch aktualisiert.' : 'Erstellungs- und Änderungsdatum werden automatisch gespeichert.'}
      />

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <div className="card space-y-5 p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Fehler</h2>
          <Field id="f-title" label="Titel" required error={errors.title} hint="Ein eigener, wiedererkennbarer Name für das Problem.">
            <input {...input('title')} value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="z. B. CORS blockt Requests vom Vite-Dev-Server" maxLength={140} />
          </Field>
          <Field id="f-errorMessage" label="Originale Fehlermeldung" required error={errors.errorMessage} hint="Vollständiger Fehlertext, Exception oder Stacktrace – oder eine eigene Beschreibung.">
            <textarea {...input('errorMessage')} className={`${input('errorMessage').className} min-h-[140px] font-mono text-[13px]`} value={draft.errorMessage} onChange={(e) => set('errorMessage', e.target.value)} placeholder="java.lang.NullPointerException: Cannot invoke ..." spellCheck={false} />
          </Field>
        </div>

        <div className="card grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <h2 className="text-sm font-semibold sm:col-span-2">Kontext</h2>
          <Field id="f-projectName" label="Projektname" required error={errors.projectName} hint="Freitext – nur eine Info zum Fehler.">
            <input {...input('projectName')} list="dl-projects" value={draft.projectName} onChange={(e) => set('projectName', e.target.value)} placeholder="z. B. Backend API" />
          </Field>
          <Field id="f-language" label="Programmiersprache" required error={errors.language}>
            <input {...input('language')} list="dl-languages" value={draft.language} onChange={(e) => set('language', e.target.value)} placeholder="z. B. Java" />
          </Field>
          <Field id="f-framework" label="Framework / Technologie" error={errors.framework}>
            <input {...input('framework')} list="dl-frameworks" value={draft.framework} onChange={(e) => set('framework', e.target.value)} placeholder="z. B. Spring Boot" />
          </Field>
          <Field id="f-category" label="Fehlerkategorie" required error={errors.category}>
            <input {...input('category')} list="dl-categories" value={draft.category} onChange={(e) => set('category', e.target.value)} placeholder="z. B. TypeError" />
          </Field>
          <datalist id="dl-projects">{opts.projects.map((v) => <option key={v} value={v} />)}</datalist>
          <datalist id="dl-languages">{suggestions.languages.map((v) => <option key={v} value={v} />)}</datalist>
          <datalist id="dl-frameworks">{suggestions.frameworks.map((v) => <option key={v} value={v} />)}</datalist>
          <datalist id="dl-categories">{suggestions.categories.map((v) => <option key={v} value={v} />)}</datalist>
        </div>

        <div className="card space-y-5 p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Analyse & Lösung</h2>
          <Field id="f-cause" label="Ursache" error={errors.cause} hint="Warum ist der Fehler aufgetreten?">
            <textarea {...input('cause')} className={`${input('cause').className} min-h-[100px]`} value={draft.cause} onChange={(e) => set('cause', e.target.value)} />
          </Field>
          <Field id="f-solution" label="Lösung" required error={errors.solution} hint="Wie hast du den Fehler behoben?">
            <textarea {...input('solution')} className={`${input('solution').className} min-h-[120px] border-accent-500/40`} value={draft.solution} onChange={(e) => set('solution', e.target.value)} />
          </Field>
          <Field id="f-codeSnippet" label="Code-Snippet" error={errors.codeSnippet} hint="Optional – wird mit Syntax-Highlighting angezeigt.">
            <textarea
              {...input('codeSnippet')}
              className={`${input('codeSnippet').className} min-h-[160px] font-mono text-[13px]`}
              value={draft.codeSnippet}
              onChange={(e) => set('codeSnippet', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  const t = e.currentTarget;
                  const { selectionStart: s, selectionEnd: end } = t;
                  const next = draft.codeSnippet.slice(0, s) + '  ' + draft.codeSnippet.slice(end);
                  set('codeSnippet', next);
                  requestAnimationFrame(() => t.setSelectionRange(s + 2, s + 2));
                }
              }}
              spellCheck={false}
            />
          </Field>
          <Field id="f-notes" label="Notizen" error={errors.notes}>
            <textarea {...input('notes')} className={`${input('notes').className} min-h-[80px]`} value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
          </Field>
          <Field id="f-tags" label="Tags" error={errors.tags} hint="Enter oder Komma zum Hinzufügen.">
            <TagInput id="f-tags" value={draft.tags} onChange={(t) => set('tags', t)} suggestions={opts.tags} invalid={!!errors.tags} />
          </Field>
          <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.isFavorite} onChange={(e) => set('isFavorite', e.target.checked)} className="h-4 w-4 accent-amber-400" />
            <Star className="h-4 w-4 text-amber-400" /> Als Favorit markieren
          </label>
        </div>

        <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-ink-200 bg-ink-50/90 px-4 py-3 backdrop-blur dark:border-ink-800 dark:bg-ink-950/90 sm:mx-0 sm:rounded-xl sm:border">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Abbrechen</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? 'Speichert …' : isEdit ? 'Änderungen speichern' : 'Fehler speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}
