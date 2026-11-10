import { Route, Routes, useParams } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ErrorListPage } from './pages/ErrorListPage';
import { ErrorDetailPage } from './pages/ErrorDetailPage';
import { ErrorFormPage } from './pages/ErrorFormPage';
import { SettingsPage } from './pages/SettingsPage';
import { EmptyState } from './components/ui/EmptyState';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

/** key erzwingt frischen Formular-State beim Wechsel zwischen Einträgen. */
function EditRoute() {
  const { id } = useParams();
  return <ErrorFormPage key={id} />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="errors" element={<ErrorListPage />} />
        <Route path="favorites" element={<ErrorListPage key="fav" favoritesView />} />
        <Route path="errors/new" element={<ErrorFormPage key="new" />} />
        <Route path="errors/:id" element={<ErrorDetailPage />} />
        <Route path="errors/:id/edit" element={<EditRoute />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route
          path="*"
          element={<EmptyState icon={Compass} title="Seite nicht gefunden" text="404 – diese Route gibt's nicht." action={<Link to="/" className="btn-primary">Zum Dashboard</Link>} />}
        />
      </Route>
    </Routes>
  );
}
