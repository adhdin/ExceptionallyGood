import type { LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-ink-800">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-500 dark:text-ink-400">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
