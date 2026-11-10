import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

type ToastKind = 'success' | 'error';
interface Toast { id: number; message: string; kind: ToastKind }

const Ctx = createContext<((message: string, kind?: ToastKind) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (message: string, kind: ToastKind = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, kind }]);
      setTimeout(() => dismiss(id), 3200);
    },
    [dismiss],
  );

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex animate-fade-in items-center gap-3 rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm shadow-lg dark:border-ink-700 dark:bg-ink-800"
          >
            {t.kind === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
            )}
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="ml-2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200" aria-label="Schließen">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast muss innerhalb von ToastProvider verwendet werden');
  return ctx;
}
