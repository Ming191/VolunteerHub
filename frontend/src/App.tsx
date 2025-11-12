import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Import Layouts and Route Guards
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Import Page Components
import LoginScreen from './components/auth/LoginScreen';
import SignUpScreen from './components/auth/SignUpScreen';
import EmailVerificationScreen from './components/auth/EmailVerificationScreen';

// Import a Toaster for notifications
import { Toaster } from '@/components/ui/sonner';
import EventListScreen from "@/components/event/EventListScreen.tsx";
import DateTimePicker from "@/components/event/DateTimePicker.tsx";
import AdminPendingEvents from "@/pages/AdminPendingEvents.tsx";

// --- Placeholder Pages (to be replaced in later phases) ---
const Dashboard = () => <div className="text-3xl font-bold">Welcome to your Dashboard!</div>;
const MyEvents = () => <div className="text-3xl font-bold">My Events (Organizer)</div>;
// -----------------------------------------------------------

function App() {
    const location = useLocation();

    return (
        <>
            <AnimatePresence mode="wait" initial={false}>
                <Routes location={location} key={location.pathname}>
                    {/* ============================================= */}
                    {/*           Public Routes                       */}
                    {/* ============================================= */}
                    <Route path="/signin" element={<LoginScreen />} />
                    <Route path="/signup" element={<SignUpScreen />} />
                    <Route path="/verify-email" element={<EmailVerificationScreen />} />
                    <Route path="/test" element={<DateTimePicker onChange={() => {}} />} />
                    {/* ============================================= */}
                    {/*           Protected Routes                    */}
                    {/* ============================================= */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>
                            {/* Redirect root path to the dashboard */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />

                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/events" element={<EventListScreen  />} />


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