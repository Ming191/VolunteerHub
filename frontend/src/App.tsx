import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

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
import { GravityStarsBackground } from "@/components/animate-ui/components/backgrounds/gravity-stars.tsx";

// --- Placeholder Pages (to be replaced in later phases) ---
const Dashboard = () => <div className="text-3xl font-bold">Welcome to your Dashboard!</div>;
const MyEvents = () => <div className="text-3xl font-bold">My Events (Organizer)</div>;
// -----------------------------------------------------------

function App() {
    const location = useLocation();

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

                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/events" element={<EventListScreen  />} />
                            <Route path="/profile" element={<ProfilePage />} />

                            {/* Role-specific routes can be nested here too */}
                            <Route path="/my-events" element={<MyEvents />} />
                            <Route path="/admin/pending-events" element={<AdminPendingEvents />} />
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