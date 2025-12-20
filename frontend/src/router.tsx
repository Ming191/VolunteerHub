import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './routes/root.route';
import {
    signinRoute,
    signupRoute,
    verifyEmailRoute,
    testRoute
} from './routes/auth.routes';
import {
    authenticatedLayoutRoute,
    dashboardRoute,
    indexRoute,
    organizerAnalyticsRoute
} from './routes/dashboard.routes';
import {
    eventsRoute,
    myEventsRoute,
    myRegistrationsRoute,
    eventDetailsRoute,
    eventAboutRoute,
    eventCommunityRoute,
    eventAttendeesRoute,
    eventGalleryRoute,
    postDetailsRoute
} from './routes/events.routes';
import {
    profileRoute,
    profileByIdRoute,
    notificationsRoute,
    settingsRoute
} from './routes/user.routes';
import {
    adminPendingEventsRoute,
    adminUsersRoute,
    adminReportsRoute,
    adminSettingsRoute
} from './routes/admin.routes';

// 6. Create Router
const routeTree = rootRoute.addChildren([
    signinRoute,
    signupRoute,
    verifyEmailRoute,
    testRoute,
    authenticatedLayoutRoute.addChildren([
        indexRoute,
        dashboardRoute,
        organizerAnalyticsRoute,
        eventsRoute,
        profileRoute,
        profileByIdRoute,
        notificationsRoute,
        settingsRoute,
        myEventsRoute,
        adminPendingEventsRoute,
        adminUsersRoute,
        myRegistrationsRoute,
        eventDetailsRoute.addChildren([
            eventAboutRoute,
            eventCommunityRoute,
            eventAttendeesRoute,
            eventGalleryRoute,
        ]),
        postDetailsRoute,
        adminReportsRoute,
        adminSettingsRoute,
    ]),
]);

export const router = createRouter({
    routeTree,
    context: {
        auth: undefined!,
    },
    defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
