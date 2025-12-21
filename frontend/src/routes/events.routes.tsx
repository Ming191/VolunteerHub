import { createRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { z } from 'zod';
import { SuspenseFallback } from '@/components/common/SuspenseFallback';
import { authenticatedLayoutRoute } from './dashboard.routes';
import {
    EventListPage,
    MyEventsPage,
    MyRegistrationsScreen,
    EventDetailsPage,
    PostDetailsPage,
    EventAboutRoute,
    EventCommunityRoute,
    EventAttendeesRoute,
    EventGalleryRoute
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

export const eventAboutRoute = createRoute({
    getParentRoute: () => eventDetailsRoute,
    path: '/',
    component: () => <Suspense fallback={<SuspenseFallback />}><EventAboutRoute /></Suspense>,
});

export const eventCommunityRoute = createRoute({
    getParentRoute: () => eventDetailsRoute,
    path: 'posts',
    component: () => <Suspense fallback={<SuspenseFallback />}><EventCommunityRoute /></Suspense>,
});

export const eventAttendeesRoute = createRoute({
    getParentRoute: () => eventDetailsRoute,
    path: 'attendees',
    component: () => <Suspense fallback={<SuspenseFallback />}><EventAttendeesRoute /></Suspense>,
});

export const eventGalleryRoute = createRoute({
    getParentRoute: () => eventDetailsRoute,
    path: 'gallery',
    component: () => <Suspense fallback={<SuspenseFallback />}><EventGalleryRoute /></Suspense>,
});

export const postDetailsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/events/$eventId/posts/$postId',
    component: () => <Suspense fallback={<SuspenseFallback />}><PostDetailsPage /></Suspense>,
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
