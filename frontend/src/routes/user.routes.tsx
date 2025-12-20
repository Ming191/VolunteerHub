import { createRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { SuspenseFallback } from '@/components/common/SuspenseFallback';
import { authenticatedLayoutRoute } from './dashboard.routes';
import {
    ProfilePage,
    NotificationsPage,
    SettingsPage
} from './lazy-components';

export const profileRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/profile',
    component: () => <Suspense fallback={<SuspenseFallback />}><ProfilePage /></Suspense>,
});

export const profileByIdRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/profile/$userId',
    component: () => <Suspense fallback={<SuspenseFallback />}><ProfilePage /></Suspense>,
});

export const notificationsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/notifications',
    component: () => <Suspense fallback={<SuspenseFallback />}><NotificationsPage /></Suspense>,
});

export const settingsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/settings',
    component: () => <Suspense fallback={<SuspenseFallback />}><SettingsPage /></Suspense>,
});

