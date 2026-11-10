import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Logo } from './Logo';
import { useErrorStore } from '../../context/ErrorStoreContext';

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const { loading, error } = useErrorStore();
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Desktop-Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile-Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 animate-fade-in shadow-2xl">
            <Sidebar onNavigate={() => setOpen(false)} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-ink-800 dark:bg-ink-900/80 lg:hidden">
        <button onClick={() => setOpen(true)} className="btn-ghost p-2" aria-label="Menü öffnen">
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/"><Logo /></Link>
        <Link to="/errors/new" className="btn-primary p-2" aria-label="Neuer Fehler">
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {error ? (
          <div className="card border-rose-500/40 p-6 text-sm text-rose-500">{error}</div>
        ) : loading ? (
          <div className="flex items-center justify-center py-24 text-sm text-ink-400">
            <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
            Vault wird geladen …
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
