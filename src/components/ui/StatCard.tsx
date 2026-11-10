import type { LucideIcon } from 'lucide-react';

export function StatCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: number; hint?: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 text-xs text-ink-500 [overflow-wrap:anywhere] dark:text-ink-400 sm:text-sm">{label}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500/10 text-accent-600 dark:text-accent-400">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-400">{hint}</div>}
    </div>
  );
}
