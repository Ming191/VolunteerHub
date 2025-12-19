import { createRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { z } from 'zod';
import { SuspenseFallback } from '@/components/common/SuspenseFallback';
import { authenticatedLayoutRoute } from './dashboard.routes';
import {
    EventListPage,
    MyEventsPage,
    MyRegistrationsScreen,
    EventDetailsPage
} from './lazy-components';

export const eventsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/events',
    validateSearch: z.object({
        q: z.string().optional(),
        location: z.string().optional(),
        tags: z.array(z.string()).optional(),
        upcoming: z.boolean().optional(),
        matchAllTags: z.boolean().optional(),
        page: z.number().optional(),
        size: z.number().optional(),
    }),
    component: () => <Suspense fallback={<SuspenseFallback />}><EventListPage /></Suspense>,
});

export const eventDetailsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/events/$eventId',
    component: () => <Suspense fallback={<SuspenseFallback />}><EventDetailsPage /></Suspense>,
});

export const eventRegistrationRoute = createRoute({
    getParentRoute: () => eventDetailsRoute,
    path: 'registration',
    component: () => null, // Virtual route for tab state
});

export const myEventsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/my-events',
    validateSearch: z.object({
        action: z.enum(['create']).optional(),
    }),
    component: () => <Suspense fallback={<SuspenseFallback />}><MyEventsPage /></Suspense>,
});

export const myRegistrationsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/my-registrations',
    component: () => <Suspense fallback={<SuspenseFallback />}><MyRegistrationsScreen /></Suspense>,
});
