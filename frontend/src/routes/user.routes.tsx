import { createRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { SuspenseFallback } from '@/components/common/SuspenseFallback';
import { authenticatedLayoutRoute } from './dashboard.routes';
import {
    ProfilePage,
    NotificationsPage
} from './lazy-components';

export const profileRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/profile',
    component: () => <Suspense fallback={<SuspenseFallback />}><ProfilePage /></Suspense>,
});

export const notificationsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/notifications',
    component: () => <Suspense fallback={<SuspenseFallback />}><NotificationsPage /></Suspense>,
});
