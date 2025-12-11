import { createRouter, createRoute, createRootRouteWithContext, redirect, Outlet, Link } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { type AuthContextType } from '@/features/auth/context/AuthContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { SuspenseFallback } from '@/components/common/SuspenseFallback';
import { GravityStarsBackground } from "@/components/animate-ui/components/backgrounds/gravity-stars.tsx";
import { Toaster } from '@/components/ui/sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Lazy load components
const TabbedAuthScreen = lazy(() => import('@/features/auth/components/TabbedAuthScreen').then(m => ({ default: m.TabbedAuthScreen })));
const EmailVerificationScreen = lazy(() => import('@/features/auth/components/EmailVerificationScreen').then(m => ({ default: m.EmailVerificationScreen })));
const VolunteerDashboard = lazy(() => import('@/features/volunteer/pages/VolunteerDashboard').then(m => ({ default: m.VolunteerDashboard })));
const OrganizerDashboard = lazy(() => import('@/features/organizer/pages/OrganizerDashboard').then(m => ({ default: m.OrganizerDashboard })));
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const EventListPage = lazy(() => import('@/features/events/pages/EventListPage').then(m => ({ default: m.EventListScreen })));
const ProfilePage = lazy(() => import('@/features/users/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const MyEventsPage = lazy(() => import('@/features/events/pages/MyEventsPage').then(m => ({ default: m.MyEventsScreen })));
const AdminPendingEvents = lazy(() => import('@/features/admin/pages/AdminPendingEvents').then(m => ({ default: m.AdminPendingEvents })));
const AdminUsers = lazy(() => import('@/features/admin/pages/AdminUsers').then(m => ({ default: m.AdminUsers })));
const MyRegistrationsScreen = lazy(() => import('@/features/events/pages/MyRegistrationsPage').then(m => ({ default: m.MyRegistrationsScreen })));
const DateTimePicker = lazy(() => import('@/features/events/components/DateTimePicker').then(m => ({ default: m.DateTimePicker })));

// 1. Create Root Route
interface RouterContext {
    auth: AuthContextType;
}

import { useQueryClient } from '@tanstack/react-query';
import { fcmService } from "@/features/notifications/services/fcmService.ts";
import { toast } from 'sonner';
import { useEffect } from 'react';

const rootRoute = createRootRouteWithContext<RouterContext>()({
    component: () => {
        const queryClient = useQueryClient();

        // Setup FCM foreground message listener
        useEffect(() => {
            const unsubscribe = fcmService.setupForegroundMessageListener((payload) => {
                const title = payload.notification?.title || 'New Notification';
                const body = payload.notification?.body || '';

                toast.info(title, {
                    description: body,
                    duration: 5000,
                });

                // Invalidate notification queries to update UI
                queryClient.invalidateQueries({ queryKey: ['recentNotifications'] });
                queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
            });

            return () => {
                if (unsubscribe) {
                    unsubscribe();
                }
            };
        }, [queryClient]);

        return (
            <>
                <div className="fixed inset-0 -z-10">
                    <GravityStarsBackground
                        starsCount={100}
                        starsSize={2}
                        starsOpacity={0.75}
                        glowIntensity={15}
                        glowAnimation="ease"
                        movementSpeed={0.3}
                        mouseInfluence={150}
                        mouseGravity="attract"
                        gravityStrength={75}
                        starsInteraction={true}
                        starsInteractionType="bounce"
                    />
                </div>
                <ErrorBoundary>
                    <Outlet />
                    <Toaster richColors position="top-right" />
                </ErrorBoundary>
            </>
        );
    },
    notFoundComponent: () => <div className="p-4 text-white">Page Not Found <Link to="/" className="underline">Go Home</Link></div>,
});

// 2. Public Routes
const signinRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/signin',
    component: () => <Suspense fallback={<SuspenseFallback />}><TabbedAuthScreen /></Suspense>,
});

const signupRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/signup',
    component: () => <Suspense fallback={<SuspenseFallback />}><TabbedAuthScreen /></Suspense>,
});

import { z } from 'zod';

const verifyEmailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/verify-email',
    validateSearch: z.object({
        token: z.string().optional(),
    }),
    component: () => <Suspense fallback={<SuspenseFallback />}><EmailVerificationScreen /></Suspense>,
});

const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/test',
    component: () => <Suspense fallback={<SuspenseFallback />}><DateTimePicker onChange={() => { }} /></Suspense>,
});


// 3. Protected Routes Layout
const authenticatedLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'authenticated',
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated && !context.auth.isLoading) {
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

    if (!user) return null;

    return (
        <Suspense fallback={<SuspenseFallback />}>
            {user.role === 'ADMIN' && <AdminDashboard />}
            {user.role === 'EVENT_ORGANIZER' && <OrganizerDashboard />}
            {(user.role === 'VOLUNTEER' || !user.role) && <VolunteerDashboard />}
        </Suspense>
    );
};

const dashboardRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/dashboard',
    component: DashboardRouter,
});

const indexRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/',
    beforeLoad: () => {
        throw redirect({ to: '/dashboard' });
    }
});


// 5. Protected Feature Routes
const eventsRoute = createRoute({
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

const profileRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/profile',
    component: () => <Suspense fallback={<SuspenseFallback />}><ProfilePage /></Suspense>,
});

const notificationsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/notifications',
    component: () => <Suspense fallback={<SuspenseFallback />}><NotificationsPage /></Suspense>,
});

const myEventsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/my-events',
    component: () => <Suspense fallback={<SuspenseFallback />}><MyEventsPage /></Suspense>,
});

const adminPendingEventsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/admin/pending-events',
    component: () => <Suspense fallback={<SuspenseFallback />}><AdminPendingEvents /></Suspense>,
});

const adminUsersRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/admin/users',
    component: () => <Suspense fallback={<SuspenseFallback />}><AdminUsers /></Suspense>,
});

const myRegistrationsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/my-registrations',
    component: () => <Suspense fallback={<SuspenseFallback />}><MyRegistrationsScreen /></Suspense>,
});

const adminReportsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/admin/reports',
    component: () => <div className="p-8 text-center text-muted-foreground">Reports Feature Coming Soon</div>,
});

const adminSettingsRoute = createRoute({
    getParentRoute: () => authenticatedLayoutRoute,
    path: '/admin/settings',
    component: () => <div className="p-8 text-center text-muted-foreground">Settings Feature Coming Soon</div>,
});

// 6. Create Router
const routeTree = rootRoute.addChildren([
    indexRoute,
    signinRoute,
    signupRoute,
    verifyEmailRoute,
    testRoute,
    authenticatedLayoutRoute.addChildren([
        dashboardRoute,
        eventsRoute,
        profileRoute,
        notificationsRoute,
        myEventsRoute,
        adminPendingEventsRoute,
        adminUsersRoute,
        myRegistrationsRoute,
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
