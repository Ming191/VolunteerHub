import { createRoute, redirect } from '@tanstack/react-router';
import { Suspense } from 'react';
import { rootRoute } from './root.route';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { SuspenseFallback } from '@/components/common/SuspenseFallback';
import {
    AdminDashboard,
    OrganizerDashboard,
    OrganizerAnalytics,
    VolunteerDashboard
} from './lazy-components';

// 3. Protected Routes Layout
export const authenticatedLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: '_auth',
    beforeLoad: ({ context }) => {
        // If auth is still loading, allow the route to load
        // The component will show a loading state
        if (context.auth.isLoading) {
            return;
        }
        
        // If auth finished loading and user is not authenticated, redirect
        if (!context.auth.isAuthenticated) {
            throw redirect({
                to: '/signin',
            });
        }
    },
    component: () => <DashboardLayout />,
});

// 4. Dashboard Logic (Route splitting based on role)
const DashboardRouter = () => {
    const { user } = useAuth();

    if (!user) {
        // Show a loading or safe default state instead of a blank screen
        return <SuspenseFallback />;
    }

    const role = user.role ?? 'VOLUNTEER';

    return (
        <Suspense fallback={<SuspenseFallback />}>
            {role === 'ADMIN' ? (
                <AdminDashboard />
            ) : role === 'EVENT_ORGANIZER' ? (
                <OrganizerDashboard />
            ) : (
                // Default safe dashboard for VOLUNTEER or any unexpected role
                <VolunteerDashboard />
            )}
        </Suspense>
    );
};

export const dashboardRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/dashboard',
    component: DashboardRouter,
});

export const indexRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/',
    beforeLoad: () => {
        throw redirect({ to: '/dashboard' });
    }
});

export const organizerAnalyticsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/organizer/analytics',
    component: () => (
        <Suspense fallback={<SuspenseFallback />}>
            <OrganizerAnalytics />
        </Suspense>
    ),
});
