export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 ring-1 ring-ink-700 dark:bg-ink-850">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden>
          <path d="M9 10h14M9 16h9M9 22h14" stroke="#34d3a5" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">ErrorVault</div>
        <div className="text-[11px] text-ink-400">ExceptionallyGood</div>
      </div>
    </div>
  );
}
