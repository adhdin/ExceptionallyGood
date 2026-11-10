import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, ListTree, Moon, Plus, Settings, Star, Sun, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useErrorStore } from '../../context/ErrorStoreContext';
import { Logo } from './Logo';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/errors', label: 'Alle Fehler', icon: ListTree, end: false, count: 'all' as const },
  { to: '/favorites', label: 'Favoriten', icon: Star, end: true, count: 'fav' as const },
  { to: '/settings', label: 'Einstellungen', icon: Settings, end: true },
];

export function Sidebar({ onNavigate, onClose }: { onNavigate?: () => void; onClose?: () => void }) {
  const { theme, toggle } = useTheme();
  const { entries } = useErrorStore();
  const counts = { all: entries.length, fav: entries.filter((e) => e.isFavorite).length };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-ink-200 bg-white px-3 py-4 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center justify-between px-2">
        <Link to="/" onClick={onNavigate}><Logo /></Link>
        {onClose && (
          <button onClick={onClose} className="btn-ghost p-1.5 lg:hidden" aria-label="Menü schließen">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <Link to="/errors/new" onClick={onNavigate} className="btn-primary mx-1 mt-6">
        <Plus className="h-4 w-4" /> Neuer Fehler
      </Link>

      <nav className="mt-6 flex flex-col gap-0.5" aria-label="Hauptnavigation">
        {nav.map(({ to, label, icon: Icon, end, count }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent-500/10 text-accent-700 dark:text-accent-300'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {count && <span className="text-xs tabular-nums text-ink-400">{counts[count]}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-1">
        <button onClick={toggle} className="btn-ghost w-full justify-start" aria-label="Theme umschalten">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <p className="mt-3 px-3 text-[11px] leading-relaxed text-ink-400">
          Alle Daten bleiben lokal in deinem Browser (IndexedDB).
        </p>
      </div>
    </aside>
  );
}
