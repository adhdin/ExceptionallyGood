import type { ErrorDraft, ErrorEntry } from '../types/error';
import { createId } from './id';

export type FieldErrors = Partial<Record<keyof ErrorDraft, string>>;

const LIMITS = {
  title: 120,
  projectName: 80,
  language: 40,
  framework: 60,
  category: 60,
  tag: 30,
  tags: 15,
};

export function validateDraft(d: ErrorDraft): FieldErrors {
  const errors: FieldErrors = {};
  const req = (key: keyof ErrorDraft, label: string, max?: number) => {
    const v = String(d[key] ?? '').trim();
    if (!v) errors[key] = `${label} ist ein Pflichtfeld.`;
    else if (max && v.length > max) errors[key] = `${label} darf maximal ${max} Zeichen lang sein.`;
  };

  req('title', 'Titel', LIMITS.title);
  if (!errors.title && d.title.trim().length < 3) errors.title = 'Titel braucht mindestens 3 Zeichen.';
  req('errorMessage', 'Fehlermeldung');
  req('projectName', 'Projektname', LIMITS.projectName);
  req('language', 'Programmiersprache', LIMITS.language);
  req('category', 'Fehlerkategorie', LIMITS.category);
  req('solution', 'Lösung');
  if (d.framework.trim().length > LIMITS.framework)
    errors.framework = `Framework darf maximal ${LIMITS.framework} Zeichen lang sein.`;
  if (d.tags.length > LIMITS.tags) errors.tags = `Maximal ${LIMITS.tags} Tags erlaubt.`;
  else if (d.tags.some((t) => t.length > LIMITS.tag))
    errors.tags = `Ein Tag darf maximal ${LIMITS.tag} Zeichen lang sein.`;
  return errors;
}

export function normalizeTag(raw: string): string {
  return raw.trim().replace(/^#/, '').replace(/\s+/g, '-').toLowerCase();
}

export function normalizeDraft(d: ErrorDraft): ErrorDraft {
  return {
    ...d,
    title: d.title.trim(),
    errorMessage: d.errorMessage.replace(/\s+$/, ''),
    projectName: d.projectName.trim(),
    language: d.language.trim(),
    framework: d.framework.trim(),
    category: d.category.trim(),
    cause: d.cause.trim(),
    solution: d.solution.trim(),
    codeSnippet: d.codeSnippet.replace(/\s+$/, ''),
    notes: d.notes.trim(),
    tags: [...new Set(d.tags.map(normalizeTag).filter(Boolean))],
  };
}

/* ---------------- JSON-Import ---------------- */

export interface ImportResult {
  valid: ErrorEntry[];
  issues: string[];
}

const isIsoDate = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v));

export function validateImport(raw: unknown): ImportResult {
  const issues: string[] = [];
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { errors?: unknown }).errors)
      ? (raw as { errors: unknown[] }).errors
      : null;

  if (!list) {
    return { valid: [], issues: ['Die Datei enthält kein Array von Fehlereinträgen (erwartet: [...] oder { "errors": [...] }).'] };
  }

  const valid: ErrorEntry[] = [];
  const seenIds = new Set<string>();

  list.forEach((item, i) => {
    const pos = `Eintrag #${i + 1}`;
    if (!item || typeof item !== 'object') {
      issues.push(`${pos}: ist kein Objekt.`);
      return;
    }
    const o = item as Record<string, unknown>;
    const stringFields = [
      'title', 'errorMessage', 'projectName', 'language', 'framework',
      'category', 'cause', 'solution', 'codeSnippet', 'notes',
    ] as const;

    const wrongType = stringFields.filter((k) => o[k] !== undefined && typeof o[k] !== 'string');
    if (wrongType.length) {
      issues.push(`${pos}: Felder müssen Text sein: ${wrongType.join(', ')}.`);
      return;
    }
    if (o.tags !== undefined && (!Array.isArray(o.tags) || o.tags.some((t) => typeof t !== 'string'))) {
      issues.push(`${pos}: "tags" muss ein Array aus Strings sein.`);
      return;
    }
    if (o.isFavorite !== undefined && typeof o.isFavorite !== 'boolean') {
      issues.push(`${pos}: "isFavorite" muss true oder false sein.`);
      return;
    }
    for (const k of ['createdAt', 'updatedAt'] as const) {
      if (o[k] !== undefined && !isIsoDate(o[k])) {
        issues.push(`${pos}: "${k}" ist kein gültiges Datum.`);
        return;
      }
    }

    const draft: ErrorDraft = {
      title: (o.title as string) ?? '',
      errorMessage: (o.errorMessage as string) ?? '',
      projectName: (o.projectName as string) ?? '',
      language: (o.language as string) ?? '',
      framework: (o.framework as string) ?? '',
      category: (o.category as string) ?? '',
      cause: (o.cause as string) ?? '',
      solution: (o.solution as string) ?? '',
      codeSnippet: (o.codeSnippet as string) ?? '',
      notes: (o.notes as string) ?? '',
      tags: (o.tags as string[]) ?? [],
      isFavorite: (o.isFavorite as boolean) ?? false,
    };
    const fieldErrors = validateDraft(draft);
    const keys = Object.keys(fieldErrors);
    if (keys.length) {
      issues.push(`${pos} („${draft.title || 'ohne Titel'}“): ${Object.values(fieldErrors).join(' ')}`);
      return;
    }

    let id = typeof o.id === 'string' && o.id.trim() ? o.id.trim() : createId();
    if (seenIds.has(id)) id = createId();
    seenIds.add(id);

    const now = new Date().toISOString();
    const createdAt = isIsoDate(o.createdAt) ? new Date(o.createdAt).toISOString() : now;
    const updatedAt = isIsoDate(o.updatedAt) ? new Date(o.updatedAt).toISOString() : createdAt;
    valid.push({ ...normalizeDraft(draft), id, createdAt, updatedAt });
  });

  return { valid, issues };
}
