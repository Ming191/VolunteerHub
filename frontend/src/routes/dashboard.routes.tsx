import { createRoute, redirect } from '@tanstack/react-router';
import { Suspense } from 'react';
import { rootRoute } from './root.route';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { authStorage } from '@/features/auth/utils/authStorage';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { SuspenseFallback } from '@/components/common/SuspenseFallback';
import {
    AdminDashboard,
    OrganizerDashboard,
    VolunteerDashboard
} from './lazy-components';

// 3. Protected Routes Layout
export const authenticatedLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'authenticated',
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated && !context.auth.isLoading) {
            // Check storage as fallback to avoid race conditions during login
            // where React context hasn't updated yet but storage has.
            if (!authStorage.getAccessToken()) {
                throw redirect({
                    to: '/signin',
                });
            }
        }
    },
    component: () => <DashboardLayout />,
});

// 4. Dashboard Logic (Route splitting based on role)
const DashboardRouter = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <Suspense fallback={<SuspenseFallback />}>
            {user.role === 'ADMIN' && <AdminDashboard />}
            {user.role === 'EVENT_ORGANIZER' && <OrganizerDashboard />}
            {(user.role === 'VOLUNTEER' || !user.role) && <VolunteerDashboard />}
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
