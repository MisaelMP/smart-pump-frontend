import React, { useEffect, Suspense } from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth, useAuthActions } from '@/stores/authStore';
import { ROUTES } from '@/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load components for better performance
const LoginForm = React.lazy(() => import('@/components/auth/LoginForm'));
const Dashboard = React.lazy(() => import('@/components/dashboard/Dashboard'));
const NotFound = React.lazy(() => import('@/components/common/NotFound'));

const App: React.FC = () => {
	const { isAuthenticated, user } = useAuth();
	const { validateToken } = useAuthActions();

	useEffect(() => {
		// Validate token on app startup if user appears to be authenticated
		if (isAuthenticated && user) {
			validateToken().catch(() => {
				// Token validation failed, user will be logged out automatically
				console.warn('Token validation failed on app startup');
			});
		}
	}, []);

	return (
		<Router>
			<div className='min-h-screen bg-gray-50'>
				<Suspense fallback={<LoadingSpinner />}>
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
