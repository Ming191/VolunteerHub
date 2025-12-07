import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

// Import Layouts and Route Guards
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Import Page Components
import TabbedAuthScreen from './components/auth/TabbedAuthScreen';
import EmailVerificationScreen from './components/auth/EmailVerificationScreen';

// Import a Toaster for notifications
import { Toaster } from '@/components/ui/sonner';
import EventListScreen from "@/components/event/EventListScreen.tsx";
import DateTimePicker from "@/components/event/DateTimePicker.tsx";
import AdminPendingEvents from "@/pages/AdminPendingEvents.tsx";
import ProfilePage from "@/pages/ProfilePage.tsx";
import NotificationsPage from "@/pages/NotificationsPage.tsx";
import VolunteerDashboard from "@/pages/VolunteerDashboard.tsx";
import OrganizerDashboard from "@/pages/OrganizerDashboard.tsx";
import AdminDashboard from "@/pages/AdminDashboard.tsx";
import { GravityStarsBackground } from "@/components/animate-ui/components/backgrounds/gravity-stars.tsx";
import MyEventsScreen from "@/components/event/MyEventsScreen.tsx";
import { fcmService } from "@/services/fcmService.ts";
import { useAuth } from "@/hooks/useAuth";
import MyRegistrationsScreen from "@/pages/MyRegistrations.tsx";

// --- Placeholder Pages (to be replaced in later phases) ---
// const Dashboard = () => <div className="text-3xl font-bold">Welcome to your Dashboard!</div>;
//const MyEvents = () => <div className="text-3xl font-bold">My Events (Organizer)</div>;
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
        <>
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

            <AnimatePresence mode="wait" initial={false}>
                <Routes location={location} key={location.pathname}>
                    {/* ============================================= */}
                    {/*           Public Routes                       */}
                    {/* ============================================= */}
                    <Route path="/signin" element={<TabbedAuthScreen />} />
                    <Route path="/signup" element={<TabbedAuthScreen />} />
                    <Route path="/verify-email" element={<EmailVerificationScreen />} />
                    <Route path="/test" element={<DateTimePicker onChange={() => {}} />} />
                    {/* ============================================= */}
                    {/*           Protected Routes                    */}
                    {/* ============================================= */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>
                            {/* Redirect the root path to the dashboard */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />

                            <Route path="/dashboard" element={<DashboardRouter />} />
                            <Route path="/events" element={<EventListScreen  />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/notifications" element={<NotificationsPage />} />

                            {/* Role-specific routes can be nested here too */}
                            <Route path="/my-events" element={<MyEventsScreen />} />
                            <Route path="/admin/pending-events" element={<AdminPendingEvents />} />

                            <Route path="/my-registrations" element={<MyRegistrationsScreen />} />
                        </Route>
                    </Route>

                    {/* Add a 404 Not Found route here if desired */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AnimatePresence>

            {/* Toaster for notifications, available on all pages */}
            <Toaster richColors position="top-right" />
        </>
    );
}

export default App;
