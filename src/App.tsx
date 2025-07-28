import React, { useEffect, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from '@/stores/authStore';
import { useValidateToken } from '@/hooks/useAuth/useAuth';
import { ROUTES } from '@/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { FullScreenLoader } from '@/components/ui/LoadingSpinner';

// Lazy load components for better performance
const LoginForm = React.lazy(
  () => import('@/components/auth/LoginForm/LoginForm')
);
const Dashboard = React.lazy(() => import('@/components/dashboard/Dashboard'));
const NotFound = React.lazy(
  () => import('@/components/common/NotFound/NotFound')
);

const App: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { refetch: validateToken } = useValidateToken();

  useEffect(() => {
    // Only validate token on app startup if user appears to be authenticated
    // Add a small delay to prevent immediate validation loops
    if (isAuthenticated && user) {
      const timer = setTimeout(() => {
        validateToken().catch(() => {
          // Token validation failed, auth state will be cleared automatically
          // Development logging only
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn('Token validation failed on app startup');
          }
        });
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
    return undefined;
    // Only run on app startup, not when auth state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router>
      <div className='min-h-screen bg-gray-50'>
        <Suspense
          fallback={<FullScreenLoader message='Loading application...' />}
        >
          <Routes>
            {/* Public Routes */}
            <Route
              path={ROUTES.LOGIN}
              element={
                isAuthenticated ? (
                  <Navigate to={ROUTES.DASHBOARD} replace />
                ) : (
                  <LoginForm />
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to appropriate page */}
            <Route
              path={ROUTES.HOME}
              element={
                <Navigate
                  to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN}
                  replace
                />
              }
            />

            {/* Legacy routes for compatibility */}
            <Route
              path={ROUTES.PROFILE}
              element={<Navigate to={ROUTES.DASHBOARD} replace />}
            />

            <Route
              path={ROUTES.BALANCE}
              element={<Navigate to={ROUTES.DASHBOARD} replace />}
            />

            {/* 404 Page */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Suspense>

        {/* Global Toast Notifications */}
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: 'black',
              border: '1px solid #e5e7eb',
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;
