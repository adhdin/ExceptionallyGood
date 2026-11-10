# ErrorVault · ExceptionallyGood

Persönliches Fehlerarchiv für Exceptions, Stacktraces und Fehlermeldungen – inklusive Ursache, Lösung und Code-Snippet.
Alle Daten bleiben lokal im Browser (IndexedDB).

## Start

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # Typecheck + Production-Build
```

## Features

- **Dashboard** – Anzahl Fehler, unterschiedliche Projektnamen, Kategorien, Favoriten, zuletzt hinzugefügt, Live-Suche
- **CRUD** – Anlegen, Bearbeiten, Löschen (mit Sicherheitsabfrage), Duplizieren, Favoriten
- **Live-Suche** über Titel, Fehlertext, Exception-Namen, Projektname, Sprache, Framework, Kategorie, Tags, Ursache und Lösung
- **Filter** nach Projektname, Sprache, Framework, Kategorie, Favoriten · **Sortierung** neueste/älteste/alphabetisch/zuletzt bearbeitet (Filter stehen in der URL)
- **Detailansicht** mit gut lesbarer Fehlermeldung, Syntax-Highlighting (highlight.js), hervorgehobener Lösung und Copy-Buttons
- **IndexedDB** mit automatischem Speichern, **JSON-Export** und **JSON-Import mit Validierung** (zusammenführen oder ersetzen)
- Dark Mode (Standard) / Light Mode, responsive Sidebar
- 21 Beispieleinträge (Spring Boot REST API & React Frontend, Sept. 2024 – Dez. 2025)

Der **Projektname** ist bewusst nur ein Freitextfeld am Fehler – es gibt keine Projektverwaltung.

## Struktur

```
src/
  types/        Datenmodell (ErrorEntry)
  db/           IndexedDB-Repository + Beispieldaten
  context/      ErrorStore (CRUD-State), Theme, Toasts
  hooks/        URL-Filter, Aktionen (Löschen/Duplizieren/Favorit), Copy
  lib/          Suche/Filter/Sortierung, Validierung, Import/Export, Highlighting
  components/   Layout (Sidebar), UI-Bausteine, ErrorCard, FilterBar
  pages/        Dashboard, Liste/Favoriten, Detail, Formular, Einstellungen
```

Stack: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router, IndexedDB (`idb`).
