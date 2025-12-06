import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

// Import Layouts and Route Guards
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Import Error Boundary and Loading Components
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { SuspenseFallback } from '@/components/common/SuspenseFallback';

// Import Page Components (Lazy Loaded)
const TabbedAuthScreen = lazy(() => import('./components/auth/TabbedAuthScreen'));
const EmailVerificationScreen = lazy(() => import('./components/auth/EmailVerificationScreen'));
const EventListScreen = lazy(() => import('@/components/event/EventListScreen'));
const DateTimePicker = lazy(() => import('@/components/event/DateTimePicker'));
const AdminPendingEvents = lazy(() => import('@/pages/AdminPendingEvents'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const VolunteerDashboard = lazy(() => import('@/pages/VolunteerDashboard'));
const OrganizerDashboard = lazy(() => import('@/pages/OrganizerDashboard'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/AdminUsers'));

// Import a Toaster for notifications
import { Toaster } from '@/components/ui/sonner';
import { GravityStarsBackground } from "@/components/animate-ui/components/backgrounds/gravity-stars.tsx";
import { fcmService } from "@/services/fcmService.ts";
import { useAuth } from "@/hooks/useAuth";

// --- Placeholder Pages (to be replaced in later phases) ---
const MyEvents = () => <div className="text-3xl font-bold">My Events (Organizer)</div>;
// -----------------------------------------------------------

// Dashboard Router Component
const DashboardRouter = () => {
    const { user } = useAuth();

    if (!user) return null;

    switch (user.role) {
        case 'ADMIN':
            return <AdminDashboard />;
        case 'EVENT_ORGANIZER':
            return <OrganizerDashboard />;
        case 'VOLUNTEER':
        default:
            return <VolunteerDashboard />;
    }
};

function App() {
    const location = useLocation();
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
        <ErrorBoundary>
            {/* Gravity Stars Background for the entire app */}
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

            <Suspense fallback={<SuspenseFallback variant="default" />}>
                <AnimatePresence mode="wait" initial={false}>
                    <Routes location={location} key={location.pathname}>
                        {/* ============================================= */}
                        {/*           Public Routes                       */}
                        {/* ============================================= */}
                        <Route path="/signin" element={<TabbedAuthScreen />} />
                        <Route path="/signup" element={<TabbedAuthScreen />} />
                        <Route path="/verify-email" element={<EmailVerificationScreen />} />
                        <Route path="/test" element={<DateTimePicker onChange={() => { }} />} />
                        {/* ============================================= */}
                        {/*           Protected Routes                    */}
                        {/* ============================================= */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<DashboardLayout />}>
                                {/* Redirect the root path to the dashboard */}
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                                <Route path="/dashboard" element={<DashboardRouter />} />
                                <Route path="/events" element={<EventListScreen />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/notifications" element={<NotificationsPage />} />

                                {/* Role-specific routes can be nested here too */}
                                <Route path="/my-events" element={<MyEvents />} />
                                <Route path="/admin/pending-events" element={<AdminPendingEvents />} />
                                <Route path="/admin/users" element={<AdminUsers />} />
                            </Route>
                        </Route>

                        {/* Add a 404 Not Found route here if desired */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AnimatePresence>
            </Suspense>

            {/* Toaster for notifications, available on all pages */}
            <Toaster richColors position="top-right" />
        </ErrorBoundary>
    );
}

export default App;