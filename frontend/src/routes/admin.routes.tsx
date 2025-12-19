import { createRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { SuspenseFallback } from '@/components/common/SuspenseFallback';
import { authenticatedLayoutRoute } from './dashboard.routes';
import {
    AdminPendingEvents,
    AdminUsers,
    AdminReportsPage
} from './lazy-components';

export const adminPendingEventsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/admin/pending-events',
    component: () => <Suspense fallback={<SuspenseFallback />}><AdminPendingEvents /></Suspense>,
});

export const adminUsersRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/admin/users',
    component: () => <Suspense fallback={<SuspenseFallback />}><AdminUsers /></Suspense>,
});

export const adminReportsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/admin/reports',
    component: () => <Suspense fallback={<SuspenseFallback />}><AdminReportsPage /></Suspense>,
});

export const adminSettingsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/admin/settings',
    component: () => <div className="p-8 text-center text-muted-foreground">Settings Feature Coming Soon</div>,
});
