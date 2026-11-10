import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useErrorStore } from '../context/ErrorStoreContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { ErrorEntry } from '../types/error';

/** Kapselt Favorit/Duplizieren/Löschen inkl. Sicherheitsabfrage – wiederverwendbar in Karten & Detailseite. */
export function useErrorActions(options: { afterDelete?: string } = {}) {
  const { toggleFavorite, duplicate, remove } = useErrorStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [pending, setPending] = useState<ErrorEntry | null>(null);

  const onToggleFavorite = useCallback(
    async (entry: ErrorEntry) => {
      await toggleFavorite(entry.id);
      toast(entry.isFavorite ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt ⭐');
    },
    [toggleFavorite, toast],
  );

  const onDuplicate = useCallback(
    async (entry: ErrorEntry) => {
      const copy = await duplicate(entry.id);
      toast('Eintrag dupliziert');
      navigate(`/errors/${copy.id}/edit`);
    },
    [duplicate, toast, navigate],
  );

  const onDelete = useCallback((entry: ErrorEntry) => setPending(entry), []);

  const confirmDelete = useCallback(async () => {
    if (!pending) return;
    try {
      await remove(pending.id);
      toast('Eintrag gelöscht');
      if (options.afterDelete) navigate(options.afterDelete);
    } catch {
      toast('Löschen fehlgeschlagen', 'error');
    } finally {
      setPending(null);
    }
  }, [pending, remove, toast, navigate, options.afterDelete]);

  const cancel = useCallback(() => setPending(null), []);

  const dialog = (
    <ConfirmDialog
      open={!!pending}
      title="Eintrag wirklich löschen?"
      description={
        <>
          „<span className="font-medium text-ink-700 dark:text-ink-200">{pending?.title}</span>“ wird dauerhaft aus deinem Vault entfernt. Das kann nicht rückgängig gemacht werden.
        </>
      }
      confirmLabel="Endgültig löschen"
      onConfirm={confirmDelete}
      onCancel={cancel}
    />
  );

  return { onToggleFavorite, onDuplicate, onDelete, dialog };
}
