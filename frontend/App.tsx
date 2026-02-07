
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import Loader from './components/Loader';
import { useTourStore } from './store/useTourStore';
import ProtectedRoute from './components/ProtectedRoute';
import RootLayout from './components/RootLayout';
import PublicLayout from './components/PublicLayout';
import AppLayout from './components/AppLayout';
import WatchlistPage from './pages/WatchlistPage';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const Tour = lazy(() => import('./components/Tour'));

const AppContent: React.FC = () => {
  const isTourActive = useTourStore((state) => state.isTourActive);

  return (
    <RootLayout>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public routes with footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          
          {/* Standalone auth pages */}
          <Route path="/auth/sign-in" element={<SignInPage />} />
          <Route path="/auth/sign-up" element={<SignUpPage />} />

          {/* Protected app routes with side navigation */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/object/:id" element={<DetailPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="watchlist" element={<WatchlistPage />} />
          </Route>
        </Routes>
        {isTourActive && <Tour />}
      </Suspense>
    </RootLayout>
  )
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
