import { useEffect, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './lib/store';
import { AppShell } from './components/AppShell';
import { ToastProvider } from './components/Sheet';
import { ConfirmProvider } from './components/Confirm';
import Login from './screens/Login';
import Recover from './screens/Recover';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import CalendarScreen from './screens/CalendarScreen';
import Schedules from './screens/Schedules';
import ServiceDetail from './screens/ServiceDetail';
import ServiceEditor from './screens/ServiceEditor';
import Repertoire from './screens/Repertoire';
import UsersScreen from './screens/UsersScreen';
import Profile from './screens/Profile';
import SettingsScreen from './screens/SettingsScreen';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function Protected({ children }: { children: ReactNode }) {
  const { currentUser, state } = useApp();
  if (state.pendingEmail && !currentUser) return <Navigate to="/entrar/novo" replace />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { currentUser, state } = useApp();
  if (currentUser) return <Navigate to="/" replace />;
  if (state.pendingEmail) return <Navigate to="/entrar/novo" replace />;
  return <>{children}</>;
}

function SignupRoute({ children }: { children: ReactNode }) {
  const { currentUser, state } = useApp();
  if (currentUser) return <Navigate to="/" replace />;
  if (!state.pendingEmail) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <ToastProvider>
          <ConfirmProvider>
            <ScrollToTop />
            <Routes>
              <Route
                path="/login"
                element={
                  <GuestOnly>
                    <Login />
                  </GuestOnly>
                }
              />
              <Route
                path="/recuperar"
                element={
                  <GuestOnly>
                    <Recover />
                  </GuestOnly>
                }
              />
              <Route
                path="/entrar/novo"
                element={
                  <SignupRoute>
                    <Onboarding />
                  </SignupRoute>
                }
              />
              <Route
                path="/"
                element={
                  <Protected>
                    <Home />
                  </Protected>
                }
              />
              <Route
                path="/calendario"
                element={
                  <Protected>
                    <CalendarScreen />
                  </Protected>
                }
              />
              <Route
                path="/escalas"
                element={
                  <Protected>
                    <Schedules />
                  </Protected>
                }
              />
              <Route
                path="/escalas/nova"
                element={
                  <Protected>
                    <ServiceEditor />
                  </Protected>
                }
              />
              <Route
                path="/escalas/:id"
                element={
                  <Protected>
                    <ServiceDetail />
                  </Protected>
                }
              />
              <Route
                path="/escalas/:id/editar"
                element={
                  <Protected>
                    <ServiceEditor />
                  </Protected>
                }
              />
              <Route
                path="/repertorio"
                element={
                  <Protected>
                    <Repertoire />
                  </Protected>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <Protected>
                    <UsersScreen />
                  </Protected>
                }
              />
              <Route
                path="/perfil"
                element={
                  <Protected>
                    <Profile />
                  </Protected>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <Protected>
                    <SettingsScreen />
                  </Protected>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </AppProvider>
    </HashRouter>
  );
}
