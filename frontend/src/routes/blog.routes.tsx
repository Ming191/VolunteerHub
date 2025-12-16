import { createRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { SuspenseFallback } from '@/components/common/SuspenseFallback';
import { authenticatedLayoutRoute } from './dashboard.routes';
import { BlogPage } from './lazy-components';
import { z } from 'zod';

export const blogRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/blog',
    validateSearch: z.object({
        eventId: z.string().optional(),
    }),
    component: () => <Suspense fallback={<SuspenseFallback />}><BlogPage /></Suspense>,
});
