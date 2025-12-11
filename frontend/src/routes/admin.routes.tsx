import { createRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { SuspenseFallback } from '@/components/common/SuspenseFallback';
import { authenticatedLayoutRoute } from './dashboard.routes';
import {
    AdminPendingEvents,
    AdminUsers
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
    component: () => <div className="p-8 text-center text-muted-foreground">Reports Feature Coming Soon</div>,
});

export const adminSettingsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/admin/settings',
    component: () => <div className="p-8 text-center text-muted-foreground">Settings Feature Coming Soon</div>,
});
