import { useMemo } from 'react';
import { highlightCode } from '../../lib/highlight';

interface Props {
  code: string;
  languageHint?: string;
  header?: React.ReactNode;
}

export function CodeBlock({ code, languageHint, header }: Props) {
  const { html, language } = useMemo(() => highlightCode(code, languageHint), [code, languageHint]);
  const lines = code.split('\n').length;

  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-950">
      <div className="flex items-center justify-between gap-2 border-b border-ink-200 px-4 py-2 dark:border-ink-800">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-400/70" />
          </span>
          <span className="font-mono text-xs text-ink-500">{language}</span>
        </div>
        {header}
      </div>
      <div className="flex overflow-x-auto text-[13px] leading-6">
        <div className="select-none border-r border-ink-200 px-3 py-4 text-right font-mono text-ink-400 dark:border-ink-800 dark:text-ink-600" aria-hidden>
          {Array.from({ length: lines }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="hljs flex-1 px-4 py-4 font-mono">
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    </div>
  );
}
