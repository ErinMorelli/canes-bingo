import { Navigate, Route, Routes } from 'react-router-dom';
import { App, ConfigProvider, theme } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@app/queryClient';

import { AuthProvider } from './context/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './components/LoginPage';
import { SquaresPage } from './pages/SquaresPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { GroupsPage } from './pages/GroupsPage';
import { PatternsPage } from './pages/PatternsPage';
import { GamesPage } from './pages/GamesPage';
import { UsersPage } from './pages/UsersPage';
import { ConfigPage } from './pages/ConfigPage';

const AdminApp = () => (
  <QueryClientProvider client={queryClient}>
  <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
    <App>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="config" replace />} />
            <Route path="config"     element={<ConfigPage />} />
            <Route path="squares"    element={<SquaresPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="groups"     element={<GroupsPage />} />
            <Route path="patterns"   element={<PatternsPage />} />
            <Route path="games"      element={<GamesPage />} />
            <Route path="users"      element={<UsersPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </App>
  </ConfigProvider>
  </QueryClientProvider>
);

export default AdminApp;
