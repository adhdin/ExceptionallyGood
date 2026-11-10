const dateFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86_400_000;
  if (diff < 60_000) return 'gerade eben';
  if (diff < 3_600_000) return `vor ${Math.floor(diff / 60_000)} Min.`;
  if (diff < day) return `vor ${Math.floor(diff / 3_600_000)} Std.`;
  if (diff < day * 30) {
    const d = Math.floor(diff / day);
    return d === 1 ? 'gestern' : `vor ${d} Tagen`;
  }
  return formatDate(iso);
}

/** Extrahiert Exception-/Error-Namen wie "NullPointerException" oder "TypeError". */
export function extractExceptionNames(text: string): string[] {
  const matches = text.match(/\b[A-Z][A-Za-z0-9]*(?:Exception|Error)\b/g) ?? [];
  return [...new Set(matches)];
}

export function uniqueSorted(values: string[]): string[] {
  const map = new Map<string, string>();
  for (const v of values) {
    const t = v.trim();
    if (t && !map.has(t.toLowerCase())) map.set(t.toLowerCase(), t);
  }
  return [...map.values()].sort((a, b) => a.localeCompare(b, 'de'));
}
